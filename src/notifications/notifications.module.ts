import { Module } from '@nestjs/common';
import { MockOtpDeliveryAdapter } from './adapters/mock-otp-delivery.adapter.js';
import { TwilioOtpDeliveryAdapter } from './adapters/twilio-otp-delivery.adapter.js';
import { OTP_DELIVERY_PORT } from './ports/otp-delivery.port.js';

/**
 * Selects the OTP delivery adapter based on OTP_DELIVERY_DRIVER
 * ("twilio" | "mock", defaults to "mock"). Swapping providers (a
 * different SMS vendor, email, WhatsApp, ...) only requires adding a new
 * adapter here and implementing OtpDeliveryPort - nothing else in the app
 * needs to change.
 */
@Module({
  providers: [
    MockOtpDeliveryAdapter,
    TwilioOtpDeliveryAdapter,
    {
      provide: OTP_DELIVERY_PORT,
      useFactory: (mock: MockOtpDeliveryAdapter, twilioAdapter: TwilioOtpDeliveryAdapter) => {
        const driver = process.env.OTP_DELIVERY_DRIVER ?? 'mock';
        switch (driver) {
          case 'twilio':
            return twilioAdapter;
          case 'mock':
            return mock;
          default:
            throw new Error(`Unknown OTP_DELIVERY_DRIVER: ${driver}`);
        }
      },
      inject: [MockOtpDeliveryAdapter, TwilioOtpDeliveryAdapter],
    },
  ],
  exports: [OTP_DELIVERY_PORT],
})
export class NotificationsModule {}
