/**
 * Synchro draft : unique source `GET https://api.drafter.lol/api/drafts/:id`
 * (avec clé API Full quand les drafts terminées exposent draftData).
 *
 * Persist `playoff_matches.draft_picks` + désactive `champions.is_available` côté service role.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import {
  ChampionPickRow,
  picksWithNoChampionRow,
  rowMatchesAnyPick,
} from "../_shared/championKeys.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function slog(
  draftId: string | undefined,
  level: "info" | "warn" | "error",
  message: string,
  extra?: Record<string, unknown>,
  rid?: string,
) {
  const tag = draftId ? `[sync-draft][${draftId}]` : "[sync-draft]"
  const line = `${tag} ${new Date().toISOString()} ${message}`
  const payload = rid ? { rid, ...(extra ?? {}) } : extra
  if (payload && Object.keys(payload).length > 0) {
    console[level](line, JSON.stringify(payload))
  } else {
    console[level](line)
  }
}

function collectFromPickSlotKeys(draftData: Record<string, unknown>, out: Set<string>) {
  for (let i = 1; i <= 5; i++) {
    for (const base of [`bluePick${i}`, `redPick${i}`, `BluePick${i}`, `RedPick${i}`]) {
      const v = draftData[base]
      if (typeof v === "string" && v.trim()) out.add(v.trim())
    }
  }
}

function looksLikeChampionPickId(s: string): boolean {
  const t = s.trim()
  return t.length >= 2 && t.length <= 32 && /^[A-Za-z][A-Za-z0-9']*$/.test(t)
}

function collectFromPickArrays(value: unknown, out: Set<string>) {
  if (!Array.isArray(value)) return
  for (const item of value) {
    if (typeof item === "string" && looksLikeChampionPickId(item)) {
      out.add(item.trim())
      continue
    }
    if (typeof item === "object" && item !== null) {
      const o = item as Record<string, unknown>
      for (const k of ["championId", "id", "key", "name"]) {
        const v = o[k]
        if (typeof v === "string" && looksLikeChampionPickId(v)) {
          out.add(v.trim())
          break
        }
      }
    }
  }
}

function extractPicksFromLiveDraft(draftData: Record<string, unknown>): string[] {
  const out = new Set<string>()
  collectFromPickSlotKeys(draftData, out)
  for (
    const k of [
      "pickOrder",
      "picks",
      "pickOrderIds",
      "completedPicks",
      "selections",
      "bluePicks",
      "redPicks",
    ]
  ) {
    collectFromPickArrays(draftData[k], out)
  }
  const nested = draftData["draft"]
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    collectFromPickSlotKeys(nested as Record<string, unknown>, out)
    for (const k of ["pickOrder", "picks"]) {
      collectFromPickArrays((nested as Record<string, unknown>)[k], out)
    }
  }
  return [...out]
}

function draftDataKeySample(draftData: Record<string, unknown>): string[] {
  return Object.keys(draftData).slice(0, 40)
}

async function persistDraftPicksMerged(
  supabase: SupabaseClient,
  draftId: string,
  freshFromApi: string[],
  rid?: string,
): Promise<string[]> {
  const { data: row, error: readErr } = await supabase
    .from("playoff_matches")
    .select("draft_picks")
    .eq("draft_id", draftId)
    .maybeSingle()

  if (readErr) {
    slog(draftId, "error", "playoff_matches read draft_picks failed", {
      message: readErr.message,
    }, rid)
  }

  const existing = Array.isArray(row?.draft_picks)
    ? [...(row!.draft_picks as string[])]
    : []
  const existingSet = new Set(existing)
  const newFromApiThisPoll = freshFromApi
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter((t) => t && !existingSet.has(t))

  const merged: string[] = [...existing]
  for (const p of freshFromApi) {
    const t = typeof p === "string" ? p.trim() : ""
    if (t && !merged.includes(t)) merged.push(t)
  }

  slog(draftId, "info", "draft_picks merge (Drafter + DB)", {
    existingCount: existing.length,
    freshFromApiCount: freshFromApi.length,
    newFromApiThisPollCount: newFromApiThisPoll.length,
    newFromApiThisPoll,
    mergedCount: merged.length,
  }, rid)

  const { data, error } = await supabase
    .from("playoff_matches")
    .update({ draft_picks: merged })
    .eq("draft_id", draftId)
    .select("id")

  if (error) {
    slog(draftId, "error", "playoff_matches draft_picks update failed", {
      code: error.code,
      message: error.message,
    }, rid)
    return merged
  }

  const rowCount = data?.length ?? 0
  if (rowCount === 0) {
    slog(draftId, "warn", "playoff_matches update 0 rows — draft_id hors playoff_matches ?", {
      mergedCount: merged.length,
    }, rid)
  } else {
    slog(draftId, "info", "playoff_matches draft_picks persisted", {
      rowCount,
      mergedCount: merged.length,
      matchIds: (data ?? []).map((row: { id?: string }) => row.id),
    }, rid)
  }

  return merged
}

async function disableChampionsForPicks(
  supabase: SupabaseClient,
  draftId: string,
  picks: string[],
  rid?: string,
): Promise<{ disabledCount: number; disabledNames: string[]; unmatchedPicks: string[] }> {
  const pickSet = new Set(picks.filter(Boolean))

  if (pickSet.size === 0) {
    slog(draftId, "info", "disable champions — skip (aucun pick)", {}, rid)
    return { disabledCount: 0, disabledNames: [], unmatchedPicks: [] }
  }

  slog(draftId, "info", "disable champions — entrée", {
    pickCount: pickSet.size,
    picksPreview: [...pickSet].slice(0, 12),
  }, rid)

  const { data: allRows, error: fetchErr } = await supabase
    .from("champions")
    .select("id, name, ddragon_key, image_url, is_available")

  if (fetchErr || !allRows) {
    slog(draftId, "error", "champions select failed", {
      message: fetchErr?.message,
    }, rid)
    return { disabledCount: 0, disabledNames: [], unmatchedPicks: [...pickSet] }
  }

  const rows = allRows as (ChampionPickRow & { is_available: boolean })[]
  const unmatchedPicks = picksWithNoChampionRow([...pickSet], rows)

  if (unmatchedPicks.length > 0) {
    slog(draftId, "warn", "picks sans ligne champion correspondante", {
      unmatchedPicks,
    }, rid)
  }

  const toDisable = rows.filter((r) => r.is_available && rowMatchesAnyPick(r, pickSet))

  slog(draftId, "info", "champions correspondants", {
    rowsToDisable: toDisable.length,
    availableRows: rows.filter((r) => r.is_available).length,
  }, rid)

  if (toDisable.length === 0) {
    return { disabledCount: 0, disabledNames: [], unmatchedPicks }
  }

  const ids = toDisable.map((c) => c.id)
  const { error: updErr } = await supabase
    .from("champions")
    .update({
      is_available: false,
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)

  if (updErr) {
    slog(draftId, "error", "champions update failed", { message: updErr.message }, rid)
    return { disabledCount: 0, disabledNames: [], unmatchedPicks }
  }

  const disabledNames = toDisable.map((c) => c.name)
  slog(draftId, "info", "champions désactivés", {
    count: toDisable.length,
    names: disabledNames,
  }, rid)

  return {
    disabledCount: toDisable.length,
    disabledNames,
    unmatchedPicks,
  }
}

const DRAFTER_DENIED_MARKERS = ["Draft data is not included", "upgrade", "Community"]

serve(async (req) => {
  if (req.method === "OPTIONS") {
    console.info(`[sync-draft] ${new Date().toISOString()} OPTIONS`)
    return new Response("ok", { headers: corsHeaders })
  }

  let draftId: string | undefined
  let rid = ""
  const requestStarted = Date.now()

  try {
    rid = crypto.randomUUID().slice(0, 12)
    const body = await req.json().catch(() => ({}))
    draftId = body.draftId
    slog(draftId, "info", "POST sync-draft", {
      hasDraftId: Boolean(draftId),
      keyFromEnv: Boolean((Deno.env.get("DRAFTER_API_KEY") ?? "").trim()),
    }, rid)

    if (!draftId) throw new Error("Missing draftId")

    const drafterApiKey = (Deno.env.get("DRAFTER_API_KEY") ?? "").trim()
    if (!drafterApiKey) {
      throw new Error(
        "DRAFTER_API_KEY is not configured (supabase secrets / local .env for functions)",
      )
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    const url = `https://api.drafter.lol/api/drafts/${draftId}`
    const t0 = Date.now()
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${drafterApiKey}` },
    })
    const fetchMs = Date.now() - t0

    slog(draftId, "info", "GET api/drafter/lol/api/drafts/:id", {
      httpStatus: res.status,
      ok: res.ok,
      fetchMs,
    }, rid)

    const errBody = await res.text()

    if (!res.ok) {
      const planDenied =
        res.status === 403 &&
        DRAFTER_DENIED_MARKERS.some((m) => errBody.includes(m))

      slog(draftId, "error", "Drafter GET failed", {
        httpStatus: res.status,
        planDeniedGuess: planDenied,
        bodyPreview: errBody.slice(0, 280),
      }, rid)

      /** HTTP 200 + success:false → invoke() ne monte pas forcément en erreur réseau */
      return new Response(
        JSON.stringify({
          success: false,
          code: planDenied ? "DRAFTER_PLAN_LIMIT" : "DRAFTER_HTTP_ERROR",
          error: planDenied
            ? "Draft data inaccessible avec ce plan Drafter (ex. draft terminée en Community)."
            : `Drafter ${res.status}`,
          hint: planDenied
            ? "Upgrade « Full API Access » chez Drafter pour garder draftData après la draft."
            : undefined,
          detail: errBody.slice(0, 400),
          picks: [],
          status: "UNAVAILABLE",
          disabledCount: 0,
          unmatchedPicks: [],
          rid,
          fetchMs,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    let data: Record<string, unknown>
    try {
      data = JSON.parse(errBody)
    } catch {
      slog(draftId, "error", "Drafter body not JSON", { fetchMs }, rid)
      throw new Error("Drafter response is not valid JSON")
    }

    const draftData = (data.draftData || {}) as Record<string, unknown>
    const status = String(data.status ?? draftData.status ?? "UNKNOWN")

    const freshIds = extractPicksFromLiveDraft(draftData)
    slog(draftId, "info", "draftData analysé", {
      status,
      freshPickCount: freshIds.length,
      draftDataKeysSample: draftDataKeySample(draftData),
      fetchMs,
    }, rid)

    if (freshIds.length === 0) {
      slog(draftId, "warn", "0 pick extrait — clés ou draft vide", {
        draftDataSampleKeys: draftDataKeySample(draftData),
      }, rid)
    }

    const mergedPicks = await persistDraftPicksMerged(supabase, draftId, freshIds, rid)

    let disabledCount = 0
    let unmatchedPicks: string[] = []
    if (mergedPicks.length > 0) {
      const r = await disableChampionsForPicks(supabase, draftId, mergedPicks, rid)
      disabledCount = r.disabledCount
      unmatchedPicks = r.unmatchedPicks
    }

    slog(draftId, "info", "sync OK", {
      durationMs: Date.now() - requestStarted,
      mergedCount: mergedPicks.length,
      disabledCount,
    }, rid)

    return new Response(
      JSON.stringify({
        success: true,
        picks: mergedPicks,
        freshFromApi: freshIds,
        status,
        disabledCount,
        unmatchedPicks,
        rid,
        fetchMs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    )
  } catch (error) {
    slog(draftId, "error", "exception", {
      message: error instanceof Error ? error.message : String(error),
    }, rid || undefined)

    return new Response(
      JSON.stringify({
        success: false,
        code: "INTERNAL",
        error: error instanceof Error ? error.message : "Unknown error",
        rid,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    )
  }
})
