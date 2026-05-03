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

    <!-- Modal Popup for Draft -->
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div class="absolute inset-0 cursor-pointer bg-black/80 backdrop-blur-md" aria-hidden="true" @click="closeModal"></div>
        <div class="relative cursor-default bg-gradient-to-b from-[#1A1A1A] to-[#0B0F0C] backdrop-blur-2xl border border-mcu-primary/25 rounded-[2rem] w-full max-w-lg shadow-[0_24px_70px_rgba(0,0,0,0.75)] overflow-hidden animate-scale-in">
          
          <!-- Close Button -->
          <button @click="closeModal" class="absolute top-6 right-6 text-white/40 hover:text-white hover:bg-white/10 transition-all p-2 rounded-full cursor-pointer z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div class="p-8 relative">
            <h2 class="text-3xl font-title mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-mcu-primary via-emerald-300 to-teal-200 tracking-wider uppercase drop-shadow-lg">Initialiser la Draft</h2>

            <div v-if="awaitingSideChoice && sidePickMatch" class="space-y-4 mb-8">
              <p class="text-white/50 text-center text-[11px] uppercase tracking-widest leading-relaxed px-1">
                Le premier à ouvrir choisit quelle équipe sera <span class="text-sky-400 normal-case">blue side</span> sur Drafter — l’autre sera red side. Ce n’est pas l’ordre affiché sur le match.
              </p>
              <button
                type="button"
                :disabled="claimingSide"
                @click="confirmDraftBlueSide(sidePickMatch.team1.id)"
                class="w-full py-3.5 px-4 rounded-xl border border-sky-500/45 bg-sky-500/10 hover:bg-sky-500/20 text-sky-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <span class="flex items-center gap-3">
                  <span class="shrink-0 w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.75)]" aria-hidden="true" />
                  <span class="min-w-0 flex flex-col gap-0.5">
                    <span class="font-bold uppercase tracking-widest text-xs text-sky-50 truncate">{{ sidePickMatch.team1.name }}</span>
                    <span class="text-[10px] uppercase tracking-widest text-sky-300/90">Blue side</span>
                  </span>
                </span>
              </button>
              <button
                type="button"
                :disabled="claimingSide"
                @click="confirmDraftBlueSide(sidePickMatch.team2.id)"
                class="w-full py-3.5 px-4 rounded-xl border border-sky-500/45 bg-sky-500/10 hover:bg-sky-500/20 text-sky-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <span class="flex items-center gap-3">
                  <span class="shrink-0 w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.75)]" aria-hidden="true" />
                  <span class="min-w-0 flex flex-col gap-0.5">
                    <span class="font-bold uppercase tracking-widest text-xs text-sky-50 truncate">{{ sidePickMatch.team2.name }}</span>
                    <span class="text-[10px] uppercase tracking-widest text-sky-300/90">Blue side</span>
                  </span>
                </span>
              </button>
              <p v-if="claimingSide" class="text-center text-[10px] text-mcu-primary uppercase tracking-widest animate-pulse">Enregistrement…</p>
            </div>
            
            <div v-else class="flex justify-center items-center gap-4 mb-8 text-sm font-bold uppercase tracking-widest">
              <span class="text-mcu-accent">{{ blueName }}</span>
              <span class="text-white/40 text-xs italic">vs</span>
              <span class="text-red-400">{{ redName }}</span>
            </div>

            <div v-if="drafting" class="text-center py-10">
              <div class="relative w-16 h-16 mx-auto mb-6">
                <div class="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-mcu-primary rounded-full border-t-transparent animate-spin shadow-[0_0_20px_rgba(34,197,94,0.5)]"></div>
              </div>
              <p class="text-mcu-primary uppercase tracking-widest text-sm font-bold animate-pulse">{{ message || 'Génération de la draft...' }}</p>
            </div>

            <div v-else-if="draftUrl" class="space-y-6">
              <p class="text-mcu-primary text-center font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">Draft Générée !</p>
              
              <div class="flex flex-col gap-4">
                <a
                  :href="draftUrl"
                  target="_blank"
                  class="w-full py-4 bg-mcu-primary hover:bg-mcu-accent text-white rounded-xl font-bold text-center transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] uppercase tracking-widest text-sm hover:scale-[1.02]"
                >
                  Ouvrir l'outil de Draft
                </a>
                <button
                  @click="copyDraftLink"
                  class="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-mcu-primary/50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-white/60 hover:text-white uppercase tracking-widest text-xs cursor-pointer"
                >
                  <svg v-if="!linkCopied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-mcu-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span :class="linkCopied ? 'text-mcu-primary' : ''">{{ linkCopied ? 'Copié !' : 'Copier le lien' }}</span>
                </button>
              </div>
              
              <div v-if="draftId" class="flex items-center justify-center gap-2 mt-6 p-3 bg-black/40 border border-white/10 rounded-xl shadow-inner">
                <span class="inline-block w-2 h-2 rounded-full bg-mcu-primary animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                <p class="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                  Synchronisation automatique des picks en arrière-plan...
                </p>
              </div>
            </div>
            
            <div v-else-if="!awaitingSideChoice" class="text-center py-8">
              <p class="text-red-400 font-bold uppercase tracking-widest text-xs mb-6">{{ message || 'Erreur lors de la génération de la draft' }}</p>
              <button @click="generateDraft" class="px-8 py-3 bg-white/5 border border-white/10 hover:border-mcu-primary/50 hover:bg-white/10 rounded-xl text-white font-bold uppercase tracking-widest text-xs transition-all cursor-pointer hover:scale-105">
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { supabase } from "../lib/supabase";
import { fetchChampionshipMatchesHydrated } from "../lib/queries";
import { subscribeToTable } from "../lib/realtime";
import {
  logDraftSyncClient,
  type SyncDraftData,
} from "../lib/logDraftSyncClient";
import { claimOrRefreshDraftBlueTeam, resolveBlueRedNames } from "../lib/draftMatchSides";
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

