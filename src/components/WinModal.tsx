import { useState } from "react";
import { useAppSelector } from "@/state/hooks";
import { leaderboardEnabled } from "@/lib/leaderboard";
import { formatDate, formatTime } from "@/utils/utils";
import LeaderboardTable from "./LeaderboardTable";
import Modal from "./Modal";
import ScoreForm from "./ScoreForm";

export default function WinModal() {
  const date = useAppSelector((state) => state.date);
  const startedAt = useAppSelector((state) => state.startedAt);
  const finishedAt = useAppSelector((state) => state.finishedAt);
  const mistakes = useAppSelector((state) => 4 - state.mistakesRemaining);
  const gameId = useAppSelector((state) => state.gameId);
  const submitted = useAppSelector((state) => state.submitted);
  const [open, setOpen] = useState(true);

  if (!open || !date) return null;

  const renderLeaderboard = () => {
    if (!leaderboardEnabled) return null;
    if (submitted) {
      return (
        <>
          <p className="mb-2 text-sm text-gray-600">
            You're on the leaderboard for this day.
          </p>
          <LeaderboardTable date={date} />
        </>
      );
    }
    if (gameId) return <ScoreForm />;
    return (
      <p className="text-sm text-gray-600">
        This game couldn't be added to the leaderboard.
      </p>
    );
  };

  return (
    <Modal title="You got it!" onClose={() => setOpen(false)}>
      <p className="mb-4">
        You solved the {formatDate(date)} connextion in{" "}
        <span className="font-bold">
          {formatTime((finishedAt ?? 0) - (startedAt ?? 0))}
        </span>{" "}
        with {mistakes} {mistakes === 1 ? "mistake" : "mistakes"}.
      </p>
      {renderLeaderboard()}
    </Modal>
  );
}
