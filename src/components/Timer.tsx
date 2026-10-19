import { useEffect, useState } from "react";
import { useAppSelector } from "@/state/hooks";
import { formatTime } from "@/utils/utils";

export default function Timer() {
  const startedAt = useAppSelector((state) => state.startedAt);
  const finishedAt = useAppSelector((state) => state.finishedAt);
  const [now, setNow] = useState(Date.now());

  // Tick until the game is over; the elapsed time comes from the store so it survives a reload
  useEffect(() => {
    if (finishedAt) return;
    const intervalId = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(intervalId);
  }, [finishedAt]);

  const elapsed = startedAt ? (finishedAt ?? now) - startedAt : 0;

  return (
    <div className="flex w-20 items-center justify-center text-base text-gray-700">
      {formatTime(elapsed)}
    </div>
  );
}
