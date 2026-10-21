// Fetches one day's puzzle from NYT for the browser. NYT doesn't send CORS headers, so the site
// can't request it directly; the client uses this only when the site has no copy of that date.
import { corsHeaders, isPlayableDate, json } from "../_shared/game.ts"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "GET") return json({ error: "method not allowed" }, 405)

  const date = new URL(req.url).searchParams.get("date")
  if (!isPlayableDate(date)) return json({ error: "invalid date" }, 400)

  const res = await fetch(`https://www.nytimes.com/svc/connections/v2/${date}.json`)
  if (res.status === 404) return json({ error: "puzzle not available" }, 404)
  if (!res.ok) return json({ error: "could not reach NYT" }, 502)

  const data = await res.json()
  if (!Array.isArray(data?.categories)) return json({ error: "puzzle not available" }, 404)

  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      // a published puzzle doesn't change; let the browser keep it for a day
      "Cache-Control": "public, max-age=86400",
    },
  })
})
