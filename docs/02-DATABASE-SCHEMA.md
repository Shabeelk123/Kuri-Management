# Database Schema

Run this in Supabase's SQL Editor. Tables map directly to the validated
prototype's data model.

## Tables

```sql
-- Organizers (one row per organizer, linked to Supabase auth user)
create table organizers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  created_at timestamptz default now()
);

-- Kuris (groups)
create table kuris (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references organizers(id) on delete cascade,
  name text not null,
  total_amount numeric not null,
  monthly_installment numeric not null,
  num_months int not null,
  start_date date not null,
  due_day int not null default 5,
  status text not null default 'active', -- active | completed
  created_at timestamptz default now()
);

-- Members (one row per person per Kuri — a phone number can appear
-- in multiple Kuris as separate rows)
create table members (
  id uuid primary key default gen_random_uuid(),
  kuri_id uuid not null references kuris(id) on delete cascade,
  name text not null,
  phone text not null,
  status text not null default 'pending', -- pending | accepted | declined
  has_received boolean not null default false,
  invited_at timestamptz default now(),
  responded_at timestamptz
);
create index idx_members_phone on members(phone);
create index idx_members_kuri on members(kuri_id);

-- Payments (one row per member per month once paid)
create table payments (
  id uuid primary key default gen_random_uuid(),
  kuri_id uuid not null references kuris(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  month int not null, -- 0-indexed month number within the Kuri
  amount numeric not null,
  status text not null default 'paid',
  paid_at timestamptz default now(),
  unique (kuri_id, member_id, month)
);

-- Recipients (permanent once written — one row per Kuri per month)
create table recipients (
  id uuid primary key default gen_random_uuid(),
  kuri_id uuid not null references kuris(id) on delete cascade,
  month int not null,
  member_id uuid not null references members(id),
  selection_type text not null, -- manual | auto
  confirmed_at timestamptz default now(),
  unique (kuri_id, month)
);

-- Notifications (feed shown in the member's Updates tab)
create table notifications (
  id uuid primary key default gen_random_uuid(),
  kuri_id uuid not null references kuris(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  type text not null, -- invited | reminder | payment_due | payment_recorded | recipient
  message text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);
create index idx_notifications_member on notifications(member_id);
```

## Row Level Security (RLS)

Enable RLS so organizers only see their own data, and members only see
their own records.

```sql
alter table organizers enable row level security;
alter table kuris enable row level security;
alter table members enable row level security;
alter table payments enable row level security;
alter table recipients enable row level security;
alter table notifications enable row level security;

-- Organizers can only read/write their own profile
create policy "organizer reads own profile"
  on organizers for select using (auth.uid() = id);
create policy "organizer updates own profile"
  on organizers for update using (auth.uid() = id);

-- Organizers manage only their own Kuris
create policy "organizer manages own kuris"
  on kuris for all
  using (auth.uid() = organizer_id)
  with check (auth.uid() = organizer_id);

-- Members: readable by the Kuri's organizer, or by the member themselves
-- (member auth is phone-based — see note below)
create policy "organizer manages members of own kuris"
  on members for all
  using (kuri_id in (select id from kuris where organizer_id = auth.uid()));
```

> **Note on member access:** members sign in by phone OTP through
> Supabase Auth too, but they don't own an `organizers` row. Give each
> authenticated member read access to `members`/`payments`/`recipients`/
> `notifications` rows where `phone = auth.jwt() ->> 'phone'`. Add these
> policies once phone auth is wired up:
>
> ```sql
> create policy "member reads own member rows"
>   on members for select
>   using (phone = auth.jwt() ->> 'phone');
>
> create policy "member accepts or declines own invite"
>   on members for update
>   using (phone = auth.jwt() ->> 'phone');
> ```
> Apply the same `phone` pattern to `payments`, `recipients` (read-only,
> scoped via a join on `members`), and `notifications`.

## Notes on the model

- **`month` is 0-indexed** and relative to `kuris.start_date` — month 0
  is the first month, month 1 the second, etc. Compute the current month
  index in the frontend from today's date vs `start_date`.
- **`recipients` is intentionally append-only** from the app's
  perspective — once a row exists for a `(kuri_id, month)` pair, the UI
  should treat it as permanent and never offer to change it.
- Extending later: online payments → add a `payment_method` and
  `transaction_ref` column to `payments`; multiple organizers/staff per
  Kuri → add a `kuri_staff` join table; auction-style Kuris → add
  `discount_amount` to `recipients`.
