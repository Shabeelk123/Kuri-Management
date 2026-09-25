import { useState } from 'react'
import Icon from '../../components/Icon'
import TopBar from '../../components/TopBar'
import BottomNav from '../../components/BottomNav'
import Button from '../../components/Button'
import { useMemberRecords } from '../../hooks/useMemberRecords'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/format'

export default function Invitations() {
  const { user } = useAuth()
  const { records, loading } = useMemberRecords(user)
  const [updating, setUpdating] = useState(null)
  const pending = records.filter((r) => r.status === 'pending')

  async function respond(memberId, status) {
    if (!supabase) return
    setUpdating(memberId)
    await supabase
      .from('members')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', memberId)
    setUpdating(null)
    window.location.reload()
  }

  return (
    <>
      <TopBar title="Kuri Ledger" subtitle="Invitations" />
      <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-20 pb-28 px-margin bg-surface min-h-screen">
        <div className="flex flex-col w-full space-y-space-md pt-1">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
            Invitations
          </h1>

          {loading && (
            <p className="font-body-md text-body-md text-on-surface-variant px-1">Loading…</p>
          )}

          {!loading && pending.length === 0 && (
            <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm text-center">
              <Icon name="mark_email_unread" className="text-3xl text-outline mb-2" />
              <p className="font-body-md text-body-md text-on-surface-variant">
                No pending invitations right now.
              </p>
            </div>
          )}

          {pending.map((record) => {
            const kuri = record.kuris
            if (!kuri) return null
            return (
              <div key={record.id} className="rounded-xl bg-surface-container-lowest p-space-md shadow-md">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="groups_3" className="text-secondary text-[18px]" filled />
                  <span className="font-label-caps text-label-caps uppercase text-secondary tracking-wider">
                    Group Invite
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">{kuri.name}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Monthly share: <strong className="text-primary">{formatCurrency(kuri.monthly_installment)}</strong>{' '}
                  · {kuri.num_months} months
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={updating === record.id}
                    onClick={() => respond(record.id, 'declined')}
                  >
                    Decline
                  </Button>
                  <Button
                    size="md"
                    disabled={updating === record.id}
                    onClick={() => respond(record.id, 'accepted')}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
