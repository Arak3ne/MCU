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
    const { draftId, apiKey: clientApiKey } = await req.json()

    if (!draftId) {
      throw new Error("Missing draftId");
    }

    const apiKey = clientApiKey || Deno.env.get('DRAFTER_API_KEY') || '';
    const drafterResponse = await fetch(`https://api.drafter.lol/api/drafts/${draftId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!drafterResponse.ok) {
      const errText = await drafterResponse.text()
      throw new Error(`Drafter API error: ${drafterResponse.status} ${errText}`)
    }

    const data = await drafterResponse.json()
    const draftData = data.draftData || {};

    const picks = [];
    for (let i = 1; i <= 5; i++) {
      if (draftData[`bluePick${i}`]) picks.push(draftData[`bluePick${i}`]);
      if (draftData[`redPick${i}`]) picks.push(draftData[`redPick${i}`]);
    }

    return new Response(
      JSON.stringify({ picks }),
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
