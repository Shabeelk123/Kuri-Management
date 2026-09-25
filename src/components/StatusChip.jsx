const STATUS = {
  pending: { label: 'Waiting', className: 'bg-secondary-container/40 text-on-secondary-container' },
  accepted: { label: 'Joined', className: 'bg-primary-fixed text-on-primary-fixed' },
  declined: { label: 'Declined', className: 'bg-error-container text-on-error-container' },
  paid: { label: 'Paid', className: 'bg-primary-fixed text-on-primary-fixed' },
  unpaid: { label: 'Not yet paid', className: 'bg-secondary-container/40 text-on-secondary-container' },
  overdue: { label: 'Overdue', className: 'bg-error-container text-on-error-container' },
}

export default function StatusChip({ status, className = '' }) {
  const { label, className: statusClassName } = STATUS[status] ?? STATUS.pending
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md font-semibold ${statusClassName} ${className}`}
    >
      {label}
    </span>
  )
}
