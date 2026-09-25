import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Icon from '../../components/Icon'
import TopBar from '../../components/TopBar'
import Card from '../../components/Card'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'
import StatusChip from '../../components/StatusChip'
import RecipientReel, { buildReelSpin } from '../../components/RecipientReel'
import { useKuriDetail } from '../../hooks/useKuriDetail'
import { supabase } from '../../lib/supabase'
import { toStoredPhone } from '../../lib/phone'
import { currentMonthIndex, monthLabel, dueDateForMonth } from '../../lib/dates'
import { formatCurrency, formatDate } from '../../lib/format'

const TABS = ['Overview', 'Members', 'Payments', 'Pick recipient', 'Past recipients']

export default function KuriDetail() {
  const { kuriId } = useParams()
  const { kuri, members, payments, recipients, loading, refresh } = useKuriDetail(kuriId)
  const [tab, setTab] = useState('Overview')

  if (loading || !kuri) {
    return (
      <>
        <TopBar title="Kuri" showBack />
        <main className="flex-1 flex flex-col w-full max-w-xl mx-auto pt-24 px-margin min-h-screen">
          <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
        </main>
      </>
    )
  }

  const monthIndex = currentMonthIndex(kuri)
  const accepted = members.filter((m) => m.status === 'accepted')

  return (
    <>
      <TopBar
        title={kuri.name}
        subtitle={kuri.status === 'completed' ? 'Completed' : `Round ${monthIndex + 1} of ${kuri.num_months}`}
        showBack
      />
      <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-20 pb-8 px-margin bg-surface min-h-screen">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-margin px-margin">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 px-3.5 py-2 rounded-full font-label-md text-label-md font-semibold transition-colors ${
                tab === t
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Overview' && (
          <OverviewTab kuri={kuri} members={accepted} payments={payments} monthIndex={monthIndex} />
        )}
        {tab === 'Members' && <MembersTab kuri={kuri} members={members} onChange={refresh} />}
        {tab === 'Payments' && (
          <PaymentsTab kuri={kuri} members={accepted} payments={payments} monthIndex={monthIndex} onChange={refresh} />
        )}
        {tab === 'Pick recipient' && (
          <PickRecipientTab kuri={kuri} members={accepted} monthIndex={monthIndex} onChange={refresh} />
        )}
        {tab === 'Past recipients' && (
          <PastRecipientsTab kuri={kuri} recipients={recipients} members={members} />
        )}
      </main>
    </>
  )
}

function OverviewTab({ kuri, members, payments, monthIndex }) {
  const paidThisMonth = payments.filter((p) => p.month === monthIndex)
  const collected = paidThisMonth.reduce((sum, p) => sum + Number(p.amount), 0)
  const expected = members.length * Number(kuri.monthly_installment)
  const unpaidCount = members.length - paidThisMonth.length
  const dueDate = dueDateForMonth(kuri, monthIndex)
  const isPastDue = new Date() > new Date(`${dueDate}T23:59:59`)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="font-headline-md text-headline-md text-primary">This Month's Collection</h3>
        </div>
        <ProgressBar percent={expected ? (collected / expected) * 100 : 0} className="mb-3" />
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-md text-label-md text-on-surface-variant block">Collected</span>
            <span className="font-numeric-sub text-numeric-sub font-bold text-primary">
              {formatCurrency(collected)}
            </span>
          </div>
          <div className="text-right">
            <span className="font-label-md text-label-md text-on-surface-variant block">Expected</span>
            <span className="font-numeric-sub text-numeric-sub font-bold text-on-surface-variant">
              {formatCurrency(expected)}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-on-surface-variant">
          <Icon name="event" className="text-[16px]" />
          <span className="font-label-md text-label-md">Due {formatDate(dueDate)}</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <span className="font-label-md text-label-md text-on-surface-variant">Members</span>
          <div className="font-headline-lg text-headline-lg text-primary mt-0.5">{members.length}</div>
        </Card>
        <Card>
          <span className="font-label-md text-label-md text-on-surface-variant">
            {isPastDue ? 'Overdue' : 'Not yet paid'}
          </span>
          <div
            className={`font-headline-lg text-headline-lg mt-0.5 ${isPastDue ? 'text-error' : 'text-secondary'}`}
          >
            {unpaidCount}
          </div>
        </Card>
      </div>
    </div>
  )
}

