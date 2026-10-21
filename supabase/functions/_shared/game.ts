// Server-side copy of the game rules, used to verify a submitted completion.
// Mirrors makeGuess in src/state/reducers.ts.

export const MAX_MISTAKES = 4
// how long after starting a round a completion can still be submitted
export const SUBMIT_WINDOW_MS = 48 * 60 * 60 * 1000
// 4 correct guesses + 3 mistakes; a 4th mistake ends the game
export const MAX_GUESSES = 7

export type Answer = { title: string; words: string[] }

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

// Puzzle #1; matches FIRST_PUZZLE_DATE in src/utils/utils.ts
export const FIRST_PUZZLE_DATE = "2023-06-12"

// YYYY-MM-DD from the first puzzle through a month ahead (the calendar's range plus a day of
// timezone slack). Whether the puzzle actually exists is checked against NYT afterwards.
export const isPlayableDate = (date: unknown): date is string => {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const time = Date.parse(`${date}T00:00:00Z`)
  if (Number.isNaN(time) || date < FIRST_PUZZLE_DATE) return false
  const days = (time - Date.now()) / (24 * 60 * 60 * 1000)
  return days < 32
}

export const fetchAnswers = async (date: string): Promise<Answer[] | null> => {
  const res = await fetch(`https://www.nytimes.com/svc/connections/v2/${date}.json`)
  if (!res.ok) return null
  const data = await res.json()
  return data.categories.map((c: { title: string; cards: { content: string }[] }) => ({
    title: c.title,
    words: c.cards.map((card) => card.content),
  }))
}

// Replays the guesses and returns the mistakes made, or an error if they don't solve the puzzle
export const replay = (answers: Answer[], guesses: unknown): { mistakes: number } | { error: string } => {
  if (!Array.isArray(guesses) || guesses.length > MAX_GUESSES) return { error: "invalid guesses" }

  const categoryOf = new Map<string, string>()
  answers.forEach((a) => a.words.forEach((w) => categoryOf.set(w, a.title)))

  const seen = new Set<string>()
  const found = new Set<string>()
  let mistakes = 0

  for (const guess of guesses) {
    if (found.size === answers.length) return { error: "guesses after the puzzle was solved" }
    if (!Array.isArray(guess) || guess.length !== 4) return { error: "invalid guess" }
    if (!guess.every((w) => typeof w === "string" && categoryOf.has(w))) return { error: "invalid guess" }
    if (new Set(guess).size !== 4) return { error: "invalid guess" }

    const key = [...guess].sort().join("|")
    if (seen.has(key)) return { error: "repeated guess" }
    seen.add(key)

    const categories = new Set(guess.map((w) => categoryOf.get(w)))
    const [category] = categories
    if (categories.size === 1 && !found.has(category!)) {
      found.add(category!)
    } else {
      mistakes += 1
      if (mistakes >= MAX_MISTAKES) return { error: "too many mistakes" }
    }
  }

  if (found.size !== answers.length) return { error: "puzzle not solved" }
  return { mistakes }
}
