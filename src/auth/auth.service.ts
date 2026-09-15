import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomInt, randomUUID } from 'node:crypto';
import type {
  RequestOtpBody,
  RequestOtpResponse,
} from './schemas/request-otp.schema.js';
import type { VerifyOtpResponse } from './schemas/verify-otp.schema.js';

interface OtpRequest {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  code: string;
  expiresAt: number;
  consumed: boolean;
}

const OTP_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class AuthService {
  // Mock storage. In a real implementation this would live in a
  // database/cache (e.g. Redis) instead of process memory.
  private readonly otpRequests = new Map<string, OtpRequest>();

  constructor(private readonly jwtService: JwtService) {}

  requestOtp({ name, cpf, phone }: RequestOtpBody): RequestOtpResponse {
    const id = randomUUID();
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');

    this.otpRequests.set(id, {
      id,
      name,
      cpf,
      phone,
      code,
      expiresAt: Date.now() + OTP_TTL_MS,
      consumed: false,
    });

    // There is no real SMS/WhatsApp provider here, so the OTP code is
    // returned directly in the response as mock data instead of being sent
    // to the user's phone.
    return {
      requestId: id,
      code,
      expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    };
  }

  async verifyOtp(requestId: string, code: string): Promise<VerifyOtpResponse> {
    const otpRequest = this.otpRequests.get(requestId);
    if (!otpRequest) {
      throw new UnauthorizedException('invalid requestId');
    }
    if (otpRequest.consumed) {
      throw new UnauthorizedException('code already used');
    }
    if (Date.now() > otpRequest.expiresAt) {
      this.otpRequests.delete(requestId);
      throw new UnauthorizedException('code expired');
    }
    if (otpRequest.code !== code) {
      throw new UnauthorizedException('invalid code');
    }

    otpRequest.consumed = true;

    const session = await this.jwtService.signAsync({
      sub: otpRequest.cpf,
      name: otpRequest.name,
      phone: otpRequest.phone,
    });

    return {
      session,
      user: {
        name: otpRequest.name,
        cpf: otpRequest.cpf,
        phone: otpRequest.phone,
      },
    };
  }
}
