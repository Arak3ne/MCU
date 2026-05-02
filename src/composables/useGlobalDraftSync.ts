import { onMounted, onUnmounted } from 'vue';
import { supabase } from '../lib/supabase';

export function useGlobalDraftSync() {
  let syncInterval: any = null;

  let lastUserFetch = 0;

  const syncActiveDrafts = async () => {
    try {
      const userStr = localStorage.getItem('mcu_user');
      if (!userStr) return;
      
      let user = JSON.parse(userStr);
      
      // Fetch latest user data from DB every 60 seconds to ensure team_id is up to date
      const now = Date.now();
      if (now - lastUserFetch > 60000) {
        const { data: latestUser } = await supabase.from('players').select('team_id').eq('id', user.id).single();
        if (latestUser && latestUser.team_id !== user.team_id) {
          user.team_id = latestUser.team_id;
          localStorage.setItem('mcu_user', JSON.stringify(user));
        }
        lastUserFetch = now;
      }

      if (!user.team_id) return;

      // Find active drafts for the user's team
      const { data: activeMatches, error } = await supabase
        .from('playoff_matches')
        .select('id, draft_id')
        .or(`team1_id.eq.${user.team_id},team2_id.eq.${user.team_id}`)
        .not('draft_id', 'is', null)
        .eq('is_completed', false);

      if (error || !activeMatches || activeMatches.length === 0) return;

      for (const match of activeMatches) {
        if (!match.draft_id) continue;

        const { data, error: funcError } = await supabase.functions.invoke("sync-draft", {
          body: {
            draftId: match.draft_id,
            apiKey: "DRAFTER-59605981-E026-439E-BAFC-3C532CF18FB1"
          }
        });

        if (funcError) continue;

        // If the draft is finished, the Edge Function will automatically update the database
        // to disable the picked champions.
        if (data?.status === "FINISHED") {
          console.log(`Draft ${match.draft_id} is finished. Champions disabled in DB.`);
        }
      }
    } catch (err) {
      console.error("Global draft sync error:", err);
    }
  };

  onMounted(() => {
    // Run immediately, then every 10 seconds
    syncActiveDrafts();
    syncInterval = setInterval(syncActiveDrafts, 10000);
  });

  onUnmounted(() => {
    if (syncInterval) {
      clearInterval(syncInterval);
    }
  });
}
