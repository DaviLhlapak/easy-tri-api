import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, randomInt, randomUUID } from 'node:crypto';

interface OtpRequest {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  code: string;
  expiresAt: number;
  consumed: boolean;
}

interface Session {
  token: string;
  cpf: string;
  name: string;
  phone: string;
  createdAt: number;
}

const OTP_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class AuthService {
  // Mock storage. In a real implementation these would live in a
  // database/cache (e.g. Redis) instead of process memory.
  private readonly otpRequests = new Map<string, OtpRequest>();
  private readonly sessions = new Map<string, Session>();

  requestOtp(name: string, cpf: string, phone: string) {
    const normalizedName = name?.trim();
    const normalizedCpf = onlyDigits(cpf);
    const normalizedPhone = onlyDigits(phone);

    if (!normalizedName) {
      throw new BadRequestException('name is required');
    }
    if (normalizedCpf.length !== 11) {
      throw new BadRequestException('cpf must have 11 digits');
    }
    if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
      throw new BadRequestException('phone must have 10 or 11 digits');
    }

    const id = randomUUID();
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');

    this.otpRequests.set(id, {
      id,
      name: normalizedName,
      cpf: normalizedCpf,
      phone: normalizedPhone,
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

  verifyOtp(requestId: string, code: string) {
    if (!requestId || !code) {
      throw new BadRequestException('requestId and code are required');
    }

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

    const token = randomBytes(24).toString('hex');
    this.sessions.set(token, {
      token,
      cpf: otpRequest.cpf,
      name: otpRequest.name,
      phone: otpRequest.phone,
      createdAt: Date.now(),
    });

    return {
      session: token,
      user: {
        name: otpRequest.name,
        cpf: otpRequest.cpf,
        phone: otpRequest.phone,
      },
    };
  }
}

function onlyDigits(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}
