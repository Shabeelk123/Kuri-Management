# Kuri Ledger — Developer Docs

A mobile-first web app for managing Kuri groups (rotating monthly savings
groups). Two roles: **Organizer** (runs the group) and **Member**
(participates in it). No commission or fee — the organizer just manages
collection and payouts on the group's behalf.

## Stack

| Layer      | Choice                                   |
|------------|-------------------------------------------|
| Frontend   | React + Vite                              |
| Styling    | Tailwind CSS                              |
| Backend    | Supabase (Postgres + Auth + Edge Functions) |
| Auth       | Supabase phone OTP                        |
| Messaging  | WhatsApp Business API (via Twilio/Gupshup), called from Edge Functions |
| Hosting    | Vercel or Netlify (frontend) + Supabase (backend) |

## Read these in order

1. **[01-SETUP.md](./01-SETUP.md)** — get the project running locally
2. **[02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md)** — tables, relationships, RLS policies
3. **[03-ARCHITECTURE.md](./03-ARCHITECTURE.md)** — folder structure, routing, component patterns
4. **[04-DESIGN-TOKENS.md](./04-DESIGN-TOKENS.md)** — colors, type, spacing to wire into Tailwind
5. **[05-ROADMAP.md](./05-ROADMAP.md)** — build order, phase by phase

## Core concept, in one paragraph

An Organizer creates a Kuri (a name, total amount, monthly installment,
number of members/months, a start date, and a due day). They invite
members by phone number. Each month, every active member pays the fixed
installment; the Organizer marks payments as received. Each month, the
Organizer selects one member (manually or automatically) to receive that
month's full pooled amount — once confirmed, that choice is permanent and
visible to everyone. This repeats until every member has had a turn.
