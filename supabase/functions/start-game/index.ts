import { createClient } from "npm:@supabase/supabase-js@2"
import { corsHeaders, fetchAnswers, isPlayableDate, json, SUBMIT_WINDOW_MS } from "../_shared/game.ts"

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405)

  let body: { date?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: "invalid body" }, 400)
  }
  if (!isPlayableDate(body.date)) return json({ error: "invalid date" }, 400)

  const answers = await fetchAnswers(body.date)
  if (!answers) return json({ error: "puzzle not available" }, 404)

  const { data, error } = await supabase
    .from("games")
    .insert({ puzzle_date: body.date, answers })
    .select("id")
    .single()
  if (error) {
    console.error(error)
    return json({ error: "could not start game" }, 500)
  }

  // housekeeping: drop unsubmitted games that can no longer be submitted
  const cutoff = new Date(Date.now() - SUBMIT_WINDOW_MS).toISOString()
  await supabase.from("games").delete().is("submitted_at", null).lt("started_at", cutoff)

  return json({ gameId: data.id })
})
