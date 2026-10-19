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

// Tomorrow in the player's local timezone, as YYYY-MM-DD
export const getClientDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1); // Add 1 day to the current date
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

// Puzzles are baked into the site at build time (scripts/fetch-puzzles.mjs).
// Prefer the player's local tomorrow; if that isn't published yet, use the newest one available.
export const fetchPuzzle = async (): Promise<PuzzleData> => {
  const response = await fetch(puzzleUrl(`${getClientDate()}.json`));
  if (response.ok) return response.json();

  const index: { dates: string[] } = await (
    await fetch(puzzleUrl("index.json"))
  ).json();
  const latest = [...index.dates].sort().at(-1);
  if (!latest) throw new Error("No puzzles available");
  return (await fetch(puzzleUrl(`${latest}.json`))).json();
};
