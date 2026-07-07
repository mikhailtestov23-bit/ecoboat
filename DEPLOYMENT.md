# Ecoboat Deployment

Ecoboat deploys as a Vite static app on Vercel and uses Supabase for the public leaderboard.

## Supabase

Create or select a Supabase project, then apply the migration:

```bash
npx supabase link --project-ref <project-ref>
npm run supabase:push
```

The migration creates `public.scores`, enables RLS, allows public reads, and allows bounded anonymous inserts for the MVP leaderboard.

Required frontend values:

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-or-publishable-key>
```

## Vercel

Set the same variables in Vercel:

```bash
npx vercel env add VITE_SUPABASE_URL production
npx vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
npx vercel env add VITE_SUPABASE_URL preview
npx vercel env add VITE_SUPABASE_PUBLISHABLE_KEY preview
```

Deploy:

```bash
npm run verify
npm run deploy:vercel
```

The Vercel build uses:

- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`

## Notes

The current leaderboard writes directly from the browser using the public Supabase key and RLS constraints. That is acceptable for an MVP or friendly leaderboard. For a more competitive public version, move score submission behind a Vercel function or Supabase Edge Function with rate limiting and stronger validation.
