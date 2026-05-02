import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function extractPicks(draftData: Record<string, any>): string[] {
  const picks: string[] = []

  for (let i = 1; i <= 5; i++) {
    const bluePick = draftData[`bluePick${i}`]
    const redPick = draftData[`redPick${i}`]

    if (bluePick) picks.push(bluePick)
    if (redPick) picks.push(redPick)
  }

  return [...new Set(picks)]
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { draftId, apiKey: clientApiKey } = await req.json()

    console.log("➡️ Draft ID:", draftId)

    if (!draftId) {
      throw new Error("Missing draftId")
    }

    const drafterApiKey = clientApiKey || Deno.env.get("DRAFTER_API_KEY")

    if (!drafterApiKey) {
      throw new Error("Missing Drafter API key")
    }

    const drafterResponse = await fetch(
      `https://api.drafter.lol/api/drafts/${draftId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${drafterApiKey}`,
        },
      },
    )

    console.log("📡 Drafter status:", drafterResponse.status)

    if (!drafterResponse.ok) {
      const errorText = await drafterResponse.text()
      console.error("❌ Drafter error:", errorText)
      throw new Error(`Drafter API error`)
    }

    const data = await drafterResponse.json()

    console.log("📦 Raw drafter data keys:", Object.keys(data))

    const draftData = data.draftData || {}

    const picks = extractPicks(draftData)

    console.log("🎯 Picks extracted:", picks)

    if (picks.length === 0) {
      console.warn("⚠️ Aucun pick trouvé → problème probable mapping API")
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    const { data: existing, error: selectError } = await supabase
      .from("champions")
      .select("name")
      .in("name", picks)

    if (selectError) {
      console.error("❌ Supabase select error:", selectError)
    } else {
      console.log("🔎 Champions trouvés en BDD:", existing)
    }

    const { error: updateError } = await supabase
      .from("champions")
      .update({ disabled: true })
      .in("name", picks)

    if (updateError) {
      console.error("❌ Supabase update error:", updateError)
      throw new Error("Update failed")
    }

    console.log("✅ Champions désactivés:", picks.length)

    return new Response(
      JSON.stringify({
        success: true,
        picks,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("🔥 GLOBAL ERROR:", error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    )
  }
})