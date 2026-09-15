import { Injectable, Logger } from '@nestjs/common';
import type { OtpDeliveryPort, SendOtpParams } from '../ports/otp-delivery.port.js';

/**
 * Dev/test adapter: just logs the code instead of sending a real SMS/email.
 * Useful when OTP_DELIVERY_DRIVER is unset or explicitly "mock".
 */
@Injectable()
export class MockOtpDeliveryAdapter implements OtpDeliveryPort {
  private readonly logger = new Logger(MockOtpDeliveryAdapter.name);

  async sendOtp({ phone, name, code }: SendOtpParams): Promise<void> {
    this.logger.log(`[mock] OTP for ${name} (${phone}): ${code}`);
  }
}
