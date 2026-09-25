import { NavLink } from 'react-router-dom'
import Icon from './Icon'

const ITEMS = [
  { to: '/member/kuris', label: 'My Kuris', icon: 'savings' },
  { to: '/member/invitations', label: 'Invitations', icon: 'mark_email_unread' },
  { to: '/member/updates', label: 'Updates', icon: 'notifications' },
  { to: '/member/profile', label: 'Profile', icon: 'account_circle' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-2px_16px_rgba(31,58,46,0.05)]">
      <div className="max-w-xl mx-auto flex items-center justify-around h-20 px-space-sm">
        {ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
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
