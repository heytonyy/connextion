import { useState } from "react";
import GithubCornerModule from "react-github-corner";
import {
  DatePicker,
  GameOverModal,
  Grid,
  Leaderboard,
  Timer,
  WinModal,
} from "@/components/index";
import usePuzzle from "@/hooks/usePuzzle";
import useServerGame from "@/hooks/useServerGame";
import { leaderboardEnabled } from "@/lib/leaderboard";
import { useAppSelector, useGameStatus } from "@/state/hooks";
import { getLocalDate } from "@/utils/utils";

// react-github-corner is CommonJS; Vite's production bundle hands back the module object
const GithubCorner =
  (GithubCornerModule as unknown as { default?: typeof GithubCornerModule })
    .default ?? GithubCornerModule;

const messages = {
  loading: "Loading...",
  unavailable:
    "This connextion isn't available yet. Please come back on a future day!",
  error: "Something went wrong loading this connextion. Please try again later.",
};

export default function App() {
  // Default to tomorrow in the player's timezone
  const [date, setDate] = useState(() => getLocalDate(1));
  const status = usePuzzle(date);
  const gameStatus = useGameStatus();
  const startedAt = useAppSelector((state) => state.startedAt);
  useServerGame();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <div className="my-4 flex flex-wrap items-center justify-center gap-x-4 text-2xl font-extrabold text-blue-500 sm:text-4xl">
        ConNEXTions
        <DatePicker date={date} onChange={setDate} />
      </div>
      {status === "ready" ? (
        <>
          <div>
            <p className="my-2 text-center sm:text-lg">
              Create four groups of four!
            </p>
          </div>
          <Grid />
          <div className="flex items-center justify-center gap-4">
            {leaderboardEnabled && <Leaderboard date={date} />}
            <Timer />
          </div>
          {gameStatus === "lost" && <GameOverModal />}
          {/* keyed by round so a closed win screen reappears after the next win */}
          {gameStatus === "won" && <WinModal key={startedAt} />}
        </>
      ) : (
        <p className="w-[360px] py-16 text-center text-lg sm:w-[420px] md:w-[600px]">
          {messages[status]}
        </p>
      )}
      <GithubCorner href="https://github.com/heytonyy/connextion" />
    </div>
  );
}
