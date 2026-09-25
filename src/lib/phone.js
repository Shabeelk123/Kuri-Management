/** E.164 format (+91XXXXXXXXXX) — required by Supabase's signInWithOtp/verifyOtp calls. */
export function toE164(input) {
  const digits = (input || '').replace(/\D/g, '')
  return digits ? `+91${digits}` : ''
}

/**
 * Supabase stores `auth.users.phone` (and the JWT's `phone` claim) WITHOUT the
 * leading `+` — e.g. "919876543210". Member rows must be stored in this same
 * format so `phone = auth.jwt() ->> 'phone'` RLS policies and lookups by
 * `user.phone` actually match.
 */
export function toStoredPhone(input) {
  const digits = (input || '').replace(/\D/g, '')
  return digits ? `91${digits}` : ''
}
