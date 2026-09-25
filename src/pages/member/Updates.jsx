import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import TopBar from '../../components/TopBar'
import BottomNav from '../../components/BottomNav'
import { useMemberRecords } from '../../hooks/useMemberRecords'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabase'

const TYPE_ICON = {
  invited: 'group_add',
  reminder: 'schedule',
  payment_due: 'hourglass_top',
  payment_recorded: 'check_circle',
  recipient: 'stars',
}

export default function Updates() {
  const { user } = useAuth()
  const { records, loading: recordsLoading } = useMemberRecords(user)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (recordsLoading) return
    const memberIds = records.map((r) => r.id)
    if (!supabase || memberIds.length === 0) {
      setNotifications([])
      setLoading(false)
      return
    }
    supabase
      .from('notifications')
      .select('*')
      .in('member_id', memberIds)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setNotifications(data ?? [])
        setLoading(false)
      })
  }, [records, recordsLoading])

  return (
    <>
      <TopBar title="Kuri Ledger" subtitle="Updates" />
      <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-20 pb-28 px-margin bg-surface min-h-screen">
        <div className="flex flex-col w-full space-y-space-md pt-1">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Updates</h1>

          {loading && (
            <p className="font-body-md text-body-md text-on-surface-variant px-1">Loading…</p>
          )}

          {!loading && notifications.length === 0 && (
            <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm text-center">
              <Icon name="notifications" className="text-3xl text-outline mb-2" />
              <p className="font-body-md text-body-md text-on-surface-variant">Nothing new yet.</p>
            </div>
          )}

          {notifications.length > 0 && (
            <div className="rounded-xl bg-surface-container-lowest p-2 shadow-sm">
              {notifications.map((n, i) => (
                <div key={n.id}>
                  <div className="py-3 px-2 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                      <Icon name={TYPE_ICON[n.type] ?? 'info'} className="text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-body-lg text-body-lg text-on-surface">{n.message}</p>
                      <p className="font-label-md text-label-md text-on-surface-variant mt-0.5">
                        {new Date(n.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  {i < notifications.length - 1 && (
                    <div className="h-px bg-surface-container mx-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
