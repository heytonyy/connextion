import { useEffect, useState } from "react";
import { fetchLeaderboard } from "@/lib/leaderboard";
import { LeaderboardEntry } from "@/state/types";
import { formatTime } from "@/utils/utils";

// Fastest completions for one puzzle date
export default function LeaderboardTable({ date }: { date: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard(date)
      .then((data) => !cancelled && setEntries(data))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [date]);

  if (error) return <p>Couldn't load the leaderboard.</p>;
  if (!entries) return <p>Loading...</p>;
  if (entries.length === 0) return <p>No one has solved this one yet.</p>;

  return (
    <table className="w-full text-left text-sm sm:text-base">
      <thead>
        <tr className="border-b-2 border-black">
          <th className="py-1">#</th>
          <th className="py-1">Initials</th>
          <th className="py-1">Time</th>
          <th className="py-1">Mistakes</th>
          <th className="py-1">Solved at</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, i) => (
          <tr key={i} className="border-b border-gray-200">
            <td className="py-1">{i + 1}</td>
            <td className="py-1 font-bold">{entry.initials}</td>
            <td className="py-1 tabular-nums">
              {formatTime(entry.seconds * 1000)}
            </td>
            <td className="py-1">{entry.mistakes}</td>
            <td className="py-1 text-gray-600">
              {new Date(entry.created_at).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
