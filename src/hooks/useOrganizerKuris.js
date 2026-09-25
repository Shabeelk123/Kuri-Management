import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useOrganizerKuris(organizerId) {
  const [kuris, setKuris] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!organizerId || !supabase) {
      setLoading(false)
      return
    }
    supabase
      .from('kuris')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setKuris(data ?? [])
        setLoading(false)
      })
  }, [organizerId])

  return { kuris, loading }
}
