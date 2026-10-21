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

// Puzzle #1; the archive starts here
export const FIRST_PUZZLE_DATE = "2023-06-12";
// How far ahead the calendar goes; NYT publishes up to a few weeks early
export const MAX_DAYS_AHEAD = 30;

// Dates are passed around as YYYY-MM-DD strings in the player's local timezone

// Local Date -> "YYYY-MM-DD"
export const toDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// "YYYY-MM-DD" -> local Date at midnight
export const parseDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (dateString: string, days: number) => {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + days);
  return toDateString(date);
};

// The player's local date `offset` days from today
export const getLocalDate = (offset = 0) =>
  addDays(toDateString(new Date()), offset);

// 83000 -> "01:23"
export const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = String(Math.floor((totalSeconds / 60) % 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${minutes}:${seconds}`
    : `${minutes}:${seconds}`;
};

// "2024-04-01" -> "April 1, 2024"
// With weekday: "Monday, April 1, 2024"
export const formatDate = (dateString: string, withWeekday = false) =>
  parseDate(dateString).toLocaleDateString("en-US", {
    weekday: withWeekday ? "long" : undefined,
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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
