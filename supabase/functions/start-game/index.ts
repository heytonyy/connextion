import { createClient } from "npm:@supabase/supabase-js@2"
import { corsHeaders, fetchAnswers, isPlayableDate, isUuid, json, SUBMIT_WINDOW_MS } from "../_shared/game.ts"

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405)

  let body: { date?: unknown; deviceId?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: "invalid body" }, 400)
  }
  if (!isPlayableDate(body.date)) return json({ error: "invalid date" }, 400)
  if (!isUuid(body.deviceId)) return json({ error: "invalid device" }, 400)
  const { date, deviceId } = body

  const answers = await fetchAnswers(date)
  if (!answers) return json({ error: "puzzle not available" }, 404)

  const { data, error } = await supabase
    .from("games")
    .insert({ puzzle_date: date, answers, device_id: deviceId })
    .select("id")
    .single()
  if (error) {
    console.error(error)
    return json({ error: "could not start game" }, 500)
  }

  // let the client skip the initials form if this device is already on this day's leaderboard
  const { count } = await supabase
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("device_id", deviceId)
    .eq("puzzle_date", date)
    .not("submitted_at", "is", null)

  // housekeeping: drop unsubmitted games that can no longer be submitted
  const cutoff = new Date(Date.now() - SUBMIT_WINDOW_MS).toISOString()
  await supabase.from("games").delete().is("submitted_at", null).lt("started_at", cutoff)

  return json({ gameId: data.id, alreadySubmitted: (count ?? 0) > 0 })
})
