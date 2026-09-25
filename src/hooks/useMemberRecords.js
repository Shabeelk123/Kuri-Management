import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * All `members` rows matching the signed-in user's phone or email (whichever
 * the organizer invited them with), each with its parent `kuris` row joined in.
 */
export function useMemberRecords(user) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const phone = user?.phone
  const email = user?.email

  useEffect(() => {
    if ((!phone && !email) || !supabase) {
      setRecords([])
      setLoading(false)
      return
    }
    const filters = []
    if (phone) filters.push(`phone.eq.${phone}`)
    if (email) filters.push(`email.eq.${email}`)

    supabase
      .from('members')
      .select('*, kuris(*)')
      .or(filters.join(','))
      .then(({ data }) => {
        setRecords(data ?? [])
        setLoading(false)
      })
  }, [phone, email])

  return { records, loading }
}
