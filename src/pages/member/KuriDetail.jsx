import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Icon from '../../components/Icon'
import TopBar from '../../components/TopBar'
import Card from '../../components/Card'
import ProgressBar from '../../components/ProgressBar'
import StatusChip from '../../components/StatusChip'
import { supabase } from '../../lib/supabase'
import { currentMonthIndex, dueDateForMonth, monthLabel } from '../../lib/dates'
import { formatCurrency, formatDate } from '../../lib/format'

export default function KuriDetail() {
  const { memberId } = useParams()
  const [member, setMember] = useState(null)
  const [payments, setPayments] = useState([])
  const [recipients, setRecipients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!memberId || !supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('members')
      .select('*, kuris(*)')
      .eq('id', memberId)
      .single()
      .then(({ data }) => {
        setMember(data ?? null)
        if (data?.kuri_id) {
          supabase
            .from('payments')
            .select('*')
            .eq('kuri_id', data.kuri_id)
            .eq('member_id', memberId)
            .then(({ data: p }) => setPayments(p ?? []))
          supabase
            .from('recipients')
            .select('*, members(name)')
            .eq('kuri_id', data.kuri_id)
            .order('month')
            .then(({ data: r }) => setRecipients(r ?? []))
        }
        setLoading(false)
      })
  }, [memberId])

  if (loading) {
    return (
      <main className="flex-1 flex flex-col w-full max-w-xl mx-auto pt-24 px-margin min-h-screen">
        <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
      </main>
    )
  }

  const kuri = member?.kuris

  if (!kuri) {
    return (
      <main className="flex-1 flex flex-col w-full max-w-xl mx-auto pt-24 px-margin min-h-screen">
        <p className="font-body-md text-body-md text-on-surface-variant">Kuri not found.</p>
      </main>
    )
  }

  const monthIndex = currentMonthIndex(kuri)
  const percentDone = Math.round(((monthIndex + 1) / kuri.num_months) * 100)
  const dueDate = dueDateForMonth(kuri, monthIndex)
  const paidThisMonth = payments.some((p) => p.month === monthIndex)
  const currentRecipient = recipients.find((r) => r.month === monthIndex)

  return (
    <>
      <TopBar title={kuri.name} subtitle={`Round ${monthIndex + 1} of ${kuri.num_months}`} showBack />
      <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-20 pb-8 px-margin bg-surface min-h-screen">
        <div className="flex flex-col w-full space-y-4">
          <Card>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-headline-md text-headline-md text-primary">Your Contribution</h3>
              <span className="font-label-caps text-label-caps text-secondary font-bold">
                {percentDone}% FULFILLED
              </span>
            </div>
            <ProgressBar percent={percentDone} className="mb-3" />
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-md text-label-md text-on-surface-variant block">
                  Monthly Share
                </span>
                <span className="font-numeric-sub text-numeric-sub font-bold text-primary">
                  {formatCurrency(kuri.monthly_installment)}
                </span>
              </div>
              <div className="text-right">
                <span className="font-label-md text-label-md text-on-surface-variant block">
                  This Month
                </span>
                <StatusChip status={paidThisMonth ? 'paid' : 'unpaid'} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-on-surface-variant">
              <Icon name="event" className="text-[16px]" />
              <span className="font-label-md text-label-md">Due {formatDate(dueDate)}</span>
            </div>
          </Card>

          {currentRecipient && (
            <Card className="bg-secondary-container/20">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="stars" className="text-secondary text-[18px]" filled />
                <span className="font-label-caps text-label-caps uppercase text-secondary tracking-wider">
                  This Month's Recipient
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary">
                {currentRecipient.members?.name}
              </h3>
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="history_edu" className="text-primary text-xl" />
                <h3 className="font-headline-md text-headline-md text-primary">Payment History</h3>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">
                {payments.length} confirmed
              </span>
            </div>
            {payments.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">No payments recorded yet.</p>
            ) : (
              <div className="flex flex-col">
                {payments
                  .sort((a, b) => a.month - b.month)
                  .map((p, i) => (
                    <div key={p.id}>
                      <div className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                            <Icon name="check" className="text-lg" />
                          </div>
                          <h4 className="font-body-lg text-body-lg font-bold text-primary leading-tight">
                            {monthLabel(kuri.start_date, p.month)}
                          </h4>
                        </div>
                        <div className="font-body-lg text-body-lg font-bold text-primary">
                          {formatCurrency(p.amount)}
                        </div>
                      </div>
                      {i < payments.length - 1 && <div className="h-px bg-surface-container mx-2" />}
                    </div>
                  ))}
              </div>
            )}
          </Card>

          {recipients.length > 0 && (
            <Card>
              <h3 className="font-headline-md text-headline-md text-primary mb-3">Past Recipients</h3>
              <div className="flex flex-col">
                {recipients.map((r, i) => (
                  <div key={r.id}>
                    <div className="py-3 flex items-center justify-between">
                      <span className="font-body-lg text-body-lg text-on-surface">
                        {monthLabel(kuri.start_date, r.month)}
                      </span>
                      <span className="font-label-lg text-label-lg font-bold text-primary">
                        {r.members?.name}
                      </span>
                    </div>
                    {i < recipients.length - 1 && <div className="h-px bg-surface-container mx-2" />}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
