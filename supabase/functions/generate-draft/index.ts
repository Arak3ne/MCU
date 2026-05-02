import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { matchId, blueName, redName, firstSelection, apiKey: clientApiKey } = await req.json()

    if (!matchId) {
      throw new Error("matchId is required");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Check if draft already exists for this match
    const { data: existingMatch, error: matchError } = await supabase
      .from('playoff_matches')
      .select('draft_url, draft_id')
      .eq('id', matchId)
      .single()

    if (matchError) {
      throw new Error(`Failed to fetch match: ${matchError.message}`)
    }

    if (existingMatch?.draft_url) {
      return new Response(
        JSON.stringify({ draftUrl: existingMatch.draft_url, draftId: existingMatch.draft_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 2. Fetch disabled champions
    const { data: champions, error: fetchError } = await supabase
      .from("champions")
      .select("name, ddragon_key")
      .eq("is_available", false);

    if (fetchError) {
      throw new Error(`Failed to fetch disabled champions: ${fetchError.message}`)
    }

    // Drafter API expects Data Dragon champion IDs (e.g., "MonkeyKing", "XinZhao", "MissFortune")
    // If we have ddragon_key, we could use it, but Drafter usually expects the string ID.
    // The safest bet is to format the name by removing spaces and special characters, capitalizing properly,
    // or relying on how Drafter matches them. Usually, Drafter matches by the exact string ID from Data Dragon.
    const disabledChampions = (champions || []).map((c) => {
      // Special cases for Drafter/Data Dragon
      const name = c.name;
      if (name === "Wukong") return "MonkeyKing";
      if (name === "Renata Glasc") return "Renata";
      if (name === "Nunu & Willump") return "Nunu";
      if (name === "Kog'Maw") return "KogMaw";
      if (name === "Rek'Sai") return "RekSai";
      if (name === "K'Sante") return "KSante";
      if (name === "Bel'Veth") return "Belveth";
      if (name === "Kai'Sa") return "Kaisa";
      if (name === "Kha'Zix") return "Khazix";
      if (name === "Cho'Gath") return "Chogath";
      if (name === "Vel'Koz") return "Velkoz";
      if (name === "LeBlanc") return "Leblanc";
      
      // Default: remove spaces and special chars
      return name.replace(/[^a-zA-Z0-9]/g, '');
    });

    console.log("Sending disabled champions to Drafter:", disabledChampions);

    // 3. Create draft on Drafter
    const apiKey = clientApiKey || Deno.env.get('DRAFTER_API_KEY') || '';
    const drafterResponse = await fetch('https://api.drafter.lol/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        blueName: blueName || "Team 1",
        redName: redName || "Team 2",
        firstSelection: firstSelection ?? true,
        disabledChampions
      })
    })

    if (!drafterResponse.ok) {
      const errText = await drafterResponse.text()
      throw new Error(`Drafter API error: ${drafterResponse.status} ${errText}`)
    }

    const data = await drafterResponse.json()
    const draftUrl = data.url || `https://drafter.lol/draft/${data.id}`
    const draftId = data.id

    // 4. Save to database using optimistic concurrency control
    const { data: updatedMatch, error: updateError } = await supabase
      .from('playoff_matches')
      .update({ draft_url: draftUrl, draft_id: draftId })
      .eq('id', matchId)
      .is('draft_url', null)
      .select()
      .single()

    // If updateError is "PGRST116" (Results contain 0 rows), it means another request beat us to it.
    if (updateError && updateError.code === 'PGRST116') {
      const { data: finalMatch } = await supabase
        .from('playoff_matches')
        .select('draft_url, draft_id')
        .eq('id', matchId)
        .single()
        
      if (finalMatch?.draft_url) {
        return new Response(
          JSON.stringify({ draftUrl: finalMatch.draft_url, draftId: finalMatch.draft_id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
    } else if (updateError) {
      throw new Error(`Failed to update match: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ draftUrl, draftId }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
