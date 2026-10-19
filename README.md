# Connextions

A clone of the New York Times game "Connections" that lets you play **tomorrow's** puzzle today.
NYT publishes each puzzle's JSON a day early, and this app serves it.

Live at https://heytonyy.github.io/connextion/

## How it works

- React + Vite + Redux Toolkit + Tailwind, deployed as a static site to GitHub Pages.
- NYT's puzzle endpoint (`https://www.nytimes.com/svc/connections/v2/YYYY-MM-DD.json`) doesn't send CORS
  headers, so the browser can't fetch it directly. Instead `scripts/fetch-puzzles.mjs` downloads the
  puzzles around today's date into `public/puzzles/` at build time.
- `.github/workflows/deploy.yml` rebuilds and redeploys every 3 hours, so the newest puzzle is picked up
  soon after NYT publishes it.
- The app loads the player's local "tomorrow". If that puzzle isn't out yet, it falls back to the newest one available.
- Progress (including the timer) is saved in localStorage.
- Four wrong guesses ends the game. The board freezes until the player resets that day's puzzle.
- Finishing a puzzle lets the player add their initials to that day's leaderboard on Supabase.
  Without Supabase configured, the game still works but has no leaderboard.

## Leaderboard (Supabase)

Completions can't simply be posted from the browser. When a round starts, the `start-game` edge
function fetches that day's answers from NYT and records the start time. When the player
finishes, `submit-score` replays their guesses against the stored answers. Every group must be
found with at most 3 mistakes and no repeated guesses. The time comes from the server's clock
(start to submit). Only the edge functions can write to `completions`; anyone can read it.

Setup:

1. Create a Supabase project, then link it:
   `npx supabase login && npx supabase link --project-ref <ref>`
2. Create the tables: `npx supabase db push`
3. Deploy the functions:
   `npx supabase functions deploy start-game --no-verify-jwt`
   `npx supabase functions deploy submit-score --no-verify-jwt`
4. Set the project URL and anon (publishable) key:
   - locally in `.env.local`: `VITE_SUPABASE_URL=...` and `VITE_SUPABASE_ANON_KEY=...`
   - for the GitHub Pages build, as repository **variables** `SUPABASE_URL` and
     `SUPABASE_ANON_KEY` (Settings → Secrets and variables → Actions → Variables)

Never put the `service_role` key in the client; the edge functions get it automatically.

## Development

```sh
npm install
npm run dev      # fetches puzzles, then starts Vite on http://localhost:3000
npm run build    # fetches puzzles, type-checks, builds to dist/
npm run preview  # serves dist/
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
