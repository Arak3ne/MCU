<template>
  <div class="relative min-h-[calc(100vh-3.5rem)] text-[#F0FDF4]">
    <!-- Background styling similar to Dashboard -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div class="absolute top-[-18%] left-[-10%] w-[46%] h-[46%] bg-[#4ADE80] opacity-[0.04] blur-[100px] rounded-full"></div>
      <div class="absolute bottom-[-18%] right-[-10%] w-[46%] h-[46%] bg-[#22C55E] opacity-[0.04] blur-[100px] rounded-full"></div>
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.07] mix-blend-overlay"></div>
    </div>
    
    <div class="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div class="relative">
          <!-- Decorative glow behind title -->
          <div class="absolute -inset-4 bg-mcu-primary/10 blur-2xl rounded-full pointer-events-none"></div>
          <h1 class="relative text-3xl md:text-5xl font-title uppercase tracking-widest text-white mb-2 flex items-center gap-3 drop-shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <span>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-mcu-primary via-emerald-300 to-teal-200 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] normal-case">Morue-verse</span> 
              <span class="text-white/90 ml-2">Leaderboard</span>
            </span>
          </h1>
          <p class="relative text-white/50 text-sm md:text-base tracking-wide font-medium">Découvrez le classement des meilleures équipes du tournoi.</p>
        </div>
        
          <!-- Day Toggle REMOVED - General Leaderboard only -->
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-32 opacity-90">
        <div class="relative w-28 h-28 mb-10">
          <div class="absolute inset-0 border-4 border-white/5 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
          <div class="absolute inset-0 border-4 border-mcu-primary rounded-full border-t-transparent animate-spin shadow-[0_0_30px_rgba(34,197,94,0.4)]"></div>
          <div class="absolute inset-3 border-4 border-emerald-400/30 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
          <div class="absolute inset-0 bg-gradient-to-tr from-mcu-primary/20 to-teal-500/10 rounded-full blur-xl animate-pulse"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-8 h-8 bg-mcu-primary/20 rounded-full animate-ping"></div>
          </div>
        </div>
        <p class="text-transparent bg-clip-text bg-gradient-to-r from-mcu-primary to-emerald-300 uppercase tracking-widest text-sm font-bold animate-pulse drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]">Chargement du classement...</p>
      </div>

      <!-- Leaderboard content -->
      <div v-else class="space-y-8">
        <!-- User Rank Highlight (if user is in leaderboard) -->
        <div v-if="userRankEntry" class="relative group">
          <div class="absolute inset-0 bg-gradient-to-r from-mcu-primary/30 via-emerald-400/20 to-teal-500/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
          <div class="relative bg-mcu-surface-light/90 backdrop-blur-xl border border-mcu-primary/40 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
            <!-- Decorative background element -->
            <div class="absolute -right-20 -top-20 w-64 h-64 bg-mcu-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div class="flex items-center gap-6 w-full sm:w-auto">
              <div class="w-16 h-16 shrink-0 rounded-full bg-mcu-surface border-2 border-mcu-primary/60 flex items-center justify-center font-title text-2xl text-mcu-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)] relative z-10">
                #{{ userRankIndex + 1 }}
              </div>
              <div class="relative z-10">
                <h2 class="text-2xl font-title uppercase tracking-widest text-white drop-shadow-md">{{ userRankEntry.teamName }}</h2>
                <div class="flex items-center gap-2 mt-1">
                  <span class="px-2 py-0.5 rounded bg-mcu-primary/20 text-mcu-primary border border-mcu-primary/30 text-[10px] tracking-widest font-sans font-bold">VOTRE ÉQUIPE</span>
                </div>
              </div>
            </div>
            <div class="text-right relative z-10 w-full sm:w-auto flex sm:block justify-between items-center border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0 mt-2 sm:mt-0">
              <div class="text-sm text-white/50 uppercase tracking-widest font-bold sm:hidden">Score Total</div>
              <div class="text-3xl font-title text-transparent bg-clip-text bg-gradient-to-r from-mcu-primary to-emerald-300 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                {{ userRankEntry.totalPoints.toFixed(2) }} <span class="text-sm text-mcu-primary/70">pts</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Leaderboard List -->
        <div class="relative">
          <div v-if="leaderboard.length === 0" class="bg-mcu-surface/75 backdrop-blur-2xl border border-mcu-border rounded-3xl py-24 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div class="w-20 h-20 mx-auto bg-gradient-to-br from-white/10 to-transparent rounded-full flex items-center justify-center mb-6 border border-mcu-border">
              <svg class="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-title uppercase tracking-widest text-white/60 mb-2">Aucun résultat</h3>
            <p class="text-white/40 text-sm">Le classement général n'est pas encore disponible.</p>
          </div>

          <div v-else class="space-y-3">
            <!-- Header Row -->
            <div class="hidden md:grid grid-cols-[80px_1fr_120px] gap-4 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <div class="text-center">Rang</div>
              <div>Équipe & Choix</div>
              <div class="text-right">Points</div>
            </div>

            <!-- Leaderboard Items -->
            <div 
              v-for="(entry, index) in leaderboard" 
              :key="entry.teamId"
              class="group relative bg-mcu-surface/60 backdrop-blur-md border rounded-xl transition-all duration-300 hover:-translate-y-0.5"
              :class="[
                entry.userId === currentUserId 
                  ? 'border-mcu-primary/30 shadow-[0_0_20px_rgba(34,197,94,0.05)]' 
                  : index === 0 ? 'border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.02)]'
                  : index === 1 ? 'border-gray-300/20'
                  : index === 2 ? 'border-orange-600/20'
                  : 'border-mcu-border/50 hover:border-mcu-border'
              ]"
            >
              <!-- Highlight background for user team - subtle glow instead of gradient -->
              <div v-if="entry.userId === currentUserId" class="absolute inset-0 bg-mcu-primary/[0.02] rounded-xl pointer-events-none"></div>

              <div class="relative p-4 sm:px-6 sm:py-5 flex flex-col md:grid md:grid-cols-[80px_1fr_120px] gap-4 md:gap-6 items-center">
                
                <!-- Rank -->
                <div class="flex md:justify-center w-full md:w-auto justify-between items-center md:block">
                  <span class="text-xs font-bold uppercase tracking-widest text-white/30 md:hidden">Rang</span>
                  <div class="relative flex items-center justify-center w-12 h-12 rounded-full"
                       :class="[
                         index === 0 ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500/90' :
                         index === 1 ? 'bg-gray-400/10 border border-gray-400/30 text-gray-300/90' :
                         index === 2 ? 'bg-orange-600/10 border border-orange-600/30 text-orange-500/90' :
                         'bg-mcu-surface-light/50 border border-mcu-border/50 text-white/50'
                       ]">
                    <span class="font-title text-xl mt-0.5">{{ index + 1 }}</span>
                  </div>
                </div>

                <!-- Team Info & Picks -->
                <div class="w-full">
                  <div class="flex flex-wrap items-center gap-3 mb-3">
                    <h3 class="font-title text-xl uppercase tracking-wider text-white/90 group-hover:text-mcu-primary transition-colors">
                      {{ entry.teamName }}
                    </h3>
                    <div class="flex items-center gap-2">
                      <span v-if="entry.userId === currentUserId" class="px-2 py-1 rounded bg-mcu-primary/10 text-mcu-primary border border-mcu-primary/20 text-[10px] tracking-widest font-bold">MOI</span>
                      <span class="px-2 py-1 rounded bg-black/30 text-white/40 border border-mcu-border/50 text-[10px] tracking-widest font-bold flex items-center gap-1.5">
                        <svg class="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        {{ entry.creatorPseudo }}
                      </span>
                    </div>
                  </div>

                  <!-- Picks -->
                  <div v-if="entry.picks && entry.picks.length > 0" class="flex flex-wrap gap-2">
                    <div v-for="pick in entry.picks" :key="pick.playerId" 
                         class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-mcu-border/30 text-xs group/pick hover:border-mcu-border/60 transition-all">
                      <span class="text-white/70 font-bold group-hover/pick:text-white transition-colors flex items-center gap-1.5">
                        <span v-if="pick.isCaptain" class="text-yellow-500/80" title="Capitaine">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.5 3a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0v-1.5A.75.75 0 005.5 3zm9 0a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0v-1.5A.75.75 0 0014.5 3zM3 7.5A.75.75 0 013.75 7h12.5a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-7.5zM4.5 8.5v6h11v-6h-11z" clip-rule="evenodd" /></svg>
                        </span>
                        {{ pick.pseudo }}
                      </span>
                      <div class="w-px h-3.5 bg-white/10"></div>
                      <span class="font-title text-sm mt-0.5" 
                            :class="pick.score > 0 ? 'text-mcu-primary/80' : (pick.score < 0 ? 'text-red-400/80' : 'text-white/30')">
                        {{ pick.score > 0 ? '+' : '' }}{{ pick.score.toFixed(2) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Total Points -->
                <div class="w-full md:w-auto flex justify-between items-center md:block border-t border-white/5 md:border-0 pt-3 md:pt-0 mt-2 md:mt-0 md:text-right">
                  <span class="text-xs font-bold uppercase tracking-widest text-white/30 md:hidden">Points</span>
                  <div class="font-title text-2xl tracking-wide"
                       :class="entry.totalPoints > 0 ? 'text-mcu-primary/90' : (entry.totalPoints < 0 ? 'text-red-400/90' : 'text-white/40')">
                    {{ entry.totalPoints.toFixed(2) }}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { fantasyService } from '../services/fantasyService';
import { getPlayers } from '../lib/queries';
import type { FantasyLeaderboardEntry } from '../types/fantasy';

const loading = ref(true);
const currentUserId = ref<string | null>(null);
const leaderboard = ref<FantasyLeaderboardEntry[]>([]);

const loadLeaderboard = async () => {
  loading.value = true;
  try {
    const [playersRes, scoresDay1, scoresDay2, board] = await Promise.all([
      getPlayers(),
      fantasyService.getPlayerScores(1),
      fantasyService.getPlayerScores(2),
      fantasyService.getGlobalLeaderboard()
    ]);

    const allPlayers = playersRes.data || [];
    const playerMap = new Map(allPlayers.map(p => [p.id, p]));

    // Map pseudos and scores to picks
    const enrichedBoard = board.map(entry => {
      const creator = playerMap.get(entry.userId);
      const creatorPseudo = creator ? creator.pseudo : 'Inconnu';

      if (entry.picks) {
        entry.picks = entry.picks.map(pick => {
          const player = playerMap.get(pick.playerId);
          // For global leaderboard, we show the score from the day the pick was active
          // entry.tournamentDay is the day these picks are from
          const scores = entry.tournamentDay === 1 ? scoresDay1 : scoresDay2;
          const rawScore = scores[pick.playerId] || 0;
          return {
            ...pick,
            pseudo: player ? player.pseudo : 'Unknown',
            score: pick.isCaptain ? rawScore * 1.5 : rawScore
          };
        });
        
        // Sort picks: Captain first, then by score descending
        entry.picks.sort((a, b) => {
          if (a.isCaptain) return -1;
          if (b.isCaptain) return 1;
          return b.score - a.score;
        });
      }
      return {
        ...entry,
        creatorPseudo
      };
    });

    leaderboard.value = enrichedBoard;
  } catch (error) {
    console.error('Failed to load leaderboard', error);
  } finally {
    loading.value = false;
  }
};

const userRankIndex = computed(() => {
  if (!currentUserId.value) return -1;
  return leaderboard.value.findIndex(entry => entry.userId === currentUserId.value);
});

const userRankEntry = computed(() => {
  if (userRankIndex.value === -1) return null;
  return leaderboard.value[userRankIndex.value];
});

onMounted(() => {
  // Get current user ID from local storage
  const userStr = localStorage.getItem('mcu_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      currentUserId.value = user.id;
    } catch (e) {
      console.error('Could not parse user from local storage', e);
    }
  }
  
  loadLeaderboard();
});
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
