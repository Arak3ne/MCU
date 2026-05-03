/** Client breadcrumbs — pair with `[sync-draft][draftId]` in Supabase logs (`rid`). */

export interface SyncDraftData {
  success?: boolean;
  code?: string;
  hint?: string;
  error?: string;
  detail?: string;
  rid?: string;
  status?: string;
  picks?: string[];
  freshFromApi?: string[];
  disabledCount?: number;
  unmatchedPicks?: string[];
}

export function logDraftSyncClient(
  routeTag: string,
  draftId: string,
  data: SyncDraftData | null | undefined,
  funcError: { message: string } | null,
): void {
  const tag = `[draft-sync:${routeTag}]`;
  if (funcError) {
    console.warn(tag, "invoke error", { draftId, message: funcError.message });
    return;
  }
  if (data?.success === false || data?.error) {
    console.warn(tag, "Edge sync-draft erreur métier", {
      draftId,
      code: data?.code,
      error: data?.error,
      hint: data?.hint,
      rid: data?.rid,
    });
    return;
  }
  console.info(tag, "ok", {
    draftId,
    rid: data?.rid,
    status: data?.status,
    picksCount: Array.isArray(data?.picks) ? data!.picks!.length : undefined,
    picksPreview: Array.isArray(data?.picks) ? data!.picks!.slice(0, 10) : undefined,
    disabledCount: data?.disabledCount,
    unmatchedPicks: data?.unmatchedPicks,
  });
  const um = data?.unmatchedPicks;
  if (Array.isArray(um) && um.length > 0) {
    console.warn(tag, "unmatched picks (pas de ligne champion)", { draftId, um });
  }
}
