# Connextions

A clone of the New York Times game [Connections](https://www.nytimes.com/games/connections) that lets you play **tomorrow's** puzzle today. NYT publishes each puzzle a day early, and Connextions serves it before it goes live.

**Play it:** https://heytonyy.github.io/connextion/

## Features

- Pick a date from the dropdown (today through a week ahead). Dates NYT hasn't published yet show a "come back later" message.
- Four mistakes ends the game. The board freezes until you reset.
- "One away..." hints, and repeated guesses don't cost a mistake.
- Progress and the timer are saved in your browser, so a reload doesn't lose your game.
- Optional daily leaderboard: finish a puzzle and add your initials. Limited to one entry per device per day.

## Getting started

You need [Node.js](https://nodejs.org/) 22 or newer and git.

```sh
git clone https://github.com/heytonyy/connextion.git
cd connextion
npm install
npm run dev
```

Then open http://localhost:3000.

`npm run dev` downloads the current puzzles first, so you need an internet connection. The game works without any other setup. The leaderboard only appears once Supabase is configured (see [Leaderboard](#leaderboard-optional)).

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Downloads puzzles, then starts the dev server on port 3000 |
| `npm run build` | Downloads puzzles, type-checks, and builds the static site to `dist/` |
| `npm run preview` | Serves the `dist/` build locally |
| `npm run fetch-puzzles` | Only downloads puzzles into `public/puzzles/` |

## How it works

NYT's puzzle files (`https://www.nytimes.com/svc/connections/v2/YYYY-MM-DD.json`) can't be fetched from the browser because the server doesn't allow cross-origin requests. Instead, [`scripts/fetch-puzzles.mjs`](scripts/fetch-puzzles.mjs) downloads the puzzles for the days around today at build time. It saves them to `public/puzzles/`, along with an `index.json` listing which dates are available, and they ship as part of the static site.

Since NYT only publishes one day ahead, the site has to be rebuilt regularly. The [deploy workflow](.github/workflows/deploy.yml) runs on every push to `main` and every 3 hours.

### Project structure

```
src/
  App.tsx          page layout, date picker, game over / win screens
  components/      board, cards, buttons, modals, leaderboard
  hooks/           puzzle loading and leaderboard game registration
  lib/             Supabase client
  state/           Redux store (saved to localStorage)
  utils/           puzzle parsing, dates, formatting
scripts/           build-time puzzle download
supabase/          database migrations and edge functions for the leaderboard
```

## Leaderboard (optional)

The leaderboard runs on [Supabase](https://supabase.com/). Scores are never written straight from the browser:

1. When a game starts, the `start-game` edge function downloads that day's answers and records the start time.
2. When the player finishes, `submit-score` replays their guesses against those answers and measures the time with the server's clock. The guesses have to solve the puzzle with at most 3 mistakes and no repeats.
3. Only the edge functions can write to the `completions` table. Anyone can read it.

Each browser gets a random device ID, and a device can have only one entry per puzzle day. Clearing site data or using a private window counts as a new device.

### Setup

1. Create a Supabase project and link this repo to it:
   ```sh
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   ```
2. Create the tables:
   ```sh
   npx supabase db push
   ```
3. Deploy the edge functions:
   ```sh
   npx supabase functions deploy start-game --no-verify-jwt
   npx supabase functions deploy submit-score --no-verify-jwt
   ```
4. Add your project URL and anon (publishable) key. Both are in your project's settings in the Supabase dashboard.
   - **Locally:** create a `.env.local` file in the project root:
     ```
     VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
     VITE_SUPABASE_ANON_KEY=<your-anon-key>
     ```
   - **On GitHub Pages:** add repository **variables** (not secrets) named `SUPABASE_URL` and `SUPABASE_ANON_KEY` under Settings → Secrets and variables → Actions → Variables.

The anon key is meant to be public. Never put the `service_role` key in `.env.local` or the site, because the edge functions already get it from Supabase.

When a change adds a new migration, run `npx supabase db push` before deploying the functions, then push the site.

## Deploying your own copy

1. Fork or clone the repo into your GitHub account. The site is served at `https://<username>.github.io/<repo-name>/`.
2. In the repo's settings, go to Settings → Pages and set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow builds the site and deploys it.

Scheduled workflows are turned off after 60 days without commits. If the puzzle stops updating, re-enable the workflow from the Actions tab.

## Tech

React 18, TypeScript, Vite, Redux Toolkit with redux-persist, Tailwind CSS, Supabase (Postgres and Edge Functions), GitHub Actions and GitHub Pages.

## License

[MIT](https://choosealicense.com/licenses/mit/)
