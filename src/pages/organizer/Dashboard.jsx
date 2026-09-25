import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import TopBar from '../../components/TopBar'
import Button from '../../components/Button'
import OrganizerBottomNav from '../../components/OrganizerBottomNav'
import { useOrganizerKuris } from '../../hooks/useOrganizerKuris'
import { useAuth } from '../../lib/AuthContext'
import { currentMonthIndex } from '../../lib/dates'
import { formatCurrency } from '../../lib/format'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kuris, loading } = useOrganizerKuris(user?.id)

  return (
    <>
      <TopBar title="Kuri Ledger" subtitle="Organizer" />
      <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-20 pb-28 px-margin bg-surface min-h-screen">
        <div className="flex flex-col w-full space-y-space-md">
          <div className="flex items-center justify-between pt-1">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Your Kuris
            </h1>
            <button
              onClick={() => navigate('/organizer/new')}
              className="h-11 px-4 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center gap-1.5 active:scale-[0.985] transition-transform"
              type="button"
            >
              <Icon name="add" className="text-lg" />
              New Kuri
            </button>
          </div>

          {loading && (
            <p className="font-body-md text-body-md text-on-surface-variant px-1">Loading…</p>
          )}

          {!loading && kuris.length === 0 && (
            <div className="rounded-xl bg-surface-container-lowest p-8 shadow-sm text-center flex flex-col items-center gap-3">
              <Icon name="menu_book" className="text-4xl text-outline" />
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
                You haven't started a Kuri yet. Create one to begin inviting members.
              </p>
              <Button className="mt-1" onClick={() => navigate('/organizer/new')}>
                Start a New Kuri
              </Button>
            </div>
          )}

          {kuris.map((kuri) => (
            <button
              key={kuri.id}
              onClick={() => navigate(`/organizer/kuri/${kuri.id}`)}
              className="text-left rounded-xl bg-surface-container-lowest p-space-md shadow-md active:scale-[0.99] transition-transform"
              type="button"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface leading-snug">
                    {kuri.name}
                  </h3>
                  <p className="font-label-md text-label-md text-on-surface-variant">
                    Round {currentMonthIndex(kuri) + 1} of {kuri.num_months}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full font-label-caps text-label-caps shrink-0 ${
                    kuri.status === 'completed'
                      ? 'bg-surface-container-high text-on-surface-variant'
                      : 'bg-primary-fixed text-on-primary-fixed'
                  }`}
                >
                  {kuri.status === 'completed' ? 'Completed' : 'Active'}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Icon name="payments" className="text-[18px]" />
                  <span className="font-label-md text-label-md">Monthly Pot</span>
                </div>
                <span className="font-label-lg text-label-lg text-on-surface font-bold">
                  {formatCurrency(kuri.total_amount)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
      <OrganizerBottomNav />
    </>
  )
}
