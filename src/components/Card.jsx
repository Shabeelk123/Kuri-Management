export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-xl bg-surface-container-lowest p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
