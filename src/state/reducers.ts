import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardType, StoreState } from "@/state/types";
import { shuffle } from "@/utils/utils";

const initialState: StoreState = {
  date: null,
  cards: [],
  selectedCards: [],
  mistakesRemaining: 4,
  foundCategories: [],
  time: null,
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
      state.cards = action.payload.cards;
      state.selectedCards = [];
      state.mistakesRemaining = 4;
      state.foundCategories = [];
      state.time = null;
    },
    deselectAllCards: (state) => {
      state.selectedCards = [];
    },
    setTimeToState: (state, action: PayloadAction<string>) => {
      state.time = action.payload;
    },
    selectCard: (state, action: PayloadAction<{ content: string }>) => {
      if (state.selectedCards.length >= 4) return;
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
      if (state.mistakesRemaining > 0 && state.selectedCards.length === 4) {
        cardSlice.caseReducers.checkForCategory(state);
      }
    },
    checkForCategory: (state) => {
      const selectedCategories = state.selectedCards.map(
        (card) => card.category
      );
      // Check all the categories are the same
      const isConnection = selectedCategories.every(
        (category) => category === selectedCategories[0]
      );
      if (isConnection) {
        // Removes the cards from the grid with the same category
        const categoryToRemove = selectedCategories[0];
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
      } else {
        state.mistakesRemaining -= 1;
      }
      state.selectedCards = [];
    },
  },
});

export const {
  setGrid,
  selectCard,
  deselectCard,
  shuffleCards,
  makeGuess,
  deselectAllCards,
  setTimeToState,
} = cardSlice.actions;
export default cardSlice.reducer;
