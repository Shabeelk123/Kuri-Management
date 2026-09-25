/**
 * Strips a number down to its 10-digit Indian local form, regardless of how
 * it was typed — with or without a "+91"/"91" country code prefix, with or
 * without a leading domestic "0", with spaces/dashes.
 */
function localDigits(input) {
  let digits = (input || '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2)
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  return digits
}

/** E.164 format (+91XXXXXXXXXX) — required by Supabase's signInWithOtp/verifyOtp calls. */
export function toE164(input) {
  const digits = localDigits(input)
  return digits ? `+91${digits}` : ''
}

/**
 * Supabase stores `auth.users.phone` (and the JWT's `phone` claim) WITHOUT the
 * leading `+` — e.g. "919876543210". Member rows must be stored in this same
 * format so `phone = auth.jwt() ->> 'phone'` RLS policies and lookups by
 * `user.phone` actually match.
 */
export function toStoredPhone(input) {
  const digits = localDigits(input)
  return digits ? `91${digits}` : ''
}
