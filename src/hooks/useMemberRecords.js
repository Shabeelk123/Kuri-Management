import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * All `members` rows matching the signed-in user's phone number,
 * each with its parent `kuris` row joined in.
 *
 * Phone is stored as user_metadata.phone during signUp in Login.jsx
 * (e.g. "919876543210"). The organizer stores the same format in
 * members.phone when inviting via KuriDetail.jsx.
 *
 * Fallback: if user_metadata.phone is missing, extract the digits from
 * the synthetic email (e.g. "919876543210@kuri.ph" → "919876543210").
 */
export function useMemberRecords(user) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  // Primary: user_metadata.phone set during signUp
  // Fallback: extract digits from synthetic email e.g. "91XXXXXXXXXX@kuri.ph"
  const phone =
    user?.user_metadata?.phone ??
    user?.email?.replace(/@kuri\.ph$/, '') ??
    null

  useEffect(() => {
    // ── DEBUG (remove after fix) ─────────────────────────────
    console.log('[useMemberRecords] user:', user)
    console.log('[useMemberRecords] user_metadata:', user?.user_metadata)
    console.log('[useMemberRecords] phone resolved to:', phone)
    // ────────────────────────────────────────────────────────

    if (!phone || !supabase) {
      console.warn('[useMemberRecords] skipping query — phone is', phone)
      setRecords([])
      setLoading(false)
      return
    }
    supabase
      .from('members')
      .select('*, kuris(*)')
      .eq('phone', phone)
      .then(({ data, error }) => {
        console.log('[useMemberRecords] query result — data:', data, 'error:', error)
        if (error) {
          console.error('[useMemberRecords] query failed:', error.message)
        }
        setRecords(data ?? [])
        setLoading(false)
      })
  }, [phone])

  return { records, loading }
}
