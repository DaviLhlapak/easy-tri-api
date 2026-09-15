import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import twilio from 'twilio';
import type {
  OtpDeliveryPort,
  SendOtpParams,
} from '../ports/otp-delivery.port.js';

type TwilioClient = ReturnType<typeof twilio>;
type Channel = 'sms' | 'whatsapp';

/**
 * Sends the OTP code via Twilio, over SMS or WhatsApp depending on
 * TWILIO_CHANNEL ("sms" (default) | "whatsapp"). Requires:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_FROM_NUMBER (E.164, e.g. "+15005550006") or
 *   TWILIO_MESSAGING_SERVICE_SID (preferred if set)
 *
 * For TWILIO_CHANNEL=whatsapp, business-initiated messages (like an OTP)
 * generally must use an approved Content Template rather than free-form
 * text. Set TWILIO_CONTENT_SID (and optionally TWILIO_CONTENT_VARIABLE_NAME,
 * default "1") to send the code through that template instead of `body`.
 *
 * Phone numbers are stored as local digits-only (e.g. "11912345678") and
 * are converted to E.164 using TWILIO_DEFAULT_COUNTRY_CODE (default "55").
 */
@Injectable()
export class TwilioOtpDeliveryAdapter implements OtpDeliveryPort {
  private readonly logger = new Logger(TwilioOtpDeliveryAdapter.name);
  private client: TwilioClient | undefined;

  async sendOtp({ phone, code }: SendOtpParams): Promise<void> {
    const client = this.getClient();

    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!messagingServiceSid && !fromNumber) {
      throw new ServiceUnavailableException(
        'TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_NUMBER must be set',
      );
    }

    const channel = (process.env.TWILIO_CHANNEL ?? 'sms') as Channel;
    const contentSid = process.env.TWILIO_CONTENT_SID;

    try {
      await client.messages.create({
        to: withChannelPrefix(toE164(phone), channel),
        ...(messagingServiceSid
          ? { messagingServiceSid }
          : { from: withChannelPrefix(fromNumber!, channel) }),
        ...(contentSid
          ? {
              contentSid,
              contentVariables: JSON.stringify({
                [process.env.TWILIO_CONTENT_VARIABLE_NAME ?? '1']: code,
              }),
            }
          : {
              body: `Your verification code is ${code}. It expires in 5 minutes.`,
            }),
      });
    } catch (error) {
      this.logger.error(`Failed to send OTP via Twilio (${channel})`, error);
      throw new ServiceUnavailableException('Failed to send OTP');
    }
  }

  private getClient(): TwilioClient {
    if (this.client) {
      return this.client;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new ServiceUnavailableException(
        'Twilio is not configured (missing TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN)',
      );
    }

    this.client = twilio(accountSid, authToken);
    return this.client;
  }
}

function toE164(localDigits: string): string {
  const countryCode = process.env.TWILIO_DEFAULT_COUNTRY_CODE ?? '55';
  return `+${countryCode}${localDigits}`;
}

function withChannelPrefix(e164Address: string, channel: Channel): string {
  return channel === 'whatsapp' ? `whatsapp:${e164Address}` : e164Address;
}
