import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import TopBar from '../../components/TopBar'
import Button from '../../components/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'

const DUE_DAYS = [1, 5, 10, 15, 20, 25]

function nextMonthOptions(count = 6) {
  const options = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
    const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    options.push({ value, label })
  }
  return options
}

export default function CreateKuri() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const monthOptions = nextMonthOptions()

  const [name, setName] = useState('')
  const [totalAmount, setTotalAmount] = useState(50000)
  const [numMembers, setNumMembers] = useState(10)
  const [startDate, setStartDate] = useState(monthOptions[0].value)
  const [dueDay, setDueDay] = useState(10)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const perPerson = numMembers > 0 ? Math.round(totalAmount / numMembers) : 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured yet — see docs/01-SETUP.md.')
      return
    }
    if (!user?.id) {
      setError('You must be signed in as an organizer to create a Kuri.')
      return
    }
    setSubmitting(true)
    setError(null)

    const { data, error: insertError } = await supabase
      .from('kuris')
      .insert({
        organizer_id: user.id,
        name,
        total_amount: totalAmount,
        monthly_installment: perPerson,
        num_months: numMembers,
        start_date: startDate,
        due_day: dueDay,
      })
      .select()
      .single()

    setSubmitting(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    navigate(`/organizer/kuri/${data.id}`)
  }

  return (
    <>
      <TopBar title="Start New Kuri" showBack />
      <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-header-safe pb-8 px-margin bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-8">
          <div className="pt-2 pb-5 flex flex-col gap-1">
            <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant">
              <Icon name="groups_3" className="text-[15px]" filled />
              <span className="font-label-caps text-label-caps uppercase tracking-wider">
                Group Setup
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary mt-1">
              Start a new Kuri group
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Fill in the basic details. You can invite members once the group is created.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-2">
              <label className="font-label-lg text-label-lg text-primary flex items-center justify-between" htmlFor="groupName">
                <span>Group Name</span>
                <span className="font-label-md text-label-md text-outline">Required</span>
              </label>
              <div className="relative flex items-center">
                <Icon name="edit_note" className="absolute left-3.5 text-outline text-[20px] pointer-events-none" />
                <input
                  className="w-full h-14 pl-11 pr-4 bg-surface-container-low text-on-surface rounded-lg font-body-lg text-body-lg placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors"
                  id="groupName"
                  placeholder="e.g. Sunday Family Savings or Office Chitty"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-2">
              <label className="font-label-lg text-label-lg text-primary flex items-center justify-between" htmlFor="poolAmount">
                <span>Total Pool Amount per Month</span>
                <span className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-wider">
                  Monthly Pot
                </span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-headline-md text-headline-md text-primary font-extrabold select-none">
                  ₹
                </span>
                <input
                  className="w-full h-14 pl-10 pr-4 bg-surface-container-low text-primary font-numeric-hero-mobile text-numeric-hero-mobile font-extrabold rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-colors"
                  id="poolAmount"
                  inputMode="numeric"
                  value={totalAmount.toLocaleString('en-IN')}
                  onChange={(e) => {
                    const num = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0
                    setTotalAmount(num)
                  }}
                  required
                />
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <Icon name="savings" className="text-[16px]" />
                <span className="font-label-md text-label-md">
                  Total cash collected and handed to one member each round.
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="font-label-lg text-label-lg text-primary">Number of Members / Months</label>
                <span className="font-label-md text-label-md text-on-surface-variant">{numMembers} rounds</span>
              </div>
              <div className="flex items-center justify-between bg-surface-container-low rounded-lg p-1.5">
                <button
                  aria-label="Decrease member count"
                  className="w-12 h-12 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center active:scale-95 transition-transform shadow-sm"
                  onClick={() => setNumMembers((n) => Math.max(3, n - 1))}
                  type="button"
                >
                  <Icon name="remove" className="text-2xl" />
                </button>
                <div className="flex flex-col items-center justify-center px-4">
                  <span className="font-headline-md text-headline-md text-primary font-extrabold leading-none">
                    {numMembers}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    {numMembers} members ({numMembers} months)
                  </span>
                </div>
                <button
                  aria-label="Increase member count"
                  className="w-12 h-12 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center active:scale-95 transition-transform shadow-sm"
                  onClick={() => setNumMembers((n) => Math.min(50, n + 1))}
                  type="button"
                >
                  <Icon name="add" className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="bg-secondary-container/25 rounded-xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Icon name="calculate" className="text-[20px]" filled />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-label-caps text-label-caps text-on-secondary-container uppercase tracking-wider">
                    Live Calculation
                  </span>
                  <p className="font-numeric-sub text-numeric-sub text-primary font-bold leading-tight">
                    Each person pays ₹{perPerson.toLocaleString('en-IN')} every month
                  </p>
                  <p className="font-label-md text-label-md text-on-surface-variant">
                    Calculated automatically: Total ₹{totalAmount.toLocaleString('en-IN')} ÷ {numMembers} members
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-2">
              <label className="font-label-lg text-label-lg text-primary flex items-center justify-between" htmlFor="startMonthPicker">
                <span>Start Month &amp; Year</span>
                <span className="font-label-md text-label-md text-outline">First collection</span>
              </label>
              <div className="relative flex items-center">
                <Icon name="calendar_month" className="absolute left-3.5 text-outline text-[20px] pointer-events-none" />
                <select
                  className="w-full h-14 pl-11 pr-10 bg-surface-container-low text-on-surface font-body-lg text-body-lg rounded-lg appearance-none focus:outline-none focus:bg-surface-container-lowest transition-colors"
                  id="startMonthPicker"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                >
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Icon name="arrow_drop_down" className="absolute right-3.5 text-outline pointer-events-none" />
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-2">
              <label className="font-label-lg text-label-lg text-primary flex items-center justify-between" htmlFor="dueDayPicker">
                <span>Monthly Payment Due Day</span>
                <span className="font-label-md text-label-md text-outline">Monthly recurring</span>
              </label>
              <div className="relative flex items-center">
                <Icon name="event_repeat" className="absolute left-3.5 text-outline text-[20px] pointer-events-none" />
                <select
                  className="w-full h-14 pl-11 pr-10 bg-surface-container-low text-on-surface font-body-lg text-body-lg rounded-lg appearance-none focus:outline-none focus:bg-surface-container-lowest transition-colors"
                  id="dueDayPicker"
                  value={dueDay}
                  onChange={(e) => setDueDay(Number(e.target.value))}
                >
                  {DUE_DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                      {day === 1 ? 'st' : 'th'} of every month
                    </option>
                  ))}
                </select>
                <Icon name="arrow_drop_down" className="absolute right-3.5 text-outline pointer-events-none" />
              </div>
            </div>

            {error && <p className="font-label-md text-label-md text-error">{error}</p>}

            <div className="flex flex-col gap-3 pt-3 pb-4">
              <Button type="submit" disabled={submitting} icon={<Icon name="person_add" className="text-[20px]" />}>
                {submitting ? 'Creating…' : 'Create Kuri & Invite Members'}
              </Button>
              <Button variant="ghost" size="md" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
