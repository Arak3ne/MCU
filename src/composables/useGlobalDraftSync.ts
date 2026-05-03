import { onMounted, onUnmounted } from "vue";
import { supabase } from "../lib/supabase";
import { logDraftSyncClient } from "../lib/logDraftSyncClient";

export function useGlobalDraftSync() {
  let syncInterval: ReturnType<typeof setInterval> | null = null;
  let lastUserFetch = 0;
  let locked = false;

  const syncActiveDrafts = async () => {
    try {
      if (locked) return;

      const userStr = localStorage.getItem("mcu_user");
      if (!userStr) return;

      let user = JSON.parse(userStr);
      const now = Date.now();
      if (now - lastUserFetch > 60000) {
        const { data: latestUser } = await supabase
          .from("players")
          .select("team_id")
          .eq("id", user.id)
          .single();
        if (latestUser && latestUser.team_id !== user.team_id) {
          user.team_id = latestUser.team_id;
          localStorage.setItem("mcu_user", JSON.stringify(user));
        }
        lastUserFetch = now;
      }

      if (!user.team_id) return;

      const { data: activeMatches, error } = await supabase
        .from("playoff_matches")
        .select("id, draft_id")
        .or(`team1_id.eq.${user.team_id},team2_id.eq.${user.team_id}`)
        .not("draft_id", "is", null)
        .eq("is_completed", false);

      if (error || !activeMatches?.length) return;

      locked = true;
      try {
        for (const match of activeMatches) {
          if (!match.draft_id) continue;

          const { data, error: funcError } = await supabase.functions.invoke("sync-draft", {
            body: { draftId: match.draft_id },
          });

          logDraftSyncClient("global", match.draft_id, data, funcError ?? null);
        }
      } finally {
        locked = false;
      }
    } catch (e) {
      console.error("[global-draft-sync]", e);
    }
  };

  onMounted(() => {
    void syncActiveDrafts();
    syncInterval = setInterval(syncActiveDrafts, 8000);
  });

  onUnmounted(() => {
    if (syncInterval) clearInterval(syncInterval);
  });
}
