export default function Icon({ name, className = '', filled = false, size }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: filled ? "'FILL' 1" : undefined,
        fontSize: size,
      }}
    >
      {name}
    </span>
  )
}
