# FFK WARS – Deployment

## Vercel Environment Variables

Add these variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

The admin login uses the fixed server-side username/password variables. Do not put the admin password or session secret in frontend code.

## Default example

Username:
`FFK_ADMIN`

Password:
`change-this-password`

Change the password before production deployment.

## Deployment

1. Upload/push this folder to GitHub.
2. Import the repository into Vercel.
3. Add the environment variables above.
4. Deploy.
5. Open `/admin/login`.
