type StoreState = {
  date: string | null;
  // Supabase game id used to submit a completion (null if the leaderboard is off or unreachable)
  gameId: string | null;
  // The board as first dealt, so the game can be reset
  initialCards: CardType[];
  cards: CardType[];
  selectedCards: CardType[];
  foundCategories: CategoryType[];
  mistakesRemaining: number;
  // Every distinct guess in order, each as its four words sorted; replayed by the server
  guesses: string[][];
  // Short feedback after a guess, e.g. "One away..."
  message: string | null;
  // Epoch ms; the timer is derived from these so it survives a reload
  startedAt: number | null;
  finishedAt: number | null;
  submitted: boolean;
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

type LeaderboardEntry = {
  initials: string;
  seconds: number;
  mistakes: number;
  created_at: string;
};

export type { StoreState, CardType, CategoryType, LeaderboardEntry };
