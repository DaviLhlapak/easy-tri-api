/**
 * Masks a digits-only string, revealing only the last `visibleAtEnd`
 * characters. Useful for exposing sensitive identifiers (cpf, phone, ...)
 * in API responses without fully revealing them.
 */
export function maskDigits(value: string, visibleAtEnd = 2, maskChar = '*'): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= visibleAtEnd) {
    return maskChar.repeat(digits.length);
  }
  const hiddenCount = digits.length - visibleAtEnd;
  return maskChar.repeat(hiddenCount) + digits.slice(-visibleAtEnd);
}

/**
 * Formats a Brazilian cpf with everything but the last 2 (verifier) digits
 * hidden, e.g. "12345678909" -> "***.***.***-09".
 */
export function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '').padStart(11, '0');
  return `***.***.***-${digits.slice(-2)}`;
}

/**
 * Reveals only the last 4 digits of a phone number, e.g.
 * "11912345678" -> "*******5678".
 */
export function maskPhone(phone: string): string {
  return maskDigits(phone, 4);
}
