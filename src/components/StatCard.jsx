export default function StatCard({ label, value, icon, tone = 'primary' }) {
  const valueClass = tone === 'secondary' ? 'text-secondary font-numeric-sub text-numeric-sub' : 'text-primary font-headline-lg text-headline-lg'
  return (
    <div className="flex flex-col p-3 rounded-lg bg-surface-container-low">
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
        {icon}
      </div>
      <div className={`mt-0.5 ${valueClass}`}>{value}</div>
    </div>
  )
}
