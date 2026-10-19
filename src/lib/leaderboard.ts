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

// the server records when the game started, so the completion time can't be faked
export const startGame = (date: string) =>
  callFunction<{ gameId: string }>("start-game", { date });

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
