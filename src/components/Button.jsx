const VARIANTS = {
  primary:
    'bg-primary-container text-on-primary shadow-sm active:scale-[0.985]',
  secondary:
    'bg-surface-container-high text-on-surface border border-surface-dim active:scale-[0.985]',
  ghost: 'bg-transparent text-outline active:text-primary-container',
  danger: 'bg-error text-on-error shadow-sm active:scale-[0.985]',
}

const SIZES = {
  lg: 'h-14 rounded-xl',
  md: 'h-12 rounded-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'lg',
  icon,
  className = '',
  ...props
}) {
  return (
    <button
      className={`w-full flex items-center justify-center gap-2 font-label-lg text-label-lg font-bold transition-transform disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
