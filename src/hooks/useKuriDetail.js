import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useKuriDetail(kuriId) {
  const [kuri, setKuri] = useState(null)
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState([])
  const [recipients, setRecipients] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!kuriId || !supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      supabase.from('kuris').select('*').eq('id', kuriId).single(),
      supabase.from('members').select('*').eq('kuri_id', kuriId).order('invited_at'),
      supabase.from('payments').select('*').eq('kuri_id', kuriId),
      supabase.from('recipients').select('*').eq('kuri_id', kuriId).order('month'),
    ]).then(([kuriRes, membersRes, paymentsRes, recipientsRes]) => {
      setKuri(kuriRes.data ?? null)
      setMembers(membersRes.data ?? [])
      setPayments(paymentsRes.data ?? [])
      setRecipients(recipientsRes.data ?? [])
      setLoading(false)
    })
  }, [kuriId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { kuri, members, payments, recipients, loading, refresh }
}
