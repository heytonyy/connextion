import { LeaderboardEntry } from "@/state/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// without Supabase config the game still works, just without a leaderboard
export const leaderboardEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const LEADERBOARD_SIZE = 10;

const headers = () => ({
  apikey: SUPABASE_KEY as string,
  "Content-Type": "application/json",
});

const callFunction = async <T>(name: string, body: unknown): Promise<T> => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${name} failed`);
  return data as T;
};

// Random id for this browser, kept in localStorage. The server allows one leaderboard entry
// per device per day. It's not tamper-proof (incognito or clearing site data gets a new one),
// but it stops casual repeat entries without blocking players who share a network.
const DEVICE_ID_KEY = "connextion-device-id";
let fallbackDeviceId: string | null = null;
const getDeviceId = () => {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    // storage blocked: use an id for this page load only
    fallbackDeviceId ??= crypto.randomUUID();
    return fallbackDeviceId;
  }
};

// the server records when the game started, so the completion time can't be faked.
// alreadySubmitted is true if this device is already on that day's leaderboard.
export const startGame = (date: string) =>
  callFunction<{ gameId: string; alreadySubmitted: boolean }>("start-game", {
    date,
    deviceId: getDeviceId(),
  });

// the server replays the guesses against that day's answers before saving
export const submitCompletion = (
  gameId: string,
  initials: string,
  guesses: string[][]
) =>
  callFunction<{ seconds: number; mistakes: number }>("submit-score", {
    gameId,
    initials,
    guesses,
  });

// One day's puzzle straight from NYT, via the `puzzle` edge function (NYT blocks direct
// browser requests). Returns null if NYT hasn't published it, or if Supabase isn't configured.
export const fetchPuzzleFromNyt = async (date: string): Promise<unknown> => {
  if (!leaderboardEnabled) return null;
  const res = await fetch(`${SUPABASE_URL}/functions/v1/puzzle?date=${date}`, {
    headers: { apikey: SUPABASE_KEY as string },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`puzzle ${date} failed to load`);
  return res.json();
};

// fastest completions for one puzzle date
export const fetchLeaderboard = async (
  date: string
): Promise<LeaderboardEntry[]> => {
  const query = `select=initials,seconds,mistakes,created_at&puzzle_date=eq.${date}&order=seconds.asc,created_at.asc&limit=${LEADERBOARD_SIZE}`;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/completions?${query}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("could not load leaderboard");
  return res.json();
};
