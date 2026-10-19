import { useAppSelector } from "@/state/hooks";
import { CardType, CategoryType } from "@/state/types";
import { Card, FoundCategory, MenuButtons } from "@/components/index";

export default function Grid() {
  const cards = useAppSelector((state) => state.cards);
  const foundCategories = useAppSelector((state) => state.foundCategories);

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
