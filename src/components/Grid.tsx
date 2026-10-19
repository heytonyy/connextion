import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/state/hooks";
import { setGrid } from "@/state/reducers";
import { transformData, setCardsByPosition, fetchPuzzle } from "@/utils/utils";
import { CardType, CategoryType } from "@/state/types";
import { Card, FoundCategory, MenuButtons } from "@/components/index";

export default function Grid() {
  const cards = useAppSelector((state) => state.cards);
  const foundCategories = useAppSelector((state) => state.foundCategories);
  const savedDate = useAppSelector((state) => state.date);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonData = await fetchPuzzle();
        // Keep the saved progress if it's for the same puzzle
        if (jsonData.print_date === savedDate) return;
        const cardData = transformData(jsonData);
        const sortedCards = setCardsByPosition(cardData);
        dispatch(setGrid({ date: jsonData.print_date, cards: sortedCards }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex w-[360px] flex-col gap-2 sm:w-[420px] sm:gap-4 md:w-[600px]">
        <div className="grid w-full gap-3 sm:gap-4">
          {foundCategories.map((found: CategoryType) => (
            <div key={found.category}>
              <FoundCategory
                category={found.category}
                content={found.content}
                color={found.color}
              />
            </div>
          ))}
        </div>
        <div className="grid w-full grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card: CardType) => (
            <div key={card.content}>
              <Card
                position={card.position}
                category={card.category}
                content={card.content}
                color={card.color}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-[360px] flex-col sm:w-[420px] md:w-[600px]">
        <MenuButtons />
      </div>
    </>
  );
}
