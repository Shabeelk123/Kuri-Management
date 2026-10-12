-- ============================================================
-- Database Reset — wipe all data, keep schema & RLS policies
--
-- Run this in Supabase Dashboard → SQL Editor
--
-- Order matters: child tables before parents (FK constraints).
-- RESTART IDENTITY resets auto-increment sequences.
-- CASCADE handles any remaining FK dependencies.
-- ============================================================

-- ── 1. Wipe all app data ─────────────────────────────────────
truncate table notifications restart identity cascade;
truncate table recipients    restart identity cascade;
truncate table payments      restart identity cascade;
truncate table members       restart identity cascade;
truncate table kuris         restart identity cascade;
truncate table organizers    restart identity cascade;

-- ── 2. Wipe Supabase Auth users ──────────────────────────────
-- Deleting from auth.users cascades to organizers (via FK).
-- This removes both organizer and member auth accounts.
delete from auth.users;

-- ── Done ─────────────────────────────────────────────────────
-- Schema, RLS policies, and helper functions are untouched.
-- Re-register organizer and member accounts from scratch.
