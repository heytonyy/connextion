import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { resetGame } from "@/state/reducers";
import Modal from "./Modal";

// Shown when the player runs out of mistakes. The board stays frozen until they reset.
export default function GameOverModal() {
  const foundCount = useAppSelector((state) => state.foundCategories.length);
  const dispatch = useAppDispatch();

  return (
    <Modal title="Game over">
      <p className="mb-6">
        You ran out of mistakes after finding {foundCount} of 4 groups.
      </p>
      <button
        autoFocus
        className="w-fit bg-indigo-500 px-6 py-2 font-medium text-white shadow-[3px_3px_0px_black] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-indigo-600 hover:shadow-none"
        onClick={() => dispatch(resetGame())}
      >
        Reset game
      </button>
    </Modal>
  );
}
