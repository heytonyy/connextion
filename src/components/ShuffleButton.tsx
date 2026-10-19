import { useAppDispatch, useAppSelector, useGameStatus } from "@/state/hooks";
import { shuffleCards } from "@/state/reducers";

export default function Button() {
  const dispatch = useAppDispatch();
  const cards = useAppSelector((state) => state.cards);
  const isPlaying = useGameStatus() === "playing";
  const enabled = isPlaying && cards.length > 0;

  return (
    <div className="flex items-center justify-center">
      <button
        disabled={!enabled}
        className={`w-fit bg-indigo-500 px-6 py-2 font-medium text-white shadow-[3px_3px_0px_black] ${
          enabled
            ? "transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-indigo-600 hover:shadow-none"
            : "cursor-not-allowed opacity-50"
        }`}
        onClick={() => dispatch(shuffleCards())}
      >
        Shuffle
      </button>
    </div>
  );
}
