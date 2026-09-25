const ITEM_HEIGHT = 56
const LOOPS = 6

function shuffled(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Builds a repeated, shuffled strip of members ending on the winner, plus the translateY needed to center it. */
export function buildReelSpin({ members, winnerId }) {
  const items = []
  for (let i = 0; i < LOOPS; i++) {
    items.push(...shuffled(members))
  }
  let targetIndex = -1
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].id === winnerId) {
      targetIndex = i
      break
    }
  }
  const translateY = ITEM_HEIGHT * (1 - targetIndex)
  return { items, translateY }
}

export default function RecipientReel({ items, translateY, spinning }) {
  return (
    <div
      className="relative w-full max-w-[280px] overflow-hidden rounded-xl bg-surface-container-low shadow-inner"
      style={{ height: ITEM_HEIGHT * 3 }}
    >
      <div className="absolute inset-x-0 top-0 h-full pointer-events-none z-10">
        <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-surface-container-low to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-surface-container-low to-transparent" />
        <div
          className="absolute inset-x-0 border-y-2 border-secondary/60"
          style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
        />
      </div>
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          transition: spinning ? 'transform 4s cubic-bezier(0.15, 0.65, 0.1, 1)' : 'none',
        }}
      >
        {items.map((m, i) => (
          <div
            key={`${m.id}-${i}`}
            className="flex items-center justify-center font-headline-md text-headline-md text-primary"
            style={{ height: ITEM_HEIGHT }}
          >
            {m.name}
          </div>
        ))}
      </div>
    </div>
  )
}
