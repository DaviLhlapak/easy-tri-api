import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { randomInt } from 'node:crypto';
import { DRIZZLE, type Database } from '../db/db.module.js';
import { sessions, users, verificationCodes } from '../db/schema.js';
import { maskCpf } from '../common/utils/mask.js';
import {
  OTP_DELIVERY_PORT,
  type OtpDeliveryPort,
} from '../notifications/ports/otp-delivery.port.js';
import type {
  RequestOtpBody,
  RequestOtpResponse,
} from './schemas/request-otp.schema.js';
import type { VerifyOtpResponse } from './schemas/verify-otp.schema.js';

const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 60 * 60 * 1000;
const SESSION_TTL = '1h';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly jwtService: JwtService,
    @Inject(OTP_DELIVERY_PORT) private readonly otpDelivery: OtpDeliveryPort,
  ) {}

  async requestOtp({
    name,
    cpf,
    phone,
  }: RequestOtpBody): Promise<RequestOtpResponse> {
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.cpf, cpf));

    let user: typeof users.$inferSelect;
    if (existingUser) {
      // Account already exists for this cpf: the submitted name/phone must
      // match what's on file, otherwise reject instead of overwriting it.
      if (
        !namesMatch(existingUser.name, name) ||
        existingUser.phone !== phone
      ) {
        throw new ConflictException(
          'name and phone do not match the account registered for this cpf',
        );
      }
      user = existingUser;
    } else {
      [user] = await this.db
        .insert(users)
        .values({ name, cpf, phone })
        .returning();
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    const [otpRequest] = await this.db
      .insert(verificationCodes)
      .values({ userId: user.id, code, expiresAt })
      .returning();

    await this.otpDelivery.sendOtp({
      phone: user.phone,
      name: user.name,
      code,
    });

    // The mock delivery adapter doesn't actually send anything anywhere, so
    // it's convenient (and safe) to also return the code in the response
    // when it's active. Real adapters (Twilio, email, ...) must not leak it.
    const isMockDelivery =
      (process.env.OTP_DELIVERY_DRIVER ?? 'mock') === 'mock';

    return {
      requestId: otpRequest.id,
      ...(isMockDelivery ? { code: otpRequest.code } : {}),
      expiresAt: otpRequest.expiresAt.toISOString(),
    };
  }

  async verifyOtp(requestId: string, code: string): Promise<VerifyOtpResponse> {
    const [otpRequest] = await this.db
      .select()
      .from(verificationCodes)
      .where(eq(verificationCodes.id, requestId));

    if (!otpRequest) {
      throw new UnauthorizedException('invalid requestId');
    }
    if (otpRequest.consumedAt) {
      throw new UnauthorizedException('code already used');
    }
    if (Date.now() > otpRequest.expiresAt.getTime()) {
      throw new UnauthorizedException('code expired');
    }
    if (otpRequest.code !== code) {
      throw new UnauthorizedException('invalid code');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, otpRequest.userId));
    if (!user) {
      throw new UnauthorizedException('user not found');
    }

    await this.db
      .update(verificationCodes)
      .set({ consumedAt: new Date() })
      .where(eq(verificationCodes.id, requestId));

    const [session] = await this.db
      .insert(sessions)
      .values({
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      })
      .returning();

    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        jti: session.id,
        cpf: user.cpf,
        name: user.name,
        phone: user.phone,
      },
      { expiresIn: SESSION_TTL },
    );

    return {
      session: token,
      user: {
        name: user.name,
        cpf: maskCpf(user.cpf),
        phone: user.phone,
      },
    };
  }
}

function namesMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
