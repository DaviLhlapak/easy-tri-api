export const OTP_DELIVERY_PORT = Symbol('OTP_DELIVERY_PORT');

export interface SendOtpParams {
  /** Recipient's phone number, digits only (no country code, e.g. "11912345678"). */
  phone: string;
  name: string;
  code: string;
}

/**
 * Delivery-agnostic port for sending an OTP code to a user. Swap the
 * concrete adapter (SMS via Twilio, email, WhatsApp, console/mock, ...)
 * without changing any code that depends on this interface.
 */
export interface OtpDeliveryPort {
  sendOtp(params: SendOtpParams): Promise<void>;
}
