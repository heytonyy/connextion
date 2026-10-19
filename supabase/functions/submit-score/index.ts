import { createClient } from "npm:@supabase/supabase-js@2"
import { Answer, corsHeaders, json, replay, SUBMIT_WINDOW_MS } from "../_shared/game.ts"

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405)

  let body: { gameId?: unknown; initials?: unknown; guesses?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: "invalid body" }, 400)
  }

  const { gameId, guesses } = body
  const initials = typeof body.initials === "string" ? body.initials.trim().toUpperCase() : ""
  if (typeof gameId !== "string" || !/^[0-9a-f-]{36}$/i.test(gameId)) return json({ error: "invalid game" }, 400)
  if (!/^[A-Z]{2,3}$/.test(initials)) return json({ error: "initials must be 2-3 letters" }, 400)

  const { data: game } = await supabase
    .from("games")
    .select("puzzle_date, answers, started_at, submitted_at")
    .eq("id", gameId)
    .maybeSingle()
  if (!game || game.submitted_at) return json({ error: "game not found or already submitted" }, 400)

  // the time is measured on the server, from start-game until now
  const elapsed = Date.now() - new Date(game.started_at).getTime()
  if (elapsed > SUBMIT_WINDOW_MS) return json({ error: "game expired" }, 400)

  const result = replay(game.answers as Answer[], guesses)
  if ("error" in result) return json({ error: result.error }, 400)

  // claim the game atomically so the same game can't be submitted twice
  const { data: claimed } = await supabase
    .from("games")
    .update({ submitted_at: new Date().toISOString() })
    .eq("id", gameId)
    .is("submitted_at", null)
    .select("id")
  if (!claimed?.length) return json({ error: "game already submitted" }, 400)

  const seconds = Math.floor(elapsed / 1000)
  const { error } = await supabase.from("completions").insert({
    game_id: gameId,
    puzzle_date: game.puzzle_date,
    initials,
    seconds,
    mistakes: result.mistakes,
  })
  if (error) {
    console.error(error)
    return json({ error: "could not save score" }, 500)
  }

  return json({ seconds, mistakes: result.mistakes })
})
