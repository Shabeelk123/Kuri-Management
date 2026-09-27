import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * All `members` rows matching the signed-in user's email (whichever the
 * organizer invited them with), each with its parent `kuris` row joined in.
 */
export function useMemberRecords(user) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const email = user?.email

  useEffect(() => {
    if (!email || !supabase) {
      setRecords([])
      setLoading(false)
      return
    }
    supabase
      .from('members')
      .select('*, kuris(*)')
      .eq('email', email)
      .then(({ data }) => {
        setRecords(data ?? [])
        setLoading(false)
      })
  }, [email])

  return { records, loading }
}
