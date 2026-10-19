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
- Progress is saved in localStorage per puzzle date.

## Development

```sh
npm install
npm run dev      # fetches puzzles, then starts Vite on http://localhost:3000
npm run build    # fetches puzzles, type-checks, builds to dist/
npm run preview  # serves dist/
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
