export default function ListRow({ icon, title, subtitle, right, rightSub, onClick }) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="w-full py-3.5 flex items-center justify-between gap-3 text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="font-body-lg text-body-lg font-bold text-primary leading-tight truncate">
            {title}
          </h4>
          {subtitle && (
            <p className="font-label-md text-label-md text-on-surface-variant truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {(right || rightSub) && (
        <div className="text-right shrink-0">
          {right && <div className="font-body-lg text-body-lg font-bold text-primary">{right}</div>}
          {rightSub && <div className="font-label-md text-label-md text-on-surface-variant">{rightSub}</div>}
        </div>
      )}
    </Wrapper>
  )
}
