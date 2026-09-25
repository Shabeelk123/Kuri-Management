import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'

export default function RoleChoice() {
  const navigate = useNavigate()

  return (
    <main className="flex-1 flex flex-col relative w-full max-w-xl mx-auto pt-safe pb-safe px-margin bg-surface min-h-screen">
      <div className="flex flex-col w-full pb-8">
        <header className="flex flex-col items-center text-center mt-8 mb-6">
          <div className="relative mb-3.5">
            <div className="w-20 h-20 rounded-2xl bg-surface-container-low shadow-sm flex items-center justify-center">
              <Icon name="menu_book" className="text-4xl text-primary" filled />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-secondary text-surface w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
              <Icon name="eco" className="text-[15px]" filled />
            </div>
          </div>
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider mb-1.5 px-3 py-0.5 rounded-full bg-surface-container-high">
            Traditional Rotating Savings
          </span>
          <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">
            Kuri Ledger
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mt-2 leading-relaxed">
            Save together in monthly rounds. Simple, safe, and transparent with family &amp; friends.
          </p>
        </header>

        <section aria-label="Account setup choices" className="flex flex-col gap-3.5 mb-6">
          <button
            onClick={() => navigate('/organizer/login')}
            className="group relative text-left w-full bg-primary-container text-on-primary rounded-xl p-4 sm:p-5 shadow-sm active:scale-[0.985] transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-secondary"
            type="button"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-inner">
                  <Icon name="flag_circle" className="text-2xl" filled />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-headline-md text-headline-md text-on-primary leading-tight">
                      I am organizing a Kuri
                    </span>
                    <span className="font-label-caps text-label-caps bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
                      Leader
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-primary-container mt-1 truncate">
                    Create a group, invite friends, and manage rounds
                  </p>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary group-hover:translate-x-0.5 transition-transform">
                <Icon name="arrow_forward" className="text-lg" />
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/member/login')}
            className="group relative text-left w-full bg-surface-container-lowest text-on-surface rounded-xl p-4 sm:p-5 shadow-sm active:scale-[0.985] transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-primary-container"
            type="button"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary-container flex items-center justify-center shrink-0">
                  <Icon name="group_add" className="text-2xl" filled />
                </div>
                <div className="min-w-0">
                  <span className="font-headline-md text-headline-md text-on-surface leading-tight">
                    I am part of a Kuri
                  </span>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 truncate">
                    Join an invitation or track your monthly payments
                  </p>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                <Icon name="arrow_forward" className="text-lg" />
              </div>
            </div>
          </button>
        </section>

        <footer className="mt-auto pt-4 flex flex-col items-center text-center">
          <div className="w-12 h-1 bg-surface-container-highest rounded-full mb-3" />
          <div className="flex items-center justify-center gap-1.5 text-on-surface-variant mb-1">
            <Icon name="shield_with_heart" className="text-base text-secondary" filled />
            <span className="font-label-md text-label-md font-semibold">
              Quiet, Honest &amp; Dignified Stewardship
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed">
            Designed like a quiet paper notebook — no ads, no fees, and no complex finance jargon.
          </p>
        </footer>
      </div>
    </main>
  )
}
