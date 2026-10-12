-- ============================================================
-- Member RLS Policies for phone-based login (email/password
-- with synthetic email + user_metadata.phone)
--
-- Run this in Supabase Dashboard → SQL Editor
--
-- Drops old policies first (which used the wrong JWT path for
-- Supabase phone OTP), then recreates with user_metadata path.
-- ============================================================

-- ── Drop old policies ───────────────────────────────────────
drop policy if exists "member reads own kuris"                on kuris;
drop policy if exists "member reads own member rows"          on members;
drop policy if exists "member reads members in own kuris"     on members;
drop policy if exists "member accepts or declines own invite" on members;
drop policy if exists "member reads own payments"             on payments;
drop policy if exists "member reads recipients in own kuris"  on recipients;
drop policy if exists "member reads own notifications"        on notifications;
drop policy if exists "member marks own notifications read"   on notifications;

-- ── Helper function (breaks RLS recursion) ─────────────────
-- The kuris policy cannot subquery `members` directly while
-- members' own RLS is active — Postgres detects a cycle.
-- Running the subquery inside a SECURITY DEFINER function
-- bypasses RLS on `members` for that one lookup, breaking
-- the cycle cleanly.
create or replace function get_my_kuri_ids()
  returns setof uuid
  language sql
  security definer   -- runs as function owner, skips RLS on members
  stable
as $$
  select kuri_id
  from   members
  where  phone = (auth.jwt() -> 'user_metadata' ->> 'phone')
$$;

-- Same pattern for member IDs — used by payments / recipients / notifications.
-- Without SECURITY DEFINER the subquery triggers members RLS which may
-- re-enter the calling policy, causing "infinite recursion" or silent nulls.
create or replace function get_my_member_ids()
  returns setof uuid
  language sql
  security definer
  stable
as $$
  select id
  from   members
  where  phone = (auth.jwt() -> 'user_metadata' ->> 'phone')
$$;

-- ── kuris ───────────────────────────────────────────────────
-- Members must be able to SELECT kuris so that the
-- useMemberRecords join (select '*, kuris(*)') returns data.
create policy "member reads own kuris"
  on kuris for select
  using (
    id in (select get_my_kuri_ids())
  );

-- ── members ────────────────────────────────────────────────
-- Allow a member to read ALL members in any kuri they belong to.
-- This is needed so that joins like recipients(*, members(name))
-- resolve the recipient's name for every member in the group,
-- not just the member whose own row it is.
create policy "member reads members in own kuris"
  on members for select
  using (
    kuri_id in (select get_my_kuri_ids())
  );

create policy "member accepts or declines own invite"
  on members for update
  using (
    phone = (auth.jwt() -> 'user_metadata' ->> 'phone')
  );

-- ── payments ────────────────────────────────────────────────
create policy "member reads own payments"
  on payments for select
  using (
    member_id in (select get_my_member_ids())
  );

-- ── recipients ──────────────────────────────────────────────
create policy "member reads recipients in own kuris"
  on recipients for select
  using (
    kuri_id in (select get_my_kuri_ids())
  );

-- ── notifications ───────────────────────────────────────────
create policy "member reads own notifications"
  on notifications for select
  using (
    member_id in (select get_my_member_ids())
  );

create policy "member marks own notifications read"
  on notifications for update
  using (
    member_id in (select get_my_member_ids())
  );