function MembersTab({ kuri, members, onChange }) {
  const [name, setName] = useState('')
  const [contactMethod, setContactMethod] = useState('phone') // 'phone' | 'email'
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)

  async function addMember(e) {
    e.preventDefault()
    if (!supabase) return
    setAdding(true)
    const { data: newMember, error } = await supabase
      .from('members')
      .insert({
        kuri_id: kuri.id,
        name,
        phone: contactMethod === 'phone' ? toStoredPhone(phone) : null,
        email: contactMethod === 'email' ? email : null,
      })
      .select()
      .single()
    if (!error && newMember) {
      await supabase.from('notifications').insert({
        kuri_id: kuri.id,
        member_id: newMember.id,
        type: 'invited',
        message: `You've been invited to join "${kuri.name}" — ${formatCurrency(kuri.monthly_installment)}/month for ${kuri.num_months} months.`,
      })
    }
    setName('')
    setPhone('')
    setEmail('')
    setAdding(false)
    onChange()
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <form onSubmit={addMember} className="flex flex-col gap-3">
          <h3 className="font-headline-md text-headline-md text-primary">Add Member</h3>
          <input
            className="w-full h-12 px-3.5 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex items-center bg-surface-container-high p-1 rounded-full w-fit">
            <button
              type="button"
              onClick={() => setContactMethod('phone')}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md font-semibold transition-all ${
                contactMethod === 'phone' ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              Phone
            </button>
            <button
              type="button"
              onClick={() => setContactMethod('email')}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md font-semibold transition-all ${
                contactMethod === 'email' ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              Email
            </button>
          </div>

          {contactMethod === 'phone' ? (
            <input
              className="w-full h-12 px-3.5 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          ) : (
            <input
              type="email"
              className="w-full h-12 px-3.5 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}

          <Button type="submit" size="md" disabled={adding} icon={<Icon name="person_add" className="text-[18px]" />}>
            {adding ? 'Adding…' : 'Invite Member'}
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-headline-md text-headline-md text-primary mb-2">
          Members ({members.length})
        </h3>
        {members.length === 0 && (
          <p className="font-body-md text-body-md text-on-surface-variant">No members invited yet.</p>
        )}
        {members.map((m, i) => (
          <div key={m.id}>
            <div className="py-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-body-lg text-body-lg font-bold text-primary truncate">{m.name}</h4>
                <p className="font-label-md text-label-md text-on-surface-variant truncate">
                  {m.phone ?? m.email}
                </p>
              </div>
              <StatusChip status={m.status} />
            </div>
            {i < members.length - 1 && <div className="h-px bg-surface-container mx-2" />}
          </div>
        ))}
      </Card>
    </div>
  )
}

function PaymentsTab({ kuri, members, payments, monthIndex: currentMonthIdx, onChange }) {
  const [pending, setPending] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIdx)
  const paidMemberIds = new Set(
    payments.filter((p) => p.month === selectedMonth).map((p) => p.member_id)
  )

  async function togglePaid(member) {
    if (!supabase) return
    setPending(member.id)
    if (paidMemberIds.has(member.id)) {
      await supabase
        .from('payments')
        .delete()
        .eq('kuri_id', kuri.id)
        .eq('member_id', member.id)
        .eq('month', selectedMonth)
    } else {
      await supabase.from('payments').insert({
        kuri_id: kuri.id,
        member_id: member.id,
        month: selectedMonth,
        amount: kuri.monthly_installment,
      })
      await supabase.from('notifications').insert({
        kuri_id: kuri.id,
        member_id: member.id,
        type: 'payment_recorded',
        message: `Your payment of ${formatCurrency(kuri.monthly_installment)} for ${monthLabel(kuri.start_date, selectedMonth)} was recorded.`,
      })
    }
    setPending(null)
    onChange()
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setSelectedMonth((m) => Math.max(0, m - 1))}
          disabled={selectedMonth === 0}
          aria-label="Previous month"
          className="w-9 h-9 rounded-full flex items-center justify-center text-primary disabled:opacity-30 active:bg-surface-container-high transition-colors"
        >
          <Icon name="chevron_left" className="text-xl" />
        </button>
        <h3 className="font-headline-md text-headline-md text-primary">
          {monthLabel(kuri.start_date, selectedMonth)} Payments
        </h3>
        <button
          type="button"
          onClick={() => setSelectedMonth((m) => Math.min(currentMonthIdx, m + 1))}
          disabled={selectedMonth >= currentMonthIdx}
          aria-label="Next month"
          className="w-9 h-9 rounded-full flex items-center justify-center text-primary disabled:opacity-30 active:bg-surface-container-high transition-colors"
        >
          <Icon name="chevron_right" className="text-xl" />
        </button>
      </div>
      {members.length === 0 && (
        <p className="font-body-md text-body-md text-on-surface-variant">No accepted members yet.</p>
      )}
      {members.map((m, i) => {
        const isPaid = paidMemberIds.has(m.id)
        return (
          <div key={m.id}>
            <div className="py-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-body-lg text-body-lg font-bold text-primary truncate">{m.name}</h4>
                <StatusChip status={isPaid ? 'paid' : 'unpaid'} />
              </div>
              <button
                onClick={() => togglePaid(m)}
                disabled={pending === m.id}
                className={`h-10 px-4 rounded-lg font-label-md text-label-md font-bold active:scale-95 transition-transform ${
                  isPaid
                    ? 'bg-surface-container-high text-on-surface'
                    : 'bg-primary-container text-on-primary'
                }`}
                type="button"
              >
                {isPaid ? 'Mark unpaid' : 'Mark paid'}
              </button>
            </div>
            {i < members.length - 1 && <div className="h-px bg-surface-container mx-2" />}
          </div>
        )
      })}
    </Card>
  )
}

function PickRecipientTab({ kuri, members, monthIndex, onChange }) {
  const eligible = useMemo(() => members.filter((m) => !m.has_received), [members])
  const [selected, setSelected] = useState(null)
  const [selectionType, setSelectionType] = useState('manual')
  const [reel, setReel] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function confirm() {
    if (!supabase || !selected) return
    setConfirming(true)
    const { error } = await supabase.from('recipients').insert({
      kuri_id: kuri.id,
      month: monthIndex,
      member_id: selected.id,
      selection_type: selectionType,
    })
    if (!error) {
      await supabase.from('members').update({ has_received: true }).eq('id', selected.id)
      const message = `${selected.name} was picked to receive this month's ${formatCurrency(kuri.total_amount)} payout for "${kuri.name}".`
      await supabase.from('notifications').insert(
        members.map((m) => ({
          kuri_id: kuri.id,
          member_id: m.id,
          type: 'recipient',
          message,
        }))
      )

      const remainingEligible = members.filter((m) => !m.has_received && m.id !== selected.id).length
      if (remainingEligible === 0) {
        await supabase.from('kuris').update({ status: 'completed' }).eq('id', kuri.id)
      }
    }
    setConfirming(false)
    if (!error) onChange()
  }

  function spin() {
    if (eligible.length === 0 || spinning) return
    const winner = eligible[Math.floor(Math.random() * eligible.length)]
    const { items, translateY } = buildReelSpin({ members: eligible, winnerId: winner.id })
    setSelected(null)
    setReel({ items, translateY: 0 })
    setSpinning(false)
    // Reset to the top instantly, then kick off the animated transition on the next frame.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSpinning(true)
        setReel({ items, translateY })
      })
    })
    setTimeout(() => {
      setSpinning(false)
      setSelected(winner)
      setSelectionType('auto')
    }, 4000)
  }

  function pickManually(member) {
    if (spinning) return
    setSelected(member)
    setSelectionType('manual')
  }

  if (eligible.length === 0) {
    return (
      <Card>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Every member has already received their payout for this Kuri.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center py-6">
        <RecipientReel
          items={reel?.items ?? eligible}
          translateY={reel?.translateY ?? 0}
          spinning={spinning}
        />
        <Button
          variant="secondary"
          size="md"
          className="mt-5 max-w-[220px]"
          disabled={spinning || confirming}
          onClick={spin}
          icon={<Icon name="casino" className="text-[18px]" />}
        >
          {spinning ? 'Drawing…' : 'Pick for me'}
        </Button>
        {selected && selectionType === 'auto' && !spinning && (
          <p className="font-body-lg text-body-lg font-bold text-primary mt-3">
            🎉 {selected.name} was picked!
          </p>
        )}
      </Card>

      <Card>
        <h3 className="font-headline-md text-headline-md text-primary mb-3">
          Or pick manually ({eligible.length})
        </h3>
        <div className="flex flex-col gap-2">
          {eligible.map((m) => (
            <button
              key={m.id}
              onClick={() => pickManually(m)}
              disabled={spinning}
              type="button"
              className={`text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
                selected?.id === m.id
                  ? 'bg-primary-fixed text-on-primary-fixed'
                  : 'bg-surface-container-low text-on-surface'
              }`}
            >
              <span className="font-body-lg text-body-lg font-semibold">{m.name}</span>
              {selected?.id === m.id && <Icon name="check_circle" className="text-lg" />}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Button disabled={!selected || confirming || spinning} onClick={confirm}>
          {confirming ? 'Confirming…' : selected ? `Confirm ${selected.name} as recipient` : 'Confirm recipient'}
        </Button>
        <p className="font-label-md text-label-md text-on-surface-variant text-center">
          Confirming is permanent — it locks this month's recipient for everyone.
        </p>
      </div>
    </div>
  )
}

function PastRecipientsTab({ kuri, recipients, members }) {
  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])

  if (recipients.length === 0) {
    return (
      <Card>
        <p className="font-body-md text-body-md text-on-surface-variant">No recipients confirmed yet.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="font-headline-md text-headline-md text-primary mb-2">Past Recipients</h3>
      {recipients.map((r, i) => (
        <div key={r.id}>
          <div className="py-3 flex items-center justify-between">
            <span className="font-body-lg text-body-lg text-on-surface">
              {monthLabel(kuri.start_date, r.month)}
            </span>
            <span className="font-label-lg text-label-lg font-bold text-primary">
              {memberById.get(r.member_id)?.name ?? 'Unknown'}
            </span>
          </div>
          {i < recipients.length - 1 && <div className="h-px bg-surface-container mx-2" />}
        </div>
      ))}
    </Card>
  )
}
