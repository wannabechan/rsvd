/**
 * Phone OTP delivery via NHN Cloud SMS when configured.
 * Without NHN env, logs the code for local/dev and callers may expose debugCode.
 */

import { formatPhoneDisplay, normalizePhone } from "@/domain/auth";
import { isNhnSmsConfigured, sendNhnSmsVerificationCode } from "@/lib/nhn-sms";

export function isSmsConfigured(): boolean {
  return isNhnSmsConfigured();
}

export async function sendPhoneVerificationCode(
  phone: string,
  code: string,
): Promise<void> {
  const normalized = normalizePhone(phone);

  if (isNhnSmsConfigured()) {
    await sendNhnSmsVerificationCode(normalized, code);
    return;
  }

  console.info(
    `[rsvd] phone OTP (SMS not configured) for ${formatPhoneDisplay(normalized)}: ${code}`,
  );
}
