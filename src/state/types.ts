type StoreState = {
  date: string | null;
  cards: CardType[];
  selectedCards: CardType[];
  foundCategories: CategoryType[];
  mistakesRemaining: number;
  time: string | null;
};

type CardType = {
  position: number;
  category: string;
  content: string;
  color: string;
};

type CategoryType = {
  category: string;
  content: string;
  color: string;
};

type LeaderBoardTime = {
  name: string;
  time: number;
  date: string;
};

export type { StoreState, CardType, CategoryType, LeaderBoardTime };
