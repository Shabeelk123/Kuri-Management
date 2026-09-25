import { useNavigate } from 'react-router-dom'
import Icon from './Icon'

export default function TopBar({ title, subtitle, showBack = false, rightSlot }) {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 max-w-xl mx-auto px-margin flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          {showBack && (
            <button
              aria-label="Go back"
              onClick={() => navigate(-1)}
              className="w-12 h-12 -ml-2 rounded-full flex items-center justify-center text-primary active:bg-surface-container-high transition-colors shrink-0"
              type="button"
            >
              <Icon name="arrow_back_ios_new" className="text-2xl" />
            </button>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-headline-md text-headline-md text-primary leading-none truncate">
              {title}
            </span>
            {subtitle && (
              <span className="font-label-md text-label-md text-on-surface-variant font-medium truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          {rightSlot ?? (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
