# Deploy The World Cup Picks App

This app can run in two modes:

- Without Supabase keys, it saves only in each browser.
- With Supabase keys, everyone shares the same players, picks, results, standings, and calendar scores.

## 1. Create The Shared Database

1. Go to https://supabase.com and create a project.
2. Open the SQL Editor.
3. Paste everything from `supabase-schema.sql`.
4. Run it.

This creates one shared row for the whole family pool, plus readable tables for Supabase:

- `pool_state`: the master save data for the app
- `pool_players`: one row per player
- `match_results`: one row per World Cup game and score
- `player_picks`: one row per player pick

Anyone with the website link can update the pool, so only share it with people you trust.

## 2. Get Supabase Keys

In Supabase:

1. Open Project Settings.
2. Open API.
3. Copy the Project URL.
4. Copy the anon public key.

For local testing, create a `.env` file from `.env.example` and paste those values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Then run:

```bash
npm run dev
```

The top status should say the shared pool is connected or saved.

## 3. Deploy On Vercel

1. Push this project to GitHub.
2. Go to https://vercel.com and create a new project from the GitHub repo.
3. Use these settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add these Environment Variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

After deployment, send your family the Vercel URL.
