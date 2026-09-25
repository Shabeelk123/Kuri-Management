# Roadmap

Build in this order — each phase produces something testable before
moving on.

## Phase 1 — Foundation
- [ ] Vite + React project running locally
- [ ] Tailwind configured with tokens from `04-DESIGN-TOKENS.md`
- [ ] Supabase project created, schema from `02-DATABASE-SCHEMA.md` applied
- [ ] Phone OTP auth working for a test user (organizer)
- [ ] Basic routing shell in place (empty pages, navigation works)

**Done when:** you can sign in with a phone number and land on an empty
dashboard.

## Phase 2 — Organizer flow
- [ ] Create Kuri form → writes to `kuris`
- [ ] Dashboard lists the organizer's own Kuris only (RLS working)
- [ ] Add member (name + phone) → writes to `members`, status `pending`
- [ ] Members list shows pending/accepted/declined
- [ ] Mark payment paid/unpaid for current month
- [ ] Overview tab: collected vs expected, overdue count

**Done when:** an organizer can create a Kuri, add members, and record
a payment, all reflected correctly in Supabase.

## Phase 3 — Recipient selection
- [ ] Eligible members list (accepted, `has_received = false`)
- [ ] Manual select + confirm → writes to `recipients`, permanent
- [ ] Auto select with the pick animation, same permanent write
- [ ] Past recipients list, ordered by month

**Done when:** confirming a recipient locks that month and shows in history.

## Phase 4 — Member flow
- [ ] Member phone sign-in (separate from organizer sign-in)
- [ ] Invitations tab: accept/decline updates `members.status`
- [ ] My Kuris list (accepted only)
- [ ] Kuri detail: amount, due date, this month's status, recipient,
      payment history, progress bar
- [ ] Updates tab reads from `notifications`

**Done when:** a member can accept an invite and see accurate status
for a Kuri the organizer is managing.

## Phase 5 — Real notifications
- [ ] Supabase Edge Function triggered on: member invited, payment
      recorded, recipient confirmed, reminder sent
- [ ] WhatsApp Business API integration (Twilio or Gupshup) from the
      Edge Function
- [ ] Insert into `notifications` table on the same trigger, so the
      in-app Updates tab and the WhatsApp message stay in sync

**Done when:** adding a member sends both an in-app notification and a
real WhatsApp message.

## Phase 6 — Polish & deploy
- [ ] Responsive check at 375px, 390px, 430px widths
- [ ] `manifest.json` + basic service worker for "Add to Home Screen"
- [ ] Empty states for every list (no Kuris yet, no members yet, etc.)
- [ ] Deploy frontend to Vercel/Netlify, confirm env vars are set there
- [ ] Real-device test on at least one Android and one iOS phone

**Done when:** a real organizer and a real member can run one full
month's cycle on their own phones, without your help.

## Deliberately deferred (per the original MVP scope)
- Online payments / UPI
- Auction/discount-based Kuri variants
- PDF/Excel report exports
- Multiple staff per organizer
- Organizer billing/subscription plans

The schema already leaves room for these (see the "Notes on the model"
section in `02-DATABASE-SCHEMA.md`) — don't build them until the core
loop above is validated with real users.