const showModal = ref(false);
const currentMatchId = ref("");
const blueName = ref("");
const redName = ref("");
const drafting = ref(false);
const draftUrl = ref("");
const draftId = ref("");
const syncing = ref(false);
const message = ref("");
const linkCopied = ref(false);
const globalError = ref("");
const awaitingSideChoice = ref(false);
const claimingSide = ref(false);
const sidePickMatch = ref<{ team1: Team; team2: Team } | null>(null);
let syncInterval: any = null;

const applyDraftDisplayFromMatch = (m: { team1: Team; team2: Team; draft_blue_team_id?: string | null }) => {
  const { blueName: b, redName: r } = resolveBlueRedNames({
    team1: m.team1,
    team2: m.team2,
    draft_blue_team_id: m.draft_blue_team_id,
  });
  blueName.value = b;
  redName.value = r;
};

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
  if (syncInterval) clearInterval(syncInterval);
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

  currentMatchId.value = match.id || "";
  draftUrl.value = "";
  draftId.value = "";
  message.value = "";
  sidePickMatch.value = { team1: match.team1, team2: match.team2 };
  showModal.value = true;

  if (match.draft_url) {
    awaitingSideChoice.value = false;
    applyDraftDisplayFromMatch(match);
    void generateDraft();
    return;
  }
  if (match.draft_blue_team_id) {
    awaitingSideChoice.value = false;
    applyDraftDisplayFromMatch(match);
    void generateDraft();
    return;
  }
  awaitingSideChoice.value = true;
  blueName.value = "";
  redName.value = "";
};

