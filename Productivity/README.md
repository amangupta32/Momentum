# Momentum

Momentum is a React + TypeScript + Vite goal and task workspace. This update removes the built-in fictional people and seed tasks, adds real Supabase email/password authentication screens, and scopes remaining browser-stored personal data by authenticated account.

## Run locally

1. Install Node.js (current LTS).
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Create a project at https://supabase.com/dashboard.
5. In Supabase Project Settings → API, copy the project URL and publishable/anon key into `.env`:
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
6. In Supabase Authentication → URL Configuration, set your local site URL to `http://localhost:5173`. Add your eventual deployed website URL to the allowed redirect URLs.
7. Configure email confirmation as desired under Authentication.
8. Run `npm run dev`.

Do not put a service-role key in the frontend or commit `.env`.

## Database foundation

`supabase/schema.sql` contains the initial PostgreSQL tables and Row Level Security policies for profiles, workspaces, memberships, invitations, goals, tasks, notes, and activity events. Review and apply it in the Supabase SQL Editor before using these tables.

## Important current scope

- Email/password registration, sign-in, password-reset request, session restoration, and sign-out use Supabase Auth's HTTP API.
- There is no prefilled demo user or seeded task data.
- Goal/task/note screens currently use account-scoped browser storage. They are **not yet synchronized to the cloud or to other team members**.
- The SQL schema is a foundation; team invitation creation/joining, cloud CRUD wiring for the existing views, and Realtime subscriptions still need to be connected before describing Momentum as a complete multi-user collaboration product.
- The app requires a configured Supabase project for authentication to work. Without configuration, the login screen explains what is missing.
