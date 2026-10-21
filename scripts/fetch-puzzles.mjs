// Downloads NYT Connections puzzles into public/puzzles/ at build time.
// NYT's endpoint doesn't send CORS headers, so a static site can't fetch it from the browser.
// Instead the GitHub Action runs this on a schedule and bakes the JSON into the deploy.
//
// The whole archive is kept, back to the first puzzle. Files already on disk are reused, so
// only the first run downloads everything; the GitHub Action caches public/puzzles/ between runs.
import { mkdir, readdir, writeFile } from "node:fs/promises";

const OUT_DIR = new URL("../public/puzzles/", import.meta.url);

// Puzzle #1
const FIRST_DATE = "2023-06-12";

// NYT publishes anywhere from one day to a few weeks ahead. Look a month out; dates that
// don't exist yet are skipped.
const DAYS_AHEAD = 30;

// Recent days are always re-downloaded, in case one wasn't published yet or NYT corrected it
const REFRESH_DAYS = 3;

// NYT answers bursts with 404s and 504s, so go easy and retry with backoff
const CONCURRENCY = 4;
const RETRIES = 3;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toDateString = (date) => date.toISOString().slice(0, 10);

const allDates = () => {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() + DAYS_AHEAD);
  const dates = [];
  for (
    const date = new Date(`${FIRST_DATE}T00:00:00Z`);
    date <= end;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    dates.push(toDateString(date));
  }
  return dates;
};

await mkdir(OUT_DIR, { recursive: true });

const onDisk = new Set(
  (await readdir(OUT_DIR))
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .map((file) => file.slice(0, 10))
);

const refreshFrom = new Date();
refreshFrom.setUTCDate(refreshFrom.getUTCDate() - REFRESH_DAYS);
const refreshFromString = toDateString(refreshFrom);

const dates = allDates();
const toFetch = dates.filter(
  (date) => !onDisk.has(date) || date >= refreshFromString
);
console.log(
  `${onDisk.size} puzzles on disk, downloading ${toFetch.length} of ${dates.length}`
);

const available = new Set(onDisk);
let failed = 0;

const today = toDateString(new Date());
let unpublished = 0;

const download = async (date) => {
  const url = `https://www.nytimes.com/svc/connections/v2/${date}.json`;
  let lastError = "";
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    if (attempt > 0) await sleep(1000 * 2 ** (attempt - 1));
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        await writeFile(new URL(`${date}.json`, OUT_DIR), JSON.stringify(data));
        available.add(date);
        return;
      }
      // a future date that 404s just isn't published yet; no point retrying
      if (response.status === 404 && date > today) {
        unpublished++;
        return;
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
  }
  console.warn(`${date}: failed (${lastError})`);
  failed++;
};

// simple worker pool
const queue = [...toFetch];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await download(queue.shift());
  })
);

if (available.size === 0) {
  console.error("No puzzles could be downloaded");
  process.exit(1);
}

const sorted = [...available].sort();
await writeFile(new URL("index.json", OUT_DIR), JSON.stringify({ dates: sorted }));
console.log(
  `${sorted.length} puzzles available (${sorted[0]} to ${sorted.at(-1)}), ` +
    `${unpublished} future dates not published yet` +
    (failed ? `, ${failed} failed` : "")
);