const confirmDraftBlueSide = async (blueTeamId: string) => {
  if (!currentMatchId.value || claimingSide.value) return;
  claimingSide.value = true;
  message.value = "";
  try {
    const r = await claimOrRefreshDraftBlueTeam(supabase, currentMatchId.value, blueTeamId);
    const idx = matches.value.findIndex((m: any) => m.id === currentMatchId.value);
    if (idx !== -1) {
      const cur = matches.value[idx];
      matches.value[idx] = {
        ...cur,
        draft_blue_team_id: r.draft_blue_team_id ?? cur.draft_blue_team_id,
        draft_url: r.draft_url ?? cur.draft_url,
      };
    }
    if (!r.draft_blue_team_id && !r.draft_url) {
      showError("Impossible d’enregistrer le côté bleu. Réessayez.");
      return;
    }
    if (!r.claimed && r.draft_blue_team_id && r.draft_blue_team_id !== blueTeamId) {
      showError("L’autre équipe a déjà choisi les côtés. Alignement sur leur choix.");
    }
    const fresh = matches.value.find((m: any) => m.id === currentMatchId.value);
    if (fresh?.team1 && fresh?.team2) {
      applyDraftDisplayFromMatch(fresh);
    }
    awaitingSideChoice.value = false;
    await generateDraft();
  } catch (e: unknown) {
    message.value = e instanceof Error ? e.message : "Erreur lors du choix des côtés";
  } finally {
    claimingSide.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  awaitingSideChoice.value = false;
  sidePickMatch.value = null;
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};

const generateDraft = async () => {
    try {
      drafting.value = true;
      draftUrl.value = "";
      draftId.value = "";
      linkCopied.value = false;
  
      // Check if draft already exists in database
      const match = matches.value.find((m: any) => m.id === currentMatchId.value);
      if (match && match.draft_url) {
        message.value = "Draft récupérée (base de données)...";
        await new Promise(resolve => setTimeout(resolve, 500));
        
        draftUrl.value = match.draft_url;
        draftId.value = match.draft_id || "";
        if (match.team1 && match.team2) {
          applyDraftDisplayFromMatch(match);
        }
        message.value = "Draft récupérée !";
        
        if (syncInterval) clearInterval(syncInterval);
        syncInterval = setInterval(() => {
          syncDraftPicks();
        }, 4000);
        return;
      }
  
      message.value = "Initialisation de la draft...";
  
      const sideKey = match?.draft_blue_team_id ?? "unset";
      const draftCacheKey = `draft_${currentMatchId.value}_${sideKey}_${blueName.value}_${redName.value}`;
      const cachedDraft = localStorage.getItem(draftCacheKey);
  
      if (cachedDraft) {
        message.value = "Initialisation de l'interface...";
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const parsed = JSON.parse(cachedDraft);
        draftUrl.value = parsed.draftUrl;
        draftId.value = parsed.draftId || "";
        message.value = "Draft récupérée !";
        
        // Also update DB since we have it cached locally but maybe not in DB yet
        if (currentMatchId.value) {
          await supabase.from("playoff_matches").update({
            draft_url: parsed.draftUrl,
            draft_id: parsed.draftId || ""
          }).eq("id", currentMatchId.value);
        }
        
        if (syncInterval) clearInterval(syncInterval);
        syncInterval = setInterval(() => {
          syncDraftPicks();
        }, 4000);
        return;
      }
  
      const { data, error: funcError } = await supabase.functions.invoke("generate-draft", {
        body: {
          matchId: currentMatchId.value,
          blueName: blueName.value,
          redName: redName.value,
        }
      });
  
      if (funcError) {
        let errorDetail = funcError.message;
        try {
          if ((funcError as any).context && typeof (funcError as any).context.json === 'function') {
            const body = await (funcError as any).context.json();
            if (body && body.error) {
              errorDetail = body.error;
            }
          }
        } catch (e) {}
        throw new Error(`Failed to generate: ${errorDetail}`);
      }
  
      if (data?.draftUrl) {
        draftUrl.value = data.draftUrl;
        draftId.value = data.draftId || "";
        message.value = "Draft générée !";
        
        localStorage.setItem(draftCacheKey, JSON.stringify({
          draftUrl: data.draftUrl,
          draftId: data.draftId || ""
        }));
  
        // The Edge Function already updates the DB, but we can update our local state
        const matchIndex = matches.value.findIndex((m: any) => m.id === currentMatchId.value);
        if (matchIndex !== -1) {
          matches.value[matchIndex].draft_url = data.draftUrl;
          matches.value[matchIndex].draft_id = data.draftId || "";
        }
        
        if (syncInterval) clearInterval(syncInterval);
        syncInterval = setInterval(() => {
          syncDraftPicks();
        }, 4000);
      } else {
        throw new Error("Draft generated, but couldn't parse URL.");
      }
    } catch (err: any) {
      message.value = err.message || "Erreur lors de la génération de la draft";
      console.error(err);
    } finally {
      drafting.value = false;
    }
  };

const copyDraftLink = () => {
  if (draftUrl.value) {
    navigator.clipboard.writeText(draftUrl.value);
    linkCopied.value = true;
    setTimeout(() => { linkCopied.value = false }, 2000);
  }
};

const syncDraftPicks = async () => {
  if (!draftId.value || syncing.value) return;

  syncing.value = true;
  try {
    const { data, error: funcError } = await supabase.functions.invoke("sync-draft", {
      body: {
        draftId: draftId.value,
      },
    });

    logDraftSyncClient(
      "FutureMatches",
      draftId.value,
      data as SyncDraftData | undefined,
      funcError ?? null,
    );
    if (funcError) return;

    const d = data as SyncDraftData | undefined;
    if (d?.success === false) {
      if (d.code === "DRAFTER_PLAN_LIMIT") {
        message.value =
          d.hint ?? "Accès Drafter limité : passer au plan Full API pour les drafts terminées.";
      }
      return;
    }

    const finished =
      d?.status === "FINISHED" ||
      d?.status === "finished" ||
      d?.status === "COMPLETED";

    if (finished) {
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
      message.value = "Draft terminée ! Champions à jour.";
      setTimeout(() => {
        closeModal();
      }, 3000);
    }
  } catch (err: any) {
    console.error("Auto-sync error:", err);
  } finally {
    syncing.value = false;
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