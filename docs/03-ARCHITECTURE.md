# Architecture

## Folder structure

```
src/
  components/
    StatusChip.jsx       # Paid / Not yet paid / Joined / Waiting labels
    ListRow.jsx           # shared row pattern (members, payments, history)
    StatCard.jsx           # big number + short label
    ProgressBar.jsx
    BottomNav.jsx          # member-only: Invites / My Kuris / Updates
    TopBar.jsx              # app name + role switch
    Button.jsx
  pages/
    RoleChoice.jsx
    organizer/
      Dashboard.jsx
      CreateKuri.jsx
      KuriDetail.jsx        # tabs: Overview, Members, Payments, Pick recipient, Past recipients
    member/
      Login.jsx             # phone entry
      VerifyOtp.jsx
      Invitations.jsx
      MyKuris.jsx
      KuriDetail.jsx
      Updates.jsx
  lib/
    supabase.js
    dates.js               # month index / due date helpers
    format.js              # currency + date formatting
  hooks/
    useOrganizerKuris.js
    useKuriDetail.js
    useMemberRecords.js
  App.jsx
  main.jsx
```

## Routing

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

<BrowserRouter>
  <Routes>
    <Route path="/" element={<RoleChoice />} />

    <Route path="/organizer" element={<OrganizerDashboard />} />
    <Route path="/organizer/new" element={<CreateKuri />} />
    <Route path="/organizer/kuri/:kuriId" element={<KuriDetail />} />

    <Route path="/member/login" element={<Login />} />
    <Route path="/member/verify" element={<VerifyOtp />} />
    <Route path="/member/invitations" element={<Invitations />} />
    <Route path="/member/kuris" element={<MyKuris />} />
    <Route path="/member/kuri/:memberId" element={<MemberKuriDetail />} />
    <Route path="/member/updates" element={<Updates />} />
  </Routes>
</BrowserRouter>
```

## Data fetching pattern

Keep Supabase calls out of components — put them in `hooks/`. Example:

```js
// hooks/useOrganizerKuris.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useOrganizerKuris(organizerId) {
  const [kuris, setKuris] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!organizerId) return
    supabase
      .from('kuris')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setKuris(data ?? [])
        setLoading(false)
      })
  }, [organizerId])

  return { kuris, loading }
}
```

Components stay presentational:

```jsx
function Dashboard() {
  const { kuris, loading } = useOrganizerKuris(organizerId)
  if (loading) return <Spinner />
  return <div>{kuris.map(k => <ListRow key={k.id} kuri={k} />)}</div>
}
```

## Recipient selection ("Pick for me" animation)

Keep the wheel purely client-side — it's a UI moment, not a random
source of truth. Pick the winner with `Math.random()` on the eligible
members array, animate a highlight cycling through the list, then write
one row to `recipients` and stop. Never let the animation itself decide
anything asynchronously — decide the winner first, animate toward it.

## Month/date helpers (`lib/dates.js`)

Port these directly from the prototype — they're pure functions with no
dependencies:

- `addMonths(dateStr, n)` — start date + n months, clamped to the last
  valid day of that month
- `monthLabel(startDate, index)` — e.g. "October 2026"
- `dueDateForMonth(kuri, index)` — due date for a given month index
- `currentMonthIndex(kuri)` — today's position within the Kuri's timeline

## State that must never be optimistic

Recipient confirmation is permanent by design — don't let the UI show a
selection as confirmed until the Supabase write succeeds. Payment
mark-as-paid can be optimistic (fast feedback, roll back on error) since
it's reversible.
