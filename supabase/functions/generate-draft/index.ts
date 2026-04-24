import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { disabledChampions, blueName, redName, firstSelection, apiKey: clientApiKey } = await req.json()

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
    // Drafter API returns { id: "...", url: "https://drafter.lol/draft/..." }
    const draftUrl = data.url || `https://drafter.lol/draft/${data.id}`
    const draftId = data.id

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
