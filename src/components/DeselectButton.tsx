import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { deselectAllCards } from "@/state/reducers";

export default function Button() {
  const dispatch = useAppDispatch();
  const selectedCards = useAppSelector((state) => state.selectedCards);

  const handleButtonClick = () => {
    dispatch(deselectAllCards());
  };

  return (
    <div className="flex items-center justify-center">
      <button
        disabled={selectedCards.length < 1}
        className={`w-fit bg-indigo-500 px-6 py-2 font-medium text-white shadow-[3px_3px_0px_black] ${
          selectedCards.length < 1
            ? "cursor-not-allowed opacity-50"
            : "transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-indigo-600 hover:shadow-none"
        }`}
        onClick={handleButtonClick}
      >
        Deselect all
      </button>
    </div>
  );
}
