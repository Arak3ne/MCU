<template>
  <div class="relative min-h-[calc(100vh-3.5rem)] text-[#F0FDF4]">
    <!-- Error Toast -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="globalError" class="fixed top-24 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-4">
        <div class="bg-[#111111] border border-red-500/50 rounded-lg p-4 shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-4 backdrop-blur-xl">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-red-500 font-bold uppercase tracking-widest text-xs">Erreur</p>
            <p class="text-[#F0FDF4] text-sm">{{ globalError }}</p>
          </div>
          <button @click="globalError = ''" class="text-[#A1A1AA] hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Background accents -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div class="absolute top-[-18%] left-[-10%] w-[46%] h-[46%] bg-[#4ADE80] opacity-[0.04] blur-[100px] rounded-full"></div>
      <div class="absolute bottom-[-18%] right-[-10%] w-[46%] h-[46%] bg-[#22C55E] opacity-[0.04] blur-[100px] rounded-full"></div>
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.07] mix-blend-overlay"></div>
    </div>

    <!-- Main Content -->
    <main class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in-up">
      <!-- Header -->
      <div class="text-center mb-12 relative">
        <div class="inline-block relative">
          <h1 class="text-4xl md:text-5xl font-title uppercase tracking-widest mb-4 flex items-center justify-center gap-3 drop-shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-mcu-primary via-emerald-300 to-teal-200 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse normal-case">MATCHES</span>
          </h1>
          <div class="absolute -inset-x-16 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-mcu-primary/30 to-transparent -z-10"></div>
        </div>
        <p class="text-white/50 text-sm tracking-wide uppercase">Sélectionnez un match pour démarrer la draft</p>
      </div>

      <!-- Match List -->
      <div v-if="rounds.length > 0" class="flex flex-col gap-12">
        <div v-for="round in rounds" :key="round.number" class="space-y-6">
          <!-- Round Header -->
          <div class="flex items-center gap-4">
            <h2 class="text-2xl md:text-3xl font-title uppercase tracking-widest text-white drop-shadow-md flex items-center gap-3">
              <span class="w-3 h-3 rounded-full bg-mcu-primary shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
              Ronde {{ round.number }}
            </h2>
            <div class="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>

            <!-- Matches for this round -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <button
                v-for="(match, index) in round.matches"
                :key="index"
                @click="startDraftForMatch(match, round.number, rounds)"
                class="group relative bg-gradient-to-br from-[#1A1A1A] to-[#111111] backdrop-blur-xl rounded-[2rem] border border-[#2A2A2A] hover:border-mcu-primary/45 transition-all duration-500 flex items-center justify-between p-5 md:p-6 overflow-hidden w-full shadow-[0_10px_32px_rgba(0,0,0,0.55)] hover:shadow-[0_16px_44px_rgba(34,197,94,0.12)] hover:-translate-y-1 cursor-pointer"
              >
              <!-- Hover Effects -->
              <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5 mix-blend-overlay"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-mcu-primary/0 via-mcu-primary/10 to-mcu-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div class="absolute left-0 top-0 w-1.5 h-full bg-mcu-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_20px_rgba(34,197,94,1)]"></div>
              <div class="absolute right-0 top-0 w-1.5 h-full bg-mcu-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_20px_rgba(34,197,94,1)]"></div>

              <!-- Blue Side -->
              <div class="flex-1 flex items-center justify-end gap-2 sm:gap-4 relative z-10 min-w-0">
                <span 
                  class="font-title text-white group-hover:text-mcu-accent drop-shadow-[0_0_8px_rgba(11,198,227,0.4)] transition-all uppercase tracking-wider text-right leading-none"
                  :class="match.team1.name.length > 20 ? 'text-xs sm:text-sm md:text-base' : match.team1.name.length > 12 ? 'text-sm sm:text-base md:text-lg' : 'text-base sm:text-xl md:text-2xl'"
                >
                  {{ match.team1.name }}
                </span>
                <div class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-black/60 border border-white/10 group-hover:border-mcu-accent/50 flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-300 shrink-0">
                  <span class="font-title text-white group-hover:text-mcu-accent text-lg sm:text-xl uppercase tracking-wider transition-colors">{{ match.team1.name.substring(0, 2) }}</span>
                </div>
              </div>

              <!-- Scores or VS -->
              <div class="mx-2 sm:mx-4 md:mx-6 relative flex flex-col items-center justify-center z-10 shrink-0 min-w-[4.25rem] sm:min-w-[5rem]">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] sm:w-[100px] h-[1px] bg-gradient-to-r from-transparent via-[#2A2A2A] group-hover:via-mcu-primary to-transparent transition-colors duration-500 -z-10"></div>
                <template v-if="matchHasScores(match)">
                  <div class="flex items-center gap-1 sm:gap-1.5 font-title tabular-nums leading-none">
                    <span
                      class="text-lg sm:text-xl md:text-2xl transition-colors duration-300"
                      :class="championshipScoreClass(match, 1)"
                    >{{ match.team1_score }}</span>
                    <span class="text-white/20 text-xs sm:text-sm font-normal select-none">—</span>
                    <span
                      class="text-lg sm:text-xl md:text-2xl transition-colors duration-300"
                      :class="championshipScoreClass(match, 2)"
                    >{{ match.team2_score }}</span>
                  </div>
                  <span
                    v-if="match.is_completed"
                    class="text-[9px] text-white/35 uppercase tracking-[0.2em] mt-1.5"
                  >Terminé</span>
                </template>
                <div
                  v-else
                  class="text-[10px] sm:text-xs text-white/50 group-hover:text-black font-title italic bg-black/80 group-hover:bg-mcu-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10 group-hover:border-mcu-primary shadow-[0_0_20px_rgba(0,0,0,1)] group-hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all duration-500 group-hover:scale-110 backdrop-blur-sm"
                >
                  VS
                </div>
              </div>

              <!-- Red Side -->
              <div class="flex-1 flex items-center justify-start gap-2 sm:gap-4 relative z-10 min-w-0">
                <div class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-black/60 border border-white/10 group-hover:border-red-400/50 flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-300 shrink-0">
                  <span class="font-title text-white group-hover:text-red-400 text-lg sm:text-xl uppercase tracking-wider transition-colors">{{ match.team2.name.substring(0, 2) }}</span>
                </div>
                <span 
                  class="font-title text-white group-hover:text-red-400 drop-shadow-[0_0_8px_rgba(255,78,80,0.4)] transition-all uppercase tracking-wider text-left leading-none"
                  :class="match.team2.name.length > 20 ? 'text-xs sm:text-sm md:text-base' : match.team2.name.length > 12 ? 'text-sm sm:text-base md:text-lg' : 'text-base sm:text-xl md:text-2xl'"
                >
                  {{ match.team2.name }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-32 bg-[#111111]/40 backdrop-blur-xl rounded-[2rem] border border-dashed border-[#2A2A2A]/70 transition-all hover:border-mcu-primary/35 hover:bg-[#1A1A1A]/50 group shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <div class="relative w-24 h-24 mx-auto mb-8">
          <div class="absolute inset-0 bg-mcu-primary/10 rounded-full blur-2xl group-hover:bg-mcu-primary/20 transition-colors duration-500"></div>
          <svg class="relative z-10 w-24 h-24 text-white/20 group-hover:text-mcu-primary/70 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-3xl font-title tracking-wider text-white mb-3 group-hover:text-mcu-primary transition-colors duration-500 drop-shadow-md">Aucun match prévu</h3>
        <p class="text-white/50 text-base tracking-wide">Les matchs seront bientôt annoncés.</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";
import { fetchChampionshipMatchesHydrated } from "../lib/queries";
import { subscribeToTable } from "../lib/realtime";
import type { Database } from "../types/supabase";

type Team = Database["public"]["Tables"]["teams"]["Row"];

interface Match {
  id?: string;
  team1: Team;
  team2: Team;
  is_completed?: boolean;
  team1_score?: number | null;
  team2_score?: number | null;
  draft_url?: string | null;
  draft_id?: string | null;
  draft_blue_team_id?: string | null;
}

interface Round {
  number: number;
  matches: Match[];
}

const router = useRouter();
const matches = ref<any[]>([]);

// Computed property to group matches into rounds
const rounds = computed<Round[]>(() => {
  if (matches.value.length === 0) return [];
  
  const roundsMap: Record<number, Match[]> = {};
  
  for (const m of matches.value) {
    if (!m.team1 || !m.team2) continue;
    
    if (!roundsMap[m.round]) {
      roundsMap[m.round] = [];
    }
    roundsMap[m.round].push({
      id: m.id,
      team1: m.team1,
      team2: m.team2,
      is_completed: m.is_completed,
      team1_score: m.team1_score,
      team2_score: m.team2_score,
      draft_url: m.draft_url,
      draft_id: m.draft_id,
      draft_blue_team_id: m.draft_blue_team_id,
    });
  }
  
  return Object.keys(roundsMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map(roundNum => ({
      number: roundNum,
      matches: roundsMap[roundNum]
    }));
});

const globalError = ref("");

const showError = (msg: string) => {
  globalError.value = msg;
  setTimeout(() => {
    if (globalError.value === msg) globalError.value = "";
  }, 5000);
};

const loadChampionshipMatches = async () => {
  const { data, error } = await fetchChampionshipMatchesHydrated();
  if (error) {
    console.error("Error fetching matches:", error);
    matches.value = [];
    return;
  }
  matches.value = data ?? [];
};

let playoffSub: { unsubscribe: () => void } | null = null;

onMounted(() => {
  loadChampionshipMatches();
  playoffSub = subscribeToTable("playoff_matches", () => {
    void loadChampionshipMatches();
  });
});

onUnmounted(() => {
  playoffSub?.unsubscribe();
  playoffSub = null;
});

const matchHasScores = (match: Match) =>
  match.team1_score != null && match.team2_score != null;

/** Score color when match is completed (blue / red side); ties stay neutral. */
const championshipScoreClass = (match: Match, side: 1 | 2) => {
  if (!matchHasScores(match)) return "text-white/60";
  if (!match.is_completed) return "text-white/80";
  const s1 = Number(match.team1_score);
  const s2 = Number(match.team2_score);
  if (s1 === s2) return "text-white/45";
  const won = side === 1 ? s1 > s2 : s2 > s1;
  if (!won) return "text-white/25";
  return side === 1
    ? "text-mcu-accent drop-shadow-[0_0_8px_rgba(11,198,227,0.35)]"
    : "text-red-400 drop-shadow-[0_0_8px_rgba(255,78,80,0.35)]";
};

const startDraftForMatch = async (match: Match, roundNumber?: number, allRounds?: any[]) => {
  if (!match.team1 || !match.team2) return;
  if (match.is_completed) {
    showError("Ce match est déjà terminé. Impossible de lancer une nouvelle draft.");
    return;
  }

  // Vérifier si les rounds précédents sont terminés
  if (roundNumber && allRounds && roundNumber > 1) {
    const previousRounds = allRounds.filter(r => r.number < roundNumber);
    const allPreviousMatchesCompleted = previousRounds.every(r => 
      r.matches.every((m: any) => m.is_completed)
    );
    
    if (!allPreviousMatchesCompleted) {
      showError("Vous ne pouvez pas lancer la draft pour ce round tant que les matchs des rounds précédents ne sont pas terminés.");
      return;
    }
  }

  // Vérifier si le joueur fait partie de l'une des deux équipes
  const userStr = localStorage.getItem('mcu_user');
  if (!userStr) {
    showError("Vous devez être connecté pour lancer une draft.");
    return;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Fetch latest user data from DB to ensure team_id is up to date
    const { data: latestUser } = await supabase.from('players').select('team_id').eq('id', user.id).single();
    const currentTeamId = latestUser?.team_id || user.team_id;

    if (!currentTeamId || (currentTeamId !== match.team1.id && currentTeamId !== match.team2.id)) {
      showError("Vous ne pouvez lancer la draft que pour les matchs de votre équipe.");
      return;
    }
    
    // Update local storage with latest team_id just in case
    if (latestUser && latestUser.team_id !== user.team_id) {
      user.team_id = latestUser.team_id;
      localStorage.setItem('mcu_user', JSON.stringify(user));
    }
  } catch (e) {
    showError("Erreur d'authentification.");
    return;
  }

  // Si tout est ok, on route vers la draft room
  if (match.id) {
    router.push({ name: 'draft-room', params: { sessionId: match.id } });
  }
};
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>