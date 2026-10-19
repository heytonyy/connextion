import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { setGameId } from "@/state/reducers";
import { leaderboardEnabled, startGame } from "@/lib/leaderboard";

// Registers each new round with Supabase so a completion can be submitted later.
// Runs again after a reset because the round's startedAt changes.
export default function useServerGame() {
  const date = useAppSelector((state) => state.date);
  const startedAt = useAppSelector((state) => state.startedAt);
  const gameId = useAppSelector((state) => state.gameId);
  const finishedAt = useAppSelector((state) => state.finishedAt);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!leaderboardEnabled || !date || !startedAt || gameId || finishedAt) {
      return;
    }
    let cancelled = false;
    startGame(date)
      .then(({ gameId }) => {
        if (!cancelled) dispatch(setGameId({ startedAt, gameId }));
      })
      // the game still plays without a server game; it just can't be submitted
      .catch((error) => console.error("Could not start leaderboard game:", error));
    return () => {
      cancelled = true;
    };
    // finishedAt only matters for whether to start, not as a trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, startedAt, gameId, dispatch]);
}
