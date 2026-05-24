<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] pb-10">
    <main class="max-w-[1600px] mx-auto px-4 py-6 space-y-6">
      <!-- Header minimaliste -->
      <header class="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
        <div>
          <h1 class="text-3xl font-title uppercase tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Draft Room</h1>
          <p class="text-xs uppercase tracking-[0.25em] text-[#22C55E]">Session {{ state.sessionId }}</p>
        </div>
        <div class="px-4 py-2 bg-[#111111] border border-[#2A2A2A] rounded-md shadow-inner text-sm font-bold uppercase tracking-widest text-[#A1A1AA]">
          Phase: <span class="text-white ml-1">{{ phaseLabel }}</span>
        </div>
      </header>

      <!-- Erreurs et synchronisation -->
      <section v-if="loadError" class="bg-red-500/10 border border-red-500/40 text-red-300 p-4 rounded-md shadow-lg">
        {{ loadError }}
      </section>
      <section
        v-else-if="isAwaitingInitialSync"
        class="bg-[#22C55E]/10 border border-[#22C55E]/40 text-[#D9FBE8] p-4 rounded-md shadow-[0_0_15px_rgba(34,197,94,0.1)] flex items-center gap-3"
      >
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#22C55E]"></div>
        En attente de synchronisation avec la room...
      </section>

      <!-- Grille principale à 3 colonnes -->
      <section v-else class="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[320px_1fr_320px] gap-6 items-start">
        
        <!-- SIDEBAR GAUCHE -->
        <aside class="space-y-4 flex flex-col h-full">
          <div class="bg-[#111111]/80 backdrop-blur-sm border rounded-lg p-5 flex flex-col gap-4 shadow-xl relative overflow-hidden transition-all duration-300"
               :class="currentTurn?.teamId === leftTeam.id ? (leftTeam.colorClass === 'blue' ? 'border-blue-500 ring-1 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-white ring-1 ring-white/50 shadow-[0_0_20px_rgba(255,255,255,0.2)]') : 'border-[#2A2A2A]'">
            <!-- Subtil glow effet équipe -->
            <div v-if="leftTeam.colorClass === 'blue'" class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none -mr-10 -mt-10"></div>
            
            <div class="relative z-10 space-y-1">
              <h2 class="text-2xl font-title tracking-wider drop-shadow-md" :class="leftTeam.colorClass === 'blue' ? 'text-blue-400' : 'text-white'">
                {{ isSideDecided ? leftTeam.name : 'Équipe 1' }}
              </h2>
              <p v-if="isSideDecided" class="text-xs text-[#A1A1AA] uppercase tracking-widest">
                Capitaine: <span class="text-white font-bold">{{ leftTeam.captainName }}</span>
              </p>
              <p v-else class="text-xs text-[#A1A1AA] uppercase tracking-widest">
                Attente de la sélection...
              </p>
            </div>

            <!-- Liste des Picks -->
            <div class="flex-1 space-y-2 mt-4 relative z-10">
              <h3 class="text-[10px] uppercase tracking-widest text-[#71717A] font-bold mb-3">Picks</h3>
              <div class="space-y-3">
                <div v-for="slot in 5" :key="'t1-'+slot" class="h-16 bg-[#0B0F0C] border border-[#2A2A2A] rounded-md relative flex items-center overflow-hidden">
                  <div class="w-8 h-full bg-[#111111] flex items-center justify-center border-r border-[#2A2A2A] text-xs font-bold text-[#71717A]">
                    {{ slot }}
                  </div>
                  <div class="flex-1 px-3 py-1 flex items-center">
                    <template v-if="leftTeam.picks.find(p => p.slot === slot)">
                      <!-- Champion Picked -->
                      <div class="flex items-center gap-3 w-full">
                        <img 
                          v-if="champions.find(c => c.id === leftTeam.picks.find(p => p.slot === slot)?.championId)" 
                          :src="getChampionImage(champions.find(c => c.id === leftTeam.picks.find(p => p.slot === slot)?.championId)!)" 
                          class="w-10 h-10 rounded object-cover shadow-md border"
                          :class="leftTeam.colorClass === 'blue' ? 'border-blue-500/30' : 'border-[#2A2A2A]'"
                        />
                        <span class="text-sm font-bold text-white uppercase tracking-wider drop-shadow-sm">{{ leftTeam.picks.find(p => p.slot === slot)?.championName }}</span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- ZONE CENTRALE -->
        <section class="space-y-6 flex flex-col h-full">
          
          <!-- Header Central (Statut, Timer) -->
          <div class="bg-[#111111]/80 backdrop-blur-sm border border-[#2A2A2A] rounded-lg p-6 shadow-xl text-center space-y-2 relative overflow-hidden">
            <h2 class="text-sm uppercase tracking-[0.2em] text-[#A1A1AA] font-bold">À qui le tour ?</h2>
            
            <div v-if="currentTurnTeamName" class="text-3xl font-title uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                 :class="currentTurn?.teamId === blueTeamId ? 'text-blue-400' : currentTurn?.teamId === redTeamId ? 'text-red-400' : 'text-[#22C55E]'">
              {{ isSideDecided ? currentTurnTeamName : (currentTurn?.teamId === state.team1Id ? 'Équipe 1' : 'Équipe 2') }}
            </div>
            
            <!-- Timers -->
            <div class="pt-2">
              <div v-if="pickRemainingSec > 0" class="inline-flex items-center gap-3 px-6 py-2 bg-[#0B0F0C] border border-[#2A2A2A] rounded-full shadow-inner">
                <span class="w-3 h-3 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_10px_#22C55E]"></span>
                <span class="text-xl font-bold text-[#F0FDF4]">{{ pickRemainingSec }}s</span>
              </div>
              <div v-if="state.phase === 'wait_before_pick_phase_2'" class="inline-flex items-center gap-3 px-6 py-2 bg-[#0B0F0C] border border-[#22C55E]/50 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.1)] text-[#22C55E]">
                <span class="text-sm font-bold uppercase tracking-widest">Reprise dans</span>
                <span class="text-xl font-bold">{{ waitRemainingSec }}s</span>
              </div>
            </div>

            <!-- Ready Button (Lobby) -->
            <div v-if="state.phase === 'lobby' && isCurrentUserCaptain" class="pt-4 flex justify-center">
              <button
                @click="onToggleReady"
                class="px-8 py-3 rounded-md text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-lg"
                :class="isCurrentUserTeamReady
                  ? 'border border-[#22C55E] text-[#22C55E] bg-[#22C55E]/10 hover:bg-[#22C55E]/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                  : 'bg-[#22C55E] text-[#0B0F0C] hover:bg-[#4ADE80] shadow-[0_0_20px_rgba(34,197,94,0.3)]'"
              >
                {{ isCurrentUserTeamReady ? "Annuler mon prêt" : "Je suis prêt !" }}
              </button>
            </div>
            <div v-else-if="state.phase === 'lobby' && !isCurrentUserCaptain" class="pt-2">
              <span class="text-xs text-[#A1A1AA]">En attente que les capitaines soient prêts...</span>
            </div>
          </div>

          <!-- Phases de configuration (Side, First Pick) -->
          <div v-if="isSideFlowPhase" class="bg-[#111111]/80 backdrop-blur-sm border border-[#22C55E]/30 rounded-lg p-6 shadow-[0_0_20px_rgba(34,197,94,0.05)] space-y-6 text-center">
            <h2 class="text-lg font-title uppercase tracking-widest text-[#22C55E]">Configuration Initiale</h2>
            
            <div v-if="state.phase === 'choose_side_team'" class="space-y-5">
              <p class="text-sm text-[#A1A1AA] max-w-md mx-auto">
                Les deux capitaines doivent voter pour l'équipe qui choisira son side.
              </p>
              <div class="flex flex-wrap justify-center gap-4">
                <button
                  :disabled="!isCurrentUserCaptain"
                  @click="onVoteSideTeam(state.team1Id)"
                  class="px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest transition-all shadow-lg min-w-[150px]"
                  :class="state.sideTeamVotes[currentUser?.id ?? ''] === state.team1Id ? 'bg-white text-[#111111] shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-[#111111] border border-[#2A2A2A] text-[#F0FDF4] hover:border-white/50'"
                >
                  {{ state.team1Name }}
                </button>
                <button
                  :disabled="!isCurrentUserCaptain"
                  @click="onVoteSideTeam(state.team2Id)"
                  class="px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest transition-all shadow-lg min-w-[150px]"
                  :class="state.sideTeamVotes[currentUser?.id ?? ''] === state.team2Id ? 'bg-white text-[#111111] shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-[#111111] border border-[#2A2A2A] text-[#F0FDF4] hover:border-white/50'"
                >
                  {{ state.team2Name }}
                </button>
              </div>
              <div class="bg-[#0B0F0C] border border-[#2A2A2A] rounded-md p-3 text-xs text-[#A1A1AA] flex justify-center gap-6">
                <span><strong class="text-white">{{ captainTeam1Name }}</strong> : {{ votedTeamName(state.captainTeam1PlayerId) }}</span>
                <span><strong class="text-white">{{ captainTeam2Name }}</strong> : {{ votedTeamName(state.captainTeam2PlayerId) }}</span>
              </div>
            </div>

            <div v-else-if="state.phase === 'choose_side_color'" class="space-y-5">
              <p class="text-sm text-white max-w-md mx-auto">
                <strong class="text-[#22C55E] text-base">{{ sideChooserCaptainName }}</strong>, choisissez votre side.
              </p>
              <div class="flex justify-center gap-4">
                <button
                  :disabled="!isCurrentUserSideChooserCaptain"
                  @click="onChooseSide('blue')"
                  class="px-6 py-3 border border-blue-500/50 rounded-md text-sm font-bold uppercase tracking-widest text-blue-400 hover:bg-blue-500/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all shadow-lg"
                >
                  Side Bleu
                </button>
                <button
                  :disabled="!isCurrentUserSideChooserCaptain"
                  @click="onChooseSide('red')"
                  class="px-6 py-3 border border-red-500/50 rounded-md text-sm font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all shadow-lg"
                >
                  Side Rouge
                </button>
              </div>
            </div>

            <div v-else-if="state.phase === 'choose_first_pick'" class="space-y-5">
              <p class="text-sm text-white max-w-md mx-auto">
                <strong class="text-[#22C55E] text-base">{{ secondCaptainName }}</strong>, souhaitez-vous le First Pick ?
              </p>
              <div class="flex justify-center gap-4">
                <button
                  :disabled="!isCurrentUserSecondCaptain"
                  @click="onSecondCaptainFirstPick(true)"
                  class="px-6 py-3 border border-[#22C55E]/50 bg-[#22C55E]/5 rounded-md text-sm font-bold uppercase tracking-widest text-[#22C55E] hover:bg-[#22C55E]/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all shadow-lg"
                >
                  Prendre First Pick
                </button>
                <button
                  :disabled="!isCurrentUserSecondCaptain"
                  @click="onSecondCaptainFirstPick(false)"
                  class="px-6 py-3 border border-[#2A2A2A] bg-[#111111] rounded-md text-sm font-bold uppercase tracking-widest text-[#A1A1AA] hover:text-white hover:border-[#A1A1AA] transition-all shadow-lg"
                >
                  Laisser First Pick
                </button>
              </div>
            </div>
          </div>

          <!-- Phase de Draft (Grille Champions) -->
          <div v-if="!isSideFlowPhase" class="bg-[#111111]/80 backdrop-blur-sm border border-[#2A2A2A] rounded-lg p-5 shadow-xl flex-1 flex flex-col space-y-4">
            <!-- Filtres et validation -->
            <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
              <div class="flex items-center gap-3 w-full sm:w-auto">
                <div class="relative w-full sm:w-56">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A1A1AA]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Rechercher..."
                    class="w-full bg-[#0B0F0C] border border-[#2A2A2A] focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/50 outline-none pl-9 pr-3 py-2 rounded-md text-sm transition-all"
                  />
                </div>
                
                <select v-model="selectedRole" class="bg-[#0B0F0C] border border-[#2A2A2A] focus:border-[#22C55E] outline-none px-3 py-2 rounded-md text-sm appearance-none cursor-pointer">
                  <option value="">Tous les rôles</option>
                  <option value="top">Top</option>
                  <option value="jungle">Jungle</option>
                  <option value="mid">Mid</option>
                  <option value="adc">ADC</option>
                  <option value="support">Support</option>
                </select>
              </div>

              <div class="flex items-center gap-3">
                <div v-if="selectedChampionName" class="hidden sm:block text-sm">
                  <span class="text-[#A1A1AA]">Sélection:</span>
                  <span class="text-white font-bold ml-1 uppercase tracking-wider drop-shadow-sm">{{ selectedChampionName }}</span>
                </div>
                
                <button
                  @click="onConfirmChampion"
                  :disabled="!canConfirmSelectedChampion"
                  class="px-5 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all shadow-md"
                  :class="canConfirmSelectedChampion
                    ? 'bg-[#22C55E] text-[#0B0F0C] hover:bg-[#4ADE80] shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                    : 'bg-[#0B0F0C] border border-[#2A2A2A] text-[#71717A] cursor-not-allowed'"
                >
                  Valider
                </button>
              </div>
            </div>
            
            <p v-if="actionError" class="text-xs text-red-400 text-center font-bold">{{ actionError }}</p>

            <!-- Grille -->
            <div class="overflow-y-auto max-h-[500px] pr-2 custom-scrollbar flex-1">
              <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3">
                <button
                  v-for="champ in filteredChampions"
                  :key="champ.id"
                  :disabled="isChampionDisabled(champ.id, champ.is_available)"
                  @click="onChampionClick(champ.id, champ.name)"
                  class="relative overflow-hidden rounded-md border transition-all duration-200 group aspect-square bg-[#0B0F0C]"
                  :class="championClass(champ.id, champ.is_available, selectedChampionId === champ.id)"
                >
                  <img
                    :src="getChampionImage(champ)"
                    :alt="champ.name"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <!-- Overlay gradient -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  
                  <div class="absolute inset-x-0 bottom-0 p-1.5 text-center">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-white drop-shadow-md truncate block">
                      {{ champ.name }}
                    </span>
                  </div>
                  
                  <!-- Overlay de sélection -->
                  <div v-if="selectedChampionId === champ.id" class="absolute inset-0 border-2 border-[#22C55E] shadow-[inset_0_0_15px_rgba(34,197,94,0.5)]"></div>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- SIDEBAR DROITE -->
        <aside class="space-y-4 flex flex-col h-full">
          <div class="bg-[#111111]/80 backdrop-blur-sm border rounded-lg p-5 flex flex-col gap-4 shadow-xl relative overflow-hidden transition-all duration-300"
               :class="currentTurn?.teamId === rightTeam.id ? (rightTeam.colorClass === 'red' ? 'border-red-500 ring-1 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white ring-1 ring-white/50 shadow-[0_0_20px_rgba(255,255,255,0.2)]') : 'border-[#2A2A2A]'">
            <!-- Subtil glow effet équipe -->
            <div v-if="rightTeam.colorClass === 'red'" class="absolute top-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none -ml-10 -mt-10"></div>
            
            <div class="relative z-10 space-y-1 text-right">
              <h2 class="text-2xl font-title tracking-wider drop-shadow-md" :class="rightTeam.colorClass === 'red' ? 'text-red-400' : 'text-white'">
                {{ isSideDecided ? rightTeam.name : 'Équipe 2' }}
              </h2>
              <p v-if="isSideDecided" class="text-xs text-[#A1A1AA] uppercase tracking-widest">
                Capitaine: <span class="text-white font-bold">{{ rightTeam.captainName }}</span>
              </p>
              <p v-else class="text-xs text-[#A1A1AA] uppercase tracking-widest">
                Attente de la sélection...
              </p>
            </div>

            <!-- Liste des Picks -->
            <div class="flex-1 space-y-2 mt-4 relative z-10">
              <h3 class="text-[10px] uppercase tracking-widest text-[#71717A] font-bold mb-3 text-right">Picks</h3>
              <div class="space-y-3">
                <div v-for="slot in 5" :key="'t2-'+slot" class="h-16 bg-[#0B0F0C] border border-[#2A2A2A] rounded-md relative flex items-center overflow-hidden flex-row-reverse">
                  <div class="w-8 h-full bg-[#111111] flex items-center justify-center border-l border-[#2A2A2A] text-xs font-bold text-[#71717A]">
                    {{ slot }}
                  </div>
                  <div class="flex-1 px-3 py-1 flex items-center justify-end">
                    <template v-if="rightTeam.picks.find(p => p.slot === slot)">
                      <!-- Champion Picked -->
                      <div class="flex items-center gap-3 w-full flex-row-reverse">
                        <img 
                          v-if="champions.find(c => c.id === rightTeam.picks.find(p => p.slot === slot)?.championId)" 
                          :src="getChampionImage(champions.find(c => c.id === rightTeam.picks.find(p => p.slot === slot)?.championId)!)" 
                          class="w-10 h-10 rounded object-cover shadow-md border transform scale-x-[-1]"
                          :class="rightTeam.colorClass === 'red' ? 'border-red-500/30' : 'border-[#2A2A2A]'"
                        />
                        <span class="text-sm font-bold text-white uppercase tracking-wider drop-shadow-sm text-right">{{ rightTeam.picks.find(p => p.slot === slot)?.championName }}</span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { getChampions, getPlayers } from "../lib/queries";
import {
  createInitialDraftState,
  enterWaitPhase,
  getCurrentTurn,
  lockChampionPick,
  maybeAutoSkipTurn,
  maybeExitWaitPhase,
  setSecondCaptainFirstPickDecision,
  setSideColor,
  setSideTeamVote,
  toggleReady,
} from "../lib/draftEngine";
import { useRealtimeDraftSession } from "../composables/useRealtimeDraftSession";
import type { DraftSessionState } from "../types/draft";
import type { Database } from "../types/supabase";

type Champion = Database["public"]["Tables"]["champions"]["Row"];
type Player = Database["public"]["Tables"]["players"]["Row"];

const route = useRoute();
const loadError = ref("");
const actionError = ref("");
const champions = ref<Champion[]>([]);
const players = ref<Player[]>([]);
const searchQuery = ref("");
const selectedRole = ref("");
const selectedChampionId = ref<string | null>(null);
const selectedChampionName = ref<string | null>(null);
const nowMs = ref(Date.now());
let timerInterval: ReturnType<typeof setInterval> | null = null;

const userRaw = localStorage.getItem("mcu_user");
const currentUser = userRaw ? (JSON.parse(userRaw) as { id: string; pseudo: string; team_id: string | null }) : null;

const sessionId = route.params.sessionId as string;
const readSessionMeta = () => {
  try {
    const raw = localStorage.getItem(`draft_room_meta_${sessionId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed;
  } catch {
    return null;
  }
};
const sessionMeta = readSessionMeta();
const hasSessionMeta = !!sessionMeta;
const team1Id = sessionMeta?.t1 ?? "";
const team2Id = sessionMeta?.t2 ?? "";
const team1Name = sessionMeta?.t1n ?? "Équipe 1";
const team2Name = sessionMeta?.t2n ?? "Équipe 2";
const sideChooserTeamId = sessionMeta?.sc ?? team1Id;
const firstPickTeamId = sessionMeta?.fp ?? team1Id;
const captainTeam1PlayerId = sessionMeta?.c1 ?? "";
const captainTeam2PlayerId = sessionMeta?.c2 ?? "";
const draftStateStorageKey = `draft_room_state_${sessionId}`;

if (!sessionId) {
  loadError.value = "URL de draft invalide.";
}

const baseInitialState: DraftSessionState = createInitialDraftState({
  sessionId,
  createdByPlayerId: currentUser?.id ?? "anonymous",
  team1Id,
  team2Id,
  team1Name,
  team2Name,
  sideChooserTeamId: sideChooserTeamId || team1Id,
  firstPickTeamId,
  captainTeam1PlayerId,
  captainTeam2PlayerId,
});

const hydrateStateFromStorage = (base: DraftSessionState): DraftSessionState => {
  try {
    const raw = localStorage.getItem(draftStateStorageKey);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as DraftSessionState;
    if (!parsed || parsed.sessionId !== base.sessionId) return base;
    if (parsed.team1Id !== base.team1Id || parsed.team2Id !== base.team2Id) return base;
    if (!Array.isArray(parsed.turnOrder) || !Array.isArray(parsed.picks)) return base;
    return {
      ...parsed,
      selectedSide: parsed.selectedSide ?? null,
      sideTeamVotes: parsed.sideTeamVotes ?? {},
      pickTurnStartedAt: parsed.pickTurnStartedAt ?? null,
      pickTurnDurationSec: parsed.pickTurnDurationSec ?? 30,
      hasCompletedMidDraftPause: parsed.hasCompletedMidDraftPause ?? false,
    };
  } catch {
    return base;
  }
};

const initialState = hydrateStateFromStorage(baseInitialState);

const { state, init, dispose, broadcastState } = useRealtimeDraftSession(initialState, currentUser);
const isAwaitingInitialSync = computed(() => {
  if (hasSessionMeta) return false;
  return (
    !state.value.team1Id ||
    !state.value.team2Id ||
    !state.value.captainTeam1PlayerId ||
    !state.value.captainTeam2PlayerId
  );
});
const isSideFlowPhase = computed(() =>
  ["choose_side_team", "choose_side_color", "choose_first_pick"].includes(state.value.phase),
);

const isSideDecided = computed(() => {
  return state.value.phase !== "lobby" && 
         state.value.phase !== "choose_side_team" && 
         state.value.phase !== "choose_side_color";
});

const blueTeamId = computed(() => {
  if (!isSideDecided.value) return state.value.team1Id;
  if (state.value.sideChooserTeamId === state.value.team1Id) {
    return state.value.selectedSide === 'blue' ? state.value.team1Id : state.value.team2Id;
  } else {
    return state.value.selectedSide === 'blue' ? state.value.team2Id : state.value.team1Id;
  }
});

const redTeamId = computed(() => {
  return blueTeamId.value === state.value.team1Id ? state.value.team2Id : state.value.team1Id;
});

const leftTeam = computed(() => {
  const tId = blueTeamId.value;
  const isTeam1 = tId === state.value.team1Id;
  return {
    id: tId,
    name: isTeam1 ? state.value.team1Name : state.value.team2Name,
    captainName: isTeam1 ? captainTeam1Name.value : captainTeam2Name.value,
    picks: isTeam1 ? team1Picks.value : team2Picks.value,
    colorClass: isSideDecided.value ? 'blue' : 'neutral'
  };
});

const rightTeam = computed(() => {
  const tId = redTeamId.value;
  const isTeam1 = tId === state.value.team1Id;
  return {
    id: tId,
    name: isTeam1 ? state.value.team1Name : state.value.team2Name,
    captainName: isTeam1 ? captainTeam1Name.value : captainTeam2Name.value,
    picks: isTeam1 ? team1Picks.value : team2Picks.value,
    colorClass: isSideDecided.value ? 'red' : 'neutral'
  };
});

const roleAliases: Record<string, string> = {
  top: "top",
  toplane: "top",
  jungle: "jungle",
  jgl: "jungle",
  mid: "mid",
  middle: "mid",
  adc: "adc",
  bot: "adc",
  support: "support",
  supp: "support",
};

const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase());
const pickedChampionIds = computed(() => new Set(state.value.picks.map((p) => p.championId)));
const currentTurn = computed(() => getCurrentTurn(state.value));
const currentTurnTeamName = computed(() => {
  if (!currentTurn.value) return state.value.phase === "completed" ? "Draft terminée" : "En attente";
  return currentTurn.value.teamId === state.value.team1Id ? state.value.team1Name : state.value.team2Name;
});

const isCurrentUserCaptain = computed(() => {
  if (!currentUser?.id) return false;
  return (
    currentUser.id === state.value.captainTeam1PlayerId ||
    currentUser.id === state.value.captainTeam2PlayerId
  );
});

const currentUserCaptainTeamId = computed<string | null>(() => {
  if (!currentUser?.id) return null;
  if (currentUser.id === state.value.captainTeam1PlayerId) return state.value.team1Id;
  if (currentUser.id === state.value.captainTeam2PlayerId) return state.value.team2Id;
  return null;
});
const sideChooserCaptainId = computed(() =>
  state.value.sideChooserTeamId === state.value.team1Id
    ? state.value.captainTeam1PlayerId
    : state.value.captainTeam2PlayerId,
);
const secondCaptainId = computed(() =>
  state.value.sideChooserTeamId === state.value.team1Id
    ? state.value.captainTeam2PlayerId
    : state.value.captainTeam1PlayerId,
);
const isCurrentUserSideChooserCaptain = computed(
  () => !!currentUser?.id && currentUser.id === sideChooserCaptainId.value,
);
const isCurrentUserSecondCaptain = computed(
  () => !!currentUser?.id && currentUser.id === secondCaptainId.value,
);

const isCurrentUserTeamReady = computed(() => {
  if (!currentUserCaptainTeamId.value) return false;
  return state.value.readyTeamIds.includes(currentUserCaptainTeamId.value);
});

const canCurrentUserPick = computed(() => {
  if (!isCurrentUserCaptain.value || !currentUserCaptainTeamId.value || !currentTurn.value) return false;
  const inPickPhase = state.value.phase === "pick_phase_1" || state.value.phase === "pick_phase_2";
  return inPickPhase && currentTurn.value.teamId === currentUserCaptainTeamId.value;
});
const canConfirmSelectedChampion = computed(() => {
  if (!selectedChampionId.value || !canCurrentUserPick.value) return false;
  const champ = champions.value.find((c) => c.id === selectedChampionId.value);
  if (!champ) return false;
  return !isChampionDisabled(champ.id, champ.is_available);
});

const team1Picks = computed(() => state.value.picks.filter((p) => p.teamId === state.value.team1Id));
const team2Picks = computed(() => state.value.picks.filter((p) => p.teamId === state.value.team2Id));

const waitRemainingSec = computed(() => {
  if (state.value.phase !== "wait_before_pick_phase_2" || !state.value.waitPhaseStartedAt) return 0;
  const elapsed = Math.floor((nowMs.value - state.value.waitPhaseStartedAt) / 1000);
  return Math.max(0, state.value.waitPhaseDurationSec - elapsed);
});
const pickRemainingSec = computed(() => {
  const inPickPhase = state.value.phase === "pick_phase_1" || state.value.phase === "pick_phase_2";
  if (!inPickPhase || !state.value.pickTurnStartedAt) return 0;
  const elapsed = Math.floor((nowMs.value - state.value.pickTurnStartedAt) / 1000);
  return Math.max(0, state.value.pickTurnDurationSec - elapsed);
});

const phaseLabel = computed(() => {
  switch (state.value.phase) {
    case "lobby":
      return "Lobby (attente prêt)";
    case "choose_side_team":
      return "Choix equipe side";
    case "choose_side_color":
      return "Choix side";
    case "choose_first_pick":
      return "Choix first pick";
    case "pick_phase_1":
      return "Pick phase 1";
    case "wait_before_pick_phase_2":
      return "Pause 45s";
    case "pick_phase_2":
      return "Pick phase 2";
    case "completed":
      return "Terminée";
    default:
      return state.value.phase;
  }
});

const captainTeam1Name = computed(() => {
  const p = players.value.find((pl) => pl.id === state.value.captainTeam1PlayerId);
  return p?.pseudo ?? "Inconnu";
});
const captainTeam2Name = computed(() => {
  const p = players.value.find((pl) => pl.id === state.value.captainTeam2PlayerId);
  return p?.pseudo ?? "Inconnu";
});
const sideChooserCaptainName = computed(() => {
  const p = players.value.find((pl) => pl.id === sideChooserCaptainId.value);
  return p?.pseudo ?? "Capitaine";
});
const secondCaptainName = computed(() => {
  const p = players.value.find((pl) => pl.id === secondCaptainId.value);
  return p?.pseudo ?? "Capitaine";
});

const filteredChampions = computed(() => {
  return champions.value.filter((champ) => {
    if (normalizedSearch.value && !champ.name.toLowerCase().includes(normalizedSearch.value)) return false;
    if (!selectedRole.value) return true;
    const roles = (champ.roles ?? []).map((r) => roleAliases[String(r).toLowerCase()] ?? String(r).toLowerCase());
    return roles.includes(selectedRole.value);
  });
});

const isChampionDisabled = (championId: string, isAvailable: boolean | null) => {
  if (!isAvailable) return true;
  if (pickedChampionIds.value.has(championId)) return true;
  return false;
};

const championClass = (championId: string, isAvailable: boolean | null, isSelected: boolean) => {
  const disabled = isChampionDisabled(championId, isAvailable);
  if (disabled) {
    return "border-[#3F3F46] opacity-40 grayscale cursor-not-allowed";
  }
  if (isSelected) {
    return "border-[#22C55E] ring-1 ring-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.4)]";
  }
  if (canCurrentUserPick.value) {
    return "border-[#2A2A2A] hover:border-[#22C55E] hover:-translate-y-1";
  }
  return "border-[#2A2A2A] opacity-70 cursor-not-allowed";
};

const onToggleReady = async () => {
  actionError.value = "";
  if (!currentUserCaptainTeamId.value || !isCurrentUserCaptain.value || state.value.phase !== "lobby") return;
  const next = toggleReady(state.value, currentUserCaptainTeamId.value);
  await broadcastState(next);
};

const votedTeamName = (captainId: string) => {
  const teamId = state.value.sideTeamVotes[captainId];
  if (!teamId) return "En attente";
  return teamId === state.value.team1Id ? state.value.team1Name : state.value.team2Name;
};

const onVoteSideTeam = async (teamId: string) => {
  if (!currentUser?.id || !isCurrentUserCaptain.value) return;
  const next = setSideTeamVote(state.value, currentUser.id, teamId);
  if (next.version !== state.value.version) {
    await broadcastState(next);
  }
};

const onChooseSide = async (side: "blue" | "red") => {
  if (!currentUser?.id) return;
  const next = setSideColor(state.value, currentUser.id, side);
  if (next.version !== state.value.version) {
    await broadcastState(next);
  }
};

const onSecondCaptainFirstPick = async (wantsFirstPick: boolean) => {
  if (!currentUser?.id) return;
  const next = setSecondCaptainFirstPickDecision(state.value, currentUser.id, wantsFirstPick);
  if (next.version !== state.value.version) {
    await broadcastState(next);
  }
};

const onChampionClick = async (championId: string, championName: string) => {
  actionError.value = "";
  if (!canCurrentUserPick.value) {
    return;
  }
  const champ = champions.value.find((c) => c.id === championId);
  if (!champ || isChampionDisabled(championId, champ.is_available)) return;
  selectedChampionId.value = championId;
  selectedChampionName.value = championName;
};

const onConfirmChampion = async () => {
  actionError.value = "";
  if (!selectedChampionId.value || !selectedChampionName.value) return;
  if (!canCurrentUserPick.value || !currentUserCaptainTeamId.value || !currentUser?.id) {
    return;
  }

  const champ = champions.value.find((c) => c.id === selectedChampionId.value);
  if (!champ || isChampionDisabled(selectedChampionId.value, champ.is_available)) {
    actionError.value = "Ce champion n'est plus disponible.";
    selectedChampionId.value = null;
    selectedChampionName.value = null;
    return;
  }
  const current = state.value;
  const withPick = lockChampionPick(current, {
    championId: selectedChampionId.value,
    championName: selectedChampionName.value,
    teamId: currentUserCaptainTeamId.value,
    lockedByPlayerId: currentUser.id,
  });

  if (withPick.version === current.version) return;
  const withWait = enterWaitPhase(withPick);
  selectedChampionId.value = null;
  selectedChampionName.value = null;
  await broadcastState(withWait);
};

const normalizeChampionAssetId = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");

const getChampionImage = (champ: Champion) => {
  if (champ.image_url) return champ.image_url;
  const key = (champ as any).ddragon_key as string | undefined;
  const assetId = normalizeChampionAssetId(key || champ.name);
  return `https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion/${assetId}.png`;
};

const loadData = async () => {
  const [championRes, playerRes] = await Promise.all([getChampions(), getPlayers()]);

  if (championRes.data) {
    champions.value = championRes.data;
  }
  if (playerRes.data) {
    players.value = playerRes.data;
  }
};

onMounted(() => {
  if (loadError.value) return;
  void init();
  void loadData();
  timerInterval = setInterval(() => {
    nowMs.value = Date.now();
    if (!currentUser?.id) return;
    const isDriver =
      currentUser.id === state.value.captainTeam1PlayerId || currentUser.id === state.value.captainTeam2PlayerId;
    if (!isDriver) return;
    const afterWait = maybeExitWaitPhase(state.value, nowMs.value);
    if (afterWait.version !== state.value.version) {
      void broadcastState(afterWait);
      return;
    }
    const afterTimeout = maybeAutoSkipTurn(state.value, nowMs.value);
    if (afterTimeout.version !== state.value.version) {
      const withWait = enterWaitPhase(afterTimeout);
      void broadcastState(withWait);
    }
  }, 1000);
});

watch(
  () => state.value.version,
  () => {
    try {
      localStorage.setItem(draftStateStorageKey, JSON.stringify(state.value));
    } catch {
      // Ignore storage write errors
    }
    if (!selectedChampionId.value) return;
    const champ = champions.value.find((c) => c.id === selectedChampionId.value);
    if (!champ || isChampionDisabled(selectedChampionId.value, champ.is_available)) {
      selectedChampionId.value = null;
      selectedChampionName.value = null;
    }
  },
);

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  void dispose();
});
</script>
