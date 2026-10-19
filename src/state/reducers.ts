import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardType, StoreState } from "@/state/types";
import { shuffle } from "@/utils/utils";

export const MAX_MISTAKES = 4;

const initialState: StoreState = {
  date: null,
  gameId: null,
  initialCards: [],
  cards: [],
  selectedCards: [],
  mistakesRemaining: MAX_MISTAKES,
  foundCategories: [],
  guesses: [],
  message: null,
  startedAt: null,
  finishedAt: null,
  submitted: false,
};

// Fresh round on the current board
const startRound = (state: StoreState) => {
  state.cards = state.initialCards;
  state.selectedCards = [];
  state.mistakesRemaining = MAX_MISTAKES;
  state.foundCategories = [];
  state.guesses = [];
  state.message = null;
  state.startedAt = Date.now();
  state.finishedAt = null;
  state.gameId = null;
  state.submitted = false;
};

export const cardSlice = createSlice({
  name: "cards-slice",
  initialState,
  reducers: {
    setGrid: (
      state,
      action: PayloadAction<{ date: string; cards: CardType[] }>
    ) => {
      state.date = action.payload.date;
      state.initialCards = action.payload.cards;
      startRound(state);
    },
    resetGame: (state) => {
      startRound(state);
    },
    // startedAt identifies the round, so a slow response can't attach to a newer one
    setGameId: (
      state,
      action: PayloadAction<{ startedAt: number; gameId: string }>
    ) => {
      if (state.startedAt === action.payload.startedAt && !state.gameId) {
        state.gameId = action.payload.gameId;
      }
    },
    markSubmitted: (state) => {
      state.submitted = true;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    deselectAllCards: (state) => {
      state.selectedCards = [];
    },
    selectCard: (state, action: PayloadAction<{ content: string }>) => {
      if (state.finishedAt || state.selectedCards.length >= 4) return;
      // Card content is unique within a puzzle, so it identifies a card across shuffles
      const fullCard = state.cards.find(
        (card) => card.content === action.payload.content
      );
      if (fullCard) {
        state.selectedCards.push(fullCard);
      } else {
        console.error("Card not found in grid");
      }
    },
    deselectCard: (state, action: PayloadAction<{ content: string }>) => {
      state.selectedCards = state.selectedCards.filter(
        (card) => card.content !== action.payload.content
      );
    },
    shuffleCards: (state) => {
      state.cards = shuffle(state.cards).map((card, index) => ({
        ...card,
        position: index,
      }));
    },
    makeGuess: (state) => {
      if (state.finishedAt || state.selectedCards.length !== 4) return;

      // Repeating a wrong guess doesn't cost a mistake, same as NYT
      const guess = state.selectedCards.map((card) => card.content).sort();
      const key = guess.join("|");
      if (state.guesses.some((g) => g.join("|") === key)) {
        state.message = "Already guessed!";
        return;
      }
      state.guesses.push(guess);

      // Count how many selected cards share each category
      const counts = new Map<string, number>();
      state.selectedCards.forEach((card) =>
        counts.set(card.category, (counts.get(card.category) ?? 0) + 1)
      );
      const largestGroup = Math.max(...counts.values());

      if (largestGroup === 4) {
        // Removes the cards from the grid with the same category
        const categoryToRemove = state.selectedCards[0].category;
        state.cards = state.cards.filter(
          (card) => card.category !== categoryToRemove
        );
        // Construct content string from each of the found categories in the form of
        // "Content1, Content2, Content3, Content4"
        const content = state.selectedCards
          .map((card) => card.content)
          .join(", ");
        state.foundCategories.push({
          category: categoryToRemove,
          content: content,
          color: state.selectedCards[0].color,
        });
        if (state.foundCategories.length === 4) {
          state.finishedAt = Date.now();
        }
        state.message = null;
      } else {
        state.mistakesRemaining -= 1;
        if (state.mistakesRemaining === 0) {
          state.finishedAt = Date.now();
          state.message = null;
        } else {
          state.message = largestGroup === 3 ? "One away..." : null;
        }
      }
      state.selectedCards = [];
    },
  },
});

export const {
  setGrid,
  resetGame,
  setGameId,
  markSubmitted,
  clearMessage,
  selectCard,
  deselectCard,
  shuffleCards,
  makeGuess,
  deselectAllCards,
} = cardSlice.actions;
export default cardSlice.reducer;
