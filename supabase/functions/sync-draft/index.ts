import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Si on a une erreur 403 avec le message "Draft data is not included...", 
    // ça veut dire que la draft est terminée (l'API gratuite ne permet pas de voir les drafts terminées)
    if (!drafterResponse.ok) {
      const errText = await drafterResponse.text()
      
      if (drafterResponse.status === 403 && errText.includes("Draft data is not included")) {
        // La draft est terminée ! On récupère les derniers picks sauvegardés en base
        const { data: matchData } = await supabase
          .from('playoff_matches')
          .select('draft_picks')
          .eq('draft_id', draftId)
          .single();
          
        const finalPicks = matchData?.draft_picks || [];
        
        if (finalPicks.length > 0) {
          const { data: champions, error: fetchError } = await supabase
            .from("champions")
            .select("id, name, ddragon_key, image_url")
            .eq("is_available", true);

          if (!fetchError && champions) {
            const championsToDisable = champions.filter((c) => {
              let key = "";
              if (c.image_url) {
                const parts = c.image_url.split('/');
                key = parts[parts.length - 1].replace('.png', '');
              } else {
                key = c.name.replace(/[^a-zA-Z0-9]/g, '');
              }
              
              if (c.name === "Wukong") key = "MonkeyKing";
              if (c.name === "Renata Glasc") key = "Renata";
              if (c.name === "Nunu & Willump") key = "Nunu";
              if (c.name === "Kog'Maw") key = "KogMaw";
              if (c.name === "Rek'Sai") key = "RekSai";
              if (c.name === "K'Sante") key = "KSante";
              if (c.name === "Bel'Veth") key = "Belveth";
              if (c.name === "Kai'Sa") key = "Kaisa";
              if (c.name === "Kha'Zix") key = "Khazix";
              if (c.name === "Cho'Gath") key = "Chogath";
              if (c.name === "Vel'Koz") key = "Velkoz";
              if (c.name === "LeBlanc") key = "Leblanc";
              
              return finalPicks.includes(key) || finalPicks.includes(c.name);
            });

            if (championsToDisable.length > 0) {
              const idsToDisable = championsToDisable.map(c => c.id);
              await supabase
                .from("champions")
                .update({ is_available: false })
                .in("id", idsToDisable);
            }
          }
        }
        
        return new Response(
          JSON.stringify({ picks: finalPicks, status: "FINISHED" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
      
      throw new Error(`Drafter API error: ${drafterResponse.status} ${errText}`)
    }

    const data = await drafterResponse.json()
    const draftData = data.draftData || {};
    const status = data.status || draftData.status || "UNKNOWN";

    console.log("📦 Raw drafter data keys:", Object.keys(data))

    const draftData = data.draftData || {}

    const picks = extractPicks(draftData)

    console.log("🎯 Picks extracted:", picks)

    if (picks.length === 0) {
      console.warn("⚠️ Aucun pick trouvé → problème probable mapping API")
    }
    
    // Sauvegarder les picks actuels en base de données tant que la draft est en cours
    if (picks.length > 0) {
      await supabase
        .from('playoff_matches')
        .update({ draft_picks: picks })
        .eq('draft_id', draftId);
    }

    // If the draft is finished (au cas où on aurait l'info avant le 403), update the database directly
    if (status === "FINISHED" && picks.length > 0) {
      const { data: champions, error: fetchError } = await supabase
        .from("champions")
        .select("id, name, ddragon_key, image_url")
        .eq("is_available", true);

      if (!fetchError && champions) {
        const championsToDisable = champions.filter((c) => {
          let key = "";
          if (c.image_url) {
            const parts = c.image_url.split('/');
            key = parts[parts.length - 1].replace('.png', '');
          } else {
            key = c.name.replace(/[^a-zA-Z0-9]/g, '');
          }
          
          // Handle special cases
          if (c.name === "Wukong") key = "MonkeyKing";
          if (c.name === "Renata Glasc") key = "Renata";
          if (c.name === "Nunu & Willump") key = "Nunu";
          if (c.name === "Kog'Maw") key = "KogMaw";
          if (c.name === "Rek'Sai") key = "RekSai";
          if (c.name === "K'Sante") key = "KSante";
          if (c.name === "Bel'Veth") key = "Belveth";
          if (c.name === "Kai'Sa") key = "Kaisa";
          if (c.name === "Kha'Zix") key = "Khazix";
          if (c.name === "Cho'Gath") key = "Chogath";
          if (c.name === "Vel'Koz") key = "Velkoz";
          if (c.name === "LeBlanc") key = "Leblanc";
          
          return picks.includes(key) || picks.includes(c.name);
        });

        if (championsToDisable.length > 0) {
          const idsToDisable = championsToDisable.map(c => c.id);
          await supabase
            .from("champions")
            .update({ is_available: false })
            .in("id", idsToDisable);
        }
      }
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
      JSON.stringify({ picks, status }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
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