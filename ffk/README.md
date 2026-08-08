# FFK WARS — Live Tournament & Points Table

A real-time tournament platform for FFK WARS with admin management for tournaments, teams, matches, scoring and live points.

## Important: Admin login

This version **does not use Supabase Authentication for the admin login**.

The admin login is:

- Username: the value of `ADMIN_USERNAME`
- Password: the value of `ADMIN_PASSWORD`

The credentials are checked on the server. After a successful login, the server creates an HTTP-only signed session cookie. `/admin/*` and `/api/admin/*` are protected by that cookie.

Supabase is still used for:
- Postgres database
- Realtime live updates
- Public team-logo storage
- Public read-only tournament data

The browser never receives the Supabase service-role key.

## Environment variables

Set these in Vercel for **Production** and **Preview**:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

ADMIN_USERNAME=FFK_ADMIN
ADMIN_PASSWORD=ffk123
ADMIN_SESSION_SECRET=use-a-long-random-secret
```

`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` must remain server-only.

### If you already have the old Supabase Auth setup

You do **not** need to create a Supabase Auth user for the FFK WARS admin anymore. The old `admins` table and Auth users can remain in the database; this application version simply does not use them for login.

## Local run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin/login
```

## Deploy

1. Push the project to GitHub.
2. Import it into Vercel.
3. Add all environment variables above.
4. Redeploy after changing environment variables.
5. Open `/admin/login`.

## Admin capabilities

The admin can:

- Create/edit/delete tournaments
- Add/edit/delete teams
- Upload team logos
- Create/start/end/delete matches
- Configure placement points
- Configure kill points
- Enter live match results
- View the live leaderboard

Public viewers can:

- View the live tournament
- View teams
- View matches
- View completed tournament history
- View the live points table

## Live updates

Supabase Realtime continues to broadcast database changes to public viewers. Admin writes are performed through protected Next.js server API routes using the server-only Supabase service-role key.

The authoritative points are still calculated by the existing Postgres trigger in `supabase/schema.sql`.

## Project structure

```text
app/
  public pages
  admin/
  api/admin/
components/
lib/
supabase/
middleware.ts
```

No player-management system is included; teams are the managed competition entity.
