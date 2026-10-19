import { CardType } from "@/state/types";

interface Category {
  title: string;
  cards: CardData[];
}

interface CardData {
  position: number;
  content: string;
}

export interface PuzzleData {
  print_date: string;
  categories: Category[];
}

export const transformData = (data: PuzzleData): CardType[] => {
  const result: CardType[] = [];

  // NYT lists categories easiest to hardest: yellow, green, blue, purple
  const colors = ["#fbdb6b", "#a3c35b", "#b4c4f3", "#bb84c4"];

  data.categories.forEach((category, colorIndex) => {
    category.cards.forEach((card) => {
      result.push({
        category: category.title,
        content: card.content,
        position: card.position,
        color: colors[colorIndex],
      });
    });
  });

  return result;
};

export const setCardsByPosition = (cards: CardType[]): CardType[] => {
  return cards.sort((a, b) => a.position - b.position);
};

// Fisher-Yates; `sort(() => Math.random() - 0.5)` gives a biased shuffle
export const shuffle = <T>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// The player's local date `offset` days from today, as YYYY-MM-DD
export const getLocalDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// "2024-04-01" -> "April 1, 2024"
export const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const puzzleUrl = (file: string) =>
  `${import.meta.env.BASE_URL}puzzles/${file}`;

// Puzzles are baked into the site at build time (scripts/fetch-puzzles.mjs), and
// index.json lists which dates made it in. Checking the list instead of relying on a 404
// also works in `vite dev`, which answers missing files with index.html.
let availableDates: Promise<string[]> | null = null;
export const fetchAvailableDates = () => {
  availableDates ??= fetch(puzzleUrl("index.json"))
    .then((response) => response.json())
    .then((index: { dates: string[] }) => index.dates)
    .catch((error) => {
      availableDates = null; // allow a retry on the next call
      throw error;
    });
  return availableDates;
};

export const fetchPuzzle = async (date: string): Promise<PuzzleData> => {
  const response = await fetch(puzzleUrl(`${date}.json`));
  if (!response.ok) throw new Error(`Puzzle ${date} failed to load`);
  return response.json();
};
