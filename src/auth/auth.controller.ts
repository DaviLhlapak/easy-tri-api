import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { ZodResponseInterceptor } from '../common/interceptors/zod-response.interceptor.js';
import { AuthService } from './auth.service.js';
import { Session } from './decorators/session.decorator.js';
import { AuthGuard } from './guards/auth.guard.js';
import {
  requestOtpBodySchema,
  requestOtpResponseSchema,
  type RequestOtpBody,
} from './schemas/request-otp.schema.js';
import {
  verifyOtpBodySchema,
  verifyOtpResponseSchema,
  type VerifyOtpBody,
} from './schemas/verify-otp.schema.js';
import {
  meResponseSchema,
  type SessionPayload,
} from './schemas/session.schema.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp')
  @UseInterceptors(new ZodResponseInterceptor(requestOtpResponseSchema))
  requestOtp(
    @Body(new ZodValidationPipe(requestOtpBodySchema)) body: RequestOtpBody,
  ) {
    return this.authService.requestOtp(body);
  }

  @Post('otp/verify')
  @UseInterceptors(new ZodResponseInterceptor(verifyOtpResponseSchema))
  verifyOtp(
    @Body(new ZodValidationPipe(verifyOtpBodySchema)) body: VerifyOtpBody,
  ) {
    return this.authService.verifyOtp(body.requestId, body.code);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @UseInterceptors(new ZodResponseInterceptor(meResponseSchema))
  me(@Session() session: SessionPayload) {
    return {
      id: session.sub,
      cpf: session.cpf,
      name: session.name,
      phone: session.phone,
    };
  }
}
