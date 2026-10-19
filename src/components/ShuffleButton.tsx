import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { shuffleCards } from "@/state/reducers";

export default function Button() {
  const cards = useAppSelector((state) => state.cards);
  const dispatch = useAppDispatch();

  const handleButtonClick = () => {
    dispatch(shuffleCards());
  };

  return (
    <div className="flex items-center justify-center">
      <button
        className={`w-fit bg-indigo-500 px-6 py-2 font-medium text-white shadow-[3px_3px_0px_black] ${
          cards.length == 0
            ? "cursor-not-allowed opacity-50"
            : "transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-indigo-600 hover:shadow-none"
        }`}
        onClick={handleButtonClick}
      >
        Shuffle
      </button>
    </div>
  );
}
