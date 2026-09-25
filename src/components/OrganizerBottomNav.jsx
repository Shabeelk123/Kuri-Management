import { NavLink } from 'react-router-dom'
import Icon from './Icon'

const ITEMS = [
  { to: '/organizer', label: 'My Kuris', icon: 'savings', end: true },
  { to: '/organizer/profile', label: 'Profile', icon: 'account_circle', end: false },
]

export default function OrganizerBottomNav() {
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-2px_16px_rgba(31,58,46,0.05)]">
      <div className="max-w-xl mx-auto flex items-center justify-around h-20 px-space-sm">
        {ITEMS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[72px] h-14 transition-colors ${
                isActive ? 'text-primary-container font-bold' : 'text-on-surface-variant'
              }`
            }
          >
            <Icon name={icon} className="text-2xl" />
            <span className="font-label-md text-label-md mt-1 tracking-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
