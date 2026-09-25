# Design Tokens

These match the simplified, non-jargon Stitch brief (warm, calm, no
commission framing, mobile-first). Wire them into `tailwind.config.js`
so every component pulls from one source.

## Colors

| Token       | Hex       | Use                                  |
|-------------|-----------|----------------------------------------|
| `cream`     | `#F1ECDF` | App background                        |
| `card`      | `#FFFDF8` | Card / row background                 |
| `green`     | `#1F3A2E` | Primary brand color, primary buttons  |
| `gold`      | `#B8863D` | Accent, progress fill, key highlights |
| `line`      | `#DCD4BE` | Hairline borders/dividers             |
| `ink`       | `#22261F` | Primary text                          |
| `ink-soft`  | `#5B5B4F` | Secondary/muted text                  |
| `good`      | `#3B7A57` | "Paid" / positive status              |
| `good-bg`   | `#E4EFE6` | Background for positive status chips  |
| `warn`      | `#B5482A` | "Overdue" — use sparingly, not alarming |
| `warn-bg`   | `#F5E2D8` | Background for warn status chips      |

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      cream: '#F1ECDF',
      card: '#FFFDF8',
      brand: { DEFAULT: '#1F3A2E', dark: '#16281F' },
      gold: '#B8863D',
      line: '#DCD4BE',
      ink: { DEFAULT: '#22261F', soft: '#5B5B4F' },
      good: { DEFAULT: '#3B7A57', bg: '#E4EFE6' },
      warn: { DEFAULT: '#B5482A', bg: '#F5E2D8' },
    },
    fontFamily: {
      sans: ['Inter', 'Nunito', 'system-ui', 'sans-serif'],
    },
    borderRadius: {
      DEFAULT: '10px',
    },
  },
}
```

## Typography

- One typeface throughout: **Inter** or **Nunito** (simple brief uses a
  single friendly sans-serif, not a serif/sans pairing).
- Base body size: **16–18px** — larger than typical app defaults, for
  readability by non-technical/older users.
- Headings: 600 weight, not much larger than body — avoid dramatic size
  jumps that feel like a marketing page.

## Spacing & layout

- Mobile-first viewport target: **~390px** width.
- One primary action per screen — if a screen has two buttons, one
  should visually read as primary (filled) and the other secondary
  (outline).
- Bottom-anchored primary buttons on forms, within thumb reach.
- Minimal border-radius (`8–10px`) — not fully rounded/bubbly.
- Hairline dividers (`1px solid line`) between list rows instead of
  card shadows.

## Status chip language

Keep labels plain, not financial jargon:

| State      | Label           | Color    |
|------------|-----------------|----------|
| Invited    | "Waiting"       | gold/soft |
| Accepted   | "Joined"        | good     |
| Declined   | "Declined"      | warn (muted) |
| Paid       | "Paid"          | good     |
| Unpaid     | "Not yet paid"  | gold/soft (not red) |
| Overdue    | "Overdue"       | warn — only after due date passes |

## Component reuse checklist

Before building a new component, check whether `ListRow`, `StatCard`,
`StatusChip`, or `ProgressBar` already covers it — the whole app should
feel like variations of a handful of primitives, not one-off screens.
