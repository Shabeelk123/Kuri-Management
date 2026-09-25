import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import TopBar from '../../components/TopBar'
import BottomNav from '../../components/BottomNav'
import { useMemberRecords } from '../../hooks/useMemberRecords'
import { useAuth } from '../../lib/AuthContext'
import { currentMonthIndex } from '../../lib/dates'
import { formatCurrency } from '../../lib/format'

export default function MyKuris() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { records, loading } = useMemberRecords(user)
  const accepted = records.filter((r) => r.status === 'accepted')

  return (
    <>
      <TopBar title="Kuri Ledger" subtitle="Member Kuris" />
      <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-20 pb-28 px-margin bg-surface min-h-screen">
        <div className="flex flex-col w-full space-y-space-md">
          <div className="flex items-end justify-between pt-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-secondary">
                <Icon name="spa" className="text-[18px]" />
                <span className="font-label-caps text-label-caps tracking-wider uppercase">
                  Member Ledger
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Your Kuris
              </h1>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-label-md font-label-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary-container" />
              <span>{accepted.length} Active {accepted.length === 1 ? 'Kuri' : 'Kuris'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-1.5">
              <Icon name="groups" className="text-[18px] text-primary" />
              <h2 className="font-headline-md text-headline-md text-on-surface">Your Savings Circles</h2>
            </div>
          </div>

          {loading && (
            <p className="font-body-md text-body-md text-on-surface-variant px-1">Loading…</p>
          )}

          {!loading && accepted.length === 0 && (
            <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm text-center">
              <Icon name="savings" className="text-3xl text-outline mb-2" />
              <p className="font-body-md text-body-md text-on-surface-variant">
                You haven't joined any Kuris yet. Accept an invitation to get started.
              </p>
            </div>
          )}

          {accepted.map((record) => {
            const kuri = record.kuris
            if (!kuri) return null
            const monthIndex = currentMonthIndex(kuri)
            const percentDone = Math.round(((monthIndex + 1) / kuri.num_months) * 100)

            return (
              <div
                key={record.id}
                className="rounded-xl bg-surface-container-lowest p-space-md shadow-md relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface leading-snug">
                      {kuri.name}
                    </h3>
                    <p className="font-label-md text-label-md text-on-surface-variant">
                      Round {monthIndex + 1} of {kuri.num_months} • Active Circle
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps shrink-0">
                    {percentDone}% Done
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Icon name="payments" className="text-[18px]" />
                      <span className="font-label-md text-label-md">Monthly Pot</span>
                    </div>
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      {formatCurrency(kuri.total_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Icon name="account_balance_wallet" className="text-[18px]" />
                      <span className="font-label-md text-label-md">Your Monthly Share</span>
                    </div>
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      {formatCurrency(kuri.monthly_installment)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/member/kuri/${record.id}`)}
                  className="mt-3.5 w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg transition-colors group"
                  type="button"
                >
                  <span className="flex items-center gap-1.5">
                    <Icon name="history_edu" className="text-[18px]" />
                    View Group Details &amp; Past Payments
                  </span>
                  <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )
          })}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
