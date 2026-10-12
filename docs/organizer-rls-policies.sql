-- ============================================================
-- Organizer RLS Policies for payments, recipients, notifications
--
-- The schema (02-DATABASE-SCHEMA.md) already covers:
--   ✅  organizers  — select / update own row
--   ✅  kuris       — all operations (organizer_id = auth.uid())
--   ✅  members     — all operations (kuri_id in own kuris)
--
-- Missing policies that cause 403 errors:
--   ❌  payments    — organizer can't insert/delete/select
--   ❌  recipients  — organizer can't insert/select
--   ❌  notifications — organizer can't insert/select
--
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Drop old policies (idempotent re-run) ────────────────────
drop policy if exists "organizer manages payments of own kuris"      on payments;
drop policy if exists "organizer manages recipients of own kuris"    on recipients;
drop policy if exists "organizer manages notifications of own kuris" on notifications;

-- ── payments ─────────────────────────────────────────────────
-- Organizer inserts/deletes payment rows when marking paid/unpaid.
-- Scoped: payments.kuri_id must belong to the signed-in organizer.
create policy "organizer manages payments of own kuris"
  on payments for all
  using (
    kuri_id in (
      select id from kuris where organizer_id = auth.uid()
    )
  )
  with check (
    kuri_id in (
      select id from kuris where organizer_id = auth.uid()
    )
  );

-- ── recipients ───────────────────────────────────────────────
-- Organizer inserts a recipient row when picking the month's winner.
create policy "organizer manages recipients of own kuris"
  on recipients for all
  using (
    kuri_id in (
      select id from kuris where organizer_id = auth.uid()
    )
  )
  with check (
    kuri_id in (
      select id from kuris where organizer_id = auth.uid()
    )
  );

-- ── notifications ────────────────────────────────────────────
-- Organizer inserts notifications when recording payments,
-- opening rounds, or picking recipients.
create policy "organizer manages notifications of own kuris"
  on notifications for all
  using (
    kuri_id in (
      select id from kuris where organizer_id = auth.uid()
    )
  )
  with check (
    kuri_id in (
      select id from kuris where organizer_id = auth.uid()
    )
  );
