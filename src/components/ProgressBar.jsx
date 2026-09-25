export default function ProgressBar({ percent, className = '' }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className={`h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden ${className}`}>
      <div
        className="bg-primary-container h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
