// Downloads NYT Connections puzzles into public/puzzles/ at build time.
// NYT's endpoint doesn't send CORS headers, so a static site can't fetch it from the browser.
// Instead the GitHub Action runs this on a schedule and bakes the JSON into the deploy.
import { mkdir, writeFile } from "node:fs/promises";

const OUT_DIR = new URL("../public/puzzles/", import.meta.url);

// "Tomorrow" depends on the player's timezone (UTC-12 to UTC+14), so grab a window around
// today in UTC. NYT only publishes one day ahead; dates that don't exist yet are skipped.
const OFFSETS = [-1, 0, 1, 2];

const toDateString = (date) => date.toISOString().slice(0, 10);

await mkdir(OUT_DIR, { recursive: true });

const available = [];
for (const offset of OFFSETS) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  const dateString = toDateString(date);
  const url = `https://www.nytimes.com/svc/connections/v2/${dateString}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`${dateString}: not published yet (${response.status})`);
      continue;
    }
    const data = await response.json();
    await writeFile(new URL(`${dateString}.json`, OUT_DIR), JSON.stringify(data));
    available.push(dateString);
    console.log(`${dateString}: saved`);
  } catch (error) {
    console.error(`${dateString}: failed`, error);
  }
}

if (available.length === 0) {
  console.error("No puzzles could be downloaded");
  process.exit(1);
}

await writeFile(new URL("index.json", OUT_DIR), JSON.stringify({ dates: available }));
