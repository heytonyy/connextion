import { CardType } from "@/state/types";
import { useAppDispatch, useAppSelector, useGameStatus } from "@/state/hooks";
import { selectCard, deselectCard } from "@/state/reducers";

export default function Card({ content }: CardType) {
  const dispatch = useAppDispatch();
  const selectedCards = useAppSelector((state) => state.selectedCards);
  // Derived from the store so the highlight follows the card through shuffles
  const isClicked = selectedCards.some((card) => card.content === content);
  // The board freezes once the game is won or lost
  const isFrozen = useGameStatus() !== "playing";

  const handleClick = () => {
    if (isClicked) {
      dispatch(deselectCard({ content }));
    } else if (selectedCards.length < 4) {
      dispatch(selectCard({ content }));
    }
  };

  return (
    <button
      className={`w-full px-2 py-4 text-xs font-medium text-white shadow-[3px_3px_0px_black] transition-all sm:px-4 md:text-lg ${
        isClicked
          ? "translate-x-[3px] translate-y-[3px] bg-black shadow-none"
          : isFrozen
          ? "cursor-not-allowed bg-indigo-500 opacity-60"
          : "bg-indigo-500 hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-indigo-600 hover:shadow-none"
      }`}
      disabled={isFrozen}
      onClick={handleClick}
    >
      {content}
    </button>
  );
}
