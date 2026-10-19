import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { setGrid } from "@/state/reducers";
import {
  fetchAvailableDates,
  fetchPuzzle,
  setCardsByPosition,
  transformData,
} from "@/utils/utils";

export type PuzzleStatus = "loading" | "ready" | "unavailable" | "error";

// Loads the puzzle for `date` into the store and reports whether it exists yet
export default function usePuzzle(date: string): PuzzleStatus {
  const [status, setStatus] = useState<PuzzleStatus>("loading");
  const savedDate = useAppSelector((state) => state.date);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Ignore responses for a date the player has already switched away from
    let cancelled = false;

    const load = async () => {
      setStatus("loading");
      try {
        const dates = await fetchAvailableDates();
        if (cancelled) return;
        if (!dates.includes(date)) {
          setStatus("unavailable");
          return;
        }
        // Keep the saved progress if it's for the same puzzle
        if (date !== savedDate) {
          const jsonData = await fetchPuzzle(date);
          if (cancelled) return;
          const sortedCards = setCardsByPosition(transformData(jsonData));
          dispatch(setGrid({ date, cards: sortedCards }));
        }
        setStatus("ready");
      } catch (error) {
        console.error("Error fetching data:", error);
        if (!cancelled) setStatus("error");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // savedDate is only read when the date changes, not tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return status;
}
