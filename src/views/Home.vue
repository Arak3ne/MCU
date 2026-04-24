<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] font-sans selection:bg-[#22C55E] selection:text-[#0B0F0C]">
    <!-- Background accents -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4ADE80] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#22C55E] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
    </div>

    <!-- Navigation -->
    <Navbar />

    <!-- Main Content -->
    <main class="relative z-10 max-w-5xl mx-auto px-6 py-16">
      <!-- Hero Header -->
      <div class="text-center mb-16 relative">
        <div class="inline-block relative">
          <h1 class="text-5xl md:text-7xl font-title uppercase tracking-wider mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] drop-shadow-2xl">
            Tournament Standings
          </h1>
          <div class="absolute -inset-x-16 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/30 to-transparent -z-10"></div>
        </div>
        <p class="text-[#A1A1AA] font-medium tracking-widest uppercase text-sm mt-2">Live ranking and match statistics</p>
      </div>

      <!-- Ranking Board -->
      <div class="bg-[#0B0F0C]/60 backdrop-blur-sm border border-[#22C55E]/30 p-1 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative before:absolute before:-inset-[1px] before:bg-gradient-to-b before:from-[#22C55E]/50 before:to-[#22C55E]/10 before:-z-10 before:rounded-sm rounded-sm">
        <div class="bg-[#111111] p-6 md:p-10 rounded-sm h-full w-full">
          <!-- Table Header -->
          <div class="grid grid-cols-[auto_1fr_auto] gap-6 mb-6 px-6 py-3 border-b border-[#2A2A2A] text-[#A1A1AA] text-xs font-bold uppercase tracking-widest">
            <div class="w-16 text-center">Rank</div>
            <div>Team Name</div>
            <div class="flex gap-10 md:gap-20 text-center">
              <div class="w-20">Record</div>
              <div class="w-20">Points</div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="teams.length === 0" class="flex flex-col items-center justify-center py-24 opacity-50">
            <div class="w-12 h-12 border-4 border-[#2A2A2A] border-t-[#22C55E] rounded-full animate-spin mb-6"></div>
            <p class="text-[#22C55E] uppercase tracking-widest text-sm font-bold animate-pulse">Loading Rankings...</p>
          </div>

          <!-- Team List -->
          <div class="space-y-4">
            <div
              v-for="(team, index) in teams"
              :key="team.id"
              @click="selectTeam(team)"
              class="group relative grid grid-cols-[auto_1fr_auto] gap-6 items-center px-6 py-5 bg-gradient-to-r from-[#1A1A1A] to-[#111111] border border-[#2A2A2A] hover:border-[#22C55E]/60 transition-all duration-300 rounded-sm overflow-hidden cursor-pointer"
              :class="{
                'from-[#1A1A1A] via-[#22C55E]/10 to-[#111111] border-[#22C55E]/50 shadow-[0_0_20px_rgba(200,170,110,0.15)] scale-[1.02] z-10': index === 0,
                'from-[#1A1A1A] via-[#A1A1AA]/5 to-[#111111] border-[#A1A1AA]/30': index === 1,
                'from-[#1A1A1A] via-[#F59E0B]/5 to-[#111111] border-[#F59E0B]/30': index === 2
              }"
            >
              <!-- Hover effect highlight -->
              <div class="absolute inset-y-0 left-0 w-1 bg-[#22C55E] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <!-- Rank -->
              <div class="w-16 flex justify-center">
                <div class="relative flex items-center justify-center w-12 h-12">
                  <span class="absolute inset-0 rotate-45 border border-[#2A2A2A] group-hover:border-[#22C55E] transition-colors"
                        :class="{ 'border-[#22C55E] bg-[#22C55E]/10': index === 0, 'border-[#A1A1AA] bg-[#A1A1AA]/10': index === 1, 'border-[#F59E0B] bg-[#F59E0B]/10': index === 2 }"></span>
                  <span class="relative z-10 font-title text-xl"
                        :class="{ 'text-[#22C55E] drop-shadow-[0_0_5px_#22C55E]': index === 0, 'text-[#E2E8F0]': index === 1, 'text-[#F59E0B]': index === 2, 'text-[#A1A1AA]': index > 2 }">
                    {{ index + 1 }}
                  </span>
                </div>
              </div>

              <!-- Team Info -->
              <div class="flex items-center gap-6">
                <div class="relative w-14 h-14 flex items-center justify-center bg-[#0B0F0C] border border-[#2A2A2A] group-hover:border-[#22C55E]/50 transition-colors shadow-inner">
                  <span class="font-title text-lg uppercase text-[#F0FDF4] group-hover:text-[#22C55E] transition-colors tracking-wider">{{ team.name.substring(0, 2) }}</span>
                  <div v-if="index === 0" class="absolute -top-3 -right-3 text-2xl drop-shadow-[0_0_5px_rgba(200,170,110,0.8)]">👑</div>
                </div>
                <div>
                  <h3 class="text-2xl font-bold tracking-wide text-[#F0FDF4] group-hover:text-[#22C55E] transition-colors uppercase">
                    {{ team.name }}
                  </h3>
                  <p class="text-xs text-[#A1A1AA] uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" :class="team.wins > 0 ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-gray-600'"></span>
                    {{ team.wins > 0 || team.losses > 0 ? ((team.wins / (team.wins + team.losses)) * 100).toFixed(0) + '% Win Rate' : 'No matches played' }}
                  </p>
                </div>
              </div>

              <!-- Stats -->
              <div class="flex gap-10 md:gap-20 items-center">
                <div class="w-20 flex justify-center items-center gap-3">
                  <span class="text-[#4ADE80] font-bold text-xl">{{ team.wins }}W</span>
                  <span class="text-[#2A2A2A] font-title text-xl">-</span>
                  <span class="text-[#EF4444] font-bold text-xl">{{ team.losses }}L</span>
                </div>
                <div class="w-20 flex justify-center">
                  <span class="font-title text-4xl text-[#22C55E] drop-shadow-[0_0_15px_rgba(200,170,110,0.4)]">{{ team.points }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Team Matches Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="selectedTeam" class="fixed inset-0 flex items-center justify-center z-50 p-4" @click.self="closeMatches">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-[#0B0F0C]/90 backdrop-blur-md -z-10"></div>
        
        <div class="bg-[#111111] border border-[#22C55E]/30 rounded-sm p-1 max-w-2xl w-full shadow-[0_0_50px_rgba(0,0,0,1)] relative before:absolute before:-inset-[1px] before:bg-gradient-to-b before:from-[#22C55E]/50 before:to-[#22C55E]/10 before:-z-10 before:rounded-sm">
          <div class="bg-[#111111] p-8 h-full w-full rounded-sm relative">
            <!-- Close Button -->
            <button @click="closeMatches" class="absolute top-4 right-4 text-[#A1A1AA] hover:text-[#22C55E] transition-colors p-2 z-20" cursor-pointer>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div class="text-center mb-8">
              <h2 class="text-3xl font-title mb-1 text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] tracking-wider uppercase">Next Matches</h2>
              <div class="flex items-center justify-center gap-3">
                <div class="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#22C55E]/50"></div>
                <p class="text-[#22C55E] font-bold tracking-widest uppercase text-sm italic">{{ selectedTeam.name }}</p>
                <div class="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#22C55E]/50"></div>
              </div>
            </div>

            <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div
                v-for="(match, index) in filteredMatches"
                :key="index"
                @click="startDraftForMatch(match)"
                class="group relative bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#22C55E]/50 rounded-sm p-6 flex items-center justify-between transition-all duration-300 cursor-pointer"
              >
                <!-- Blue Side -->
                <div class="flex-1 flex items-center justify-end gap-5">
                  <span class="text-lg md:text-xl font-bold transition-colors uppercase tracking-wide truncate text-right" 
                        :class="match.team1.id === selectedTeam.id ? 'text-[#22C55E]' : 'text-[#F0FDF4]'">
                    {{ match.team1.name }}
                  </span>
                  <div class="w-12 h-12 rounded-sm bg-[#0B0F0C] border flex items-center justify-center shadow-inner transition-colors"
                       :class="match.team1.id === selectedTeam.id ? 'border-[#22C55E]/50' : 'border-[#2A2A2A] group-hover:border-[#22C55E]/30'">
                    <span class="font-title text-sm uppercase tracking-wider transition-colors"
                          :class="match.team1.id === selectedTeam.id ? 'text-[#22C55E]' : 'text-[#A1A1AA]'">
                      {{ match.team1.name.substring(0, 2) }}
                    </span>
                  </div>
                </div>

                <!-- VS -->
                <div class="mx-6 relative flex flex-col items-center justify-center">
                  <div class="text-[10px] text-[#A1A1AA] font-title italic bg-[#0B0F0C] px-3 py-1 rounded-sm border border-[#2A2A2A] group-hover:border-[#22C55E]/40 uppercase tracking-[0.2em] transition-all">
                    VS
                  </div>
                </div>

                <!-- Red Side -->
                <div class="flex-1 flex items-center justify-start gap-5">
                  <div class="w-12 h-12 rounded-sm bg-[#0B0F0C] border flex items-center justify-center shadow-inner transition-colors"
                       :class="match.team2.id === selectedTeam.id ? 'border-[#22C55E]/50' : 'border-[#2A2A2A] group-hover:border-[#22C55E]/30'">
                    <span class="font-title text-sm uppercase tracking-wider transition-colors"
                          :class="match.team2.id === selectedTeam.id ? 'text-[#22C55E]' : 'text-[#A1A1AA]'">
                      {{ match.team2.name.substring(0, 2) }}
                    </span>
                  </div>
                  <span class="text-lg md:text-xl font-bold transition-colors uppercase tracking-wide truncate text-left"
                        :class="match.team2.id === selectedTeam.id ? 'text-[#22C55E]' : 'text-[#F0FDF4]'">
                    {{ match.team2.name }}
                  </span>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="filteredMatches.length === 0" class="py-12 text-center">
                <p class="text-[#A1A1AA] uppercase tracking-[0.2em] text-xs font-bold">No upcoming matches scheduled</p>
              </div>
            </div>

            <!-- Footer Decorative -->
            <div class="mt-8 flex justify-center">
              <div class="w-24 h-px bg-gradient-to-r from-transparent via-[#22C55E]/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal Popup for Draft -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showDraftModal" class="fixed inset-0 flex items-center justify-center z-[60] p-4" @click.self="closeDraftModal">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-[#0B0F0C]/90 backdrop-blur-md -z-10"></div>

        <div class="bg-[#111111] border border-[#22C55E]/30 rounded-sm p-1 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,1)] relative before:absolute before:-inset-[1px] before:bg-gradient-to-b before:from-[#22C55E]/50 before:to-[#22C55E]/10 before:-z-10 before:rounded-sm">
          <div class="bg-[#111111] p-8 h-full w-full rounded-sm relative">
            <!-- Close Button -->
            <button @click="closeDraftModal" class="absolute top-4 right-4 text-[#A1A1AA] hover:text-[#22C55E] transition-colors p-2 z-20" cursor-pointer>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 class="text-3xl font-title mb-2 text-center text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] tracking-wider uppercase">Initialize Draft</h2>
            
            <div class="flex justify-center items-center gap-4 mb-8 text-sm font-bold uppercase tracking-widest">
              <span class="text-[#4ADE80]">{{ blueName }}</span>
              <span class="text-[#A1A1AA] text-xs italic">vs</span>
              <span class="text-[#EF4444]">{{ redName }}</span>
            </div>

            <div v-if="drafting" class="text-center py-10">
              <div class="w-16 h-16 border-4 border-[#2A2A2A] border-t-[#22C55E] rounded-full animate-spin mx-auto mb-6"></div>
              <p class="text-[#22C55E] uppercase tracking-widest text-sm font-bold animate-pulse">{{ message || 'Generating draft...' }}</p>
            </div>

            <div v-else-if="draftUrl" class="space-y-6">
              <p class="text-green-400 text-center font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">Draft Generated!</p>
              
              <div class="flex flex-col gap-4">
                <a
                  :href="draftUrl"
                  target="_blank"
                  class="w-full py-4 bg-gradient-to-r from-[#22C55E] to-[#14532D] hover:from-[#d9b876] hover:to-[#8a6831] text-[#0B0F0C] rounded-sm font-title text-center transition-all shadow-[0_0_15px_rgba(200,170,110,0.3)] uppercase tracking-widest text-sm border border-[#22C55E]"
                >
                  Open Draft Tool
                </a>
                <button
                  @click="copyDraftLink"
                  class="w-full py-4 bg-[#1A1A1A] hover:bg-[#282d33] border border-[#2A2A2A] hover:border-[#22C55E]/50 rounded-sm font-bold transition-all flex items-center justify-center gap-2 text-[#A1A1AA] hover:text-[#F0FDF4] uppercase tracking-widest text-xs"
                 cursor-pointer>
                  <svg v-if="!linkCopied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span :class="linkCopied ? 'text-green-400' : ''">{{ linkCopied ? 'Copied!' : 'Copy Link' }}</span>
                </button>
              </div>
              
              <div v-if="draftId" class="flex items-center justify-center gap-2 mt-6 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
                <span class="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                <p class="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-bold">
                  Auto-syncing picks in background
                </p>
              </div>
            </div>
            
            <div v-else class="text-center py-8">
              <p class="text-red-400 font-bold uppercase tracking-widest text-xs mb-6">{{ message || 'Error generating draft' }}</p>
              <button @click="generateDraft" class="px-8 py-3 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#22C55E]/50 hover:bg-[#282d33] rounded-sm text-[#F0FDF4] font-bold uppercase tracking-widest text-xs transition-all" cursor-pointer>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #0B0F0C;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #2A2A2A;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #22C55E;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { supabase } from "../lib/supabase";
import { subscribeToTable } from "../lib/realtime";
import type { Database } from "../types/supabase";
import Navbar from "../components/Navbar.vue";

type Team = Database["public"]["Tables"]["teams"]["Row"];

interface Match {
  team1: Team;
  team2: Team;
}

const teams = ref<Team[]>([]);
const selectedTeam = ref<Team | null>(null);
let subscription: any = null;

// Draft related state
const showDraftModal = ref(false);
const blueName = ref("");
const redName = ref("");
const apiKey = ref("DRAFTER-59605981-E026-439E-BAFC-3C532CF18FB1");
const drafting = ref(false);
const draftUrl = ref("");
const draftId = ref("");
const syncing = ref(false);
const message = ref("");
const linkCopied = ref(false);
let syncInterval: any = null;

const filteredMatches = computed(() => {
  if (!selectedTeam.value) return [];
  
  const matches = [];
  // Round robin logic like in FutureMatches.vue
  for (let i = 0; i < teams.value.length; i++) {
    for (let j = i + 1; j < teams.value.length; j++) {
      const t1 = teams.value[i];
      const t2 = teams.value[j];
      
      if (t1.id === selectedTeam.value.id || t2.id === selectedTeam.value.id) {
        matches.push({ team1: t1, team2: t2 });
      }
    }
  }
  return matches;
});

const selectTeam = (team: Team) => {
  selectedTeam.value = team;
};

const closeMatches = () => {
  selectedTeam.value = null;
};

const startDraftForMatch = (match: Match) => {
  blueName.value = match.team1.name;
  redName.value = match.team2.name;
  showDraftModal.value = true;
  generateDraft();
};

const closeDraftModal = () => {
  showDraftModal.value = false;
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
    message.value = "Fetching global bans...";

    // Fetch champions that are marked as NOT available
    const { data: champions, error: fetchError } = await supabase
      .from("champions")
      .select("name, image_url")
      .eq("is_available", false);

    if (fetchError) throw fetchError;

    const disabledChampions = champions.map((c) => {
      if (c.image_url) {
        const parts = c.image_url.split('/');
        return parts[parts.length - 1].replace('.png', '');
      }
      // fallback just in case
      return c.name.replace(/[^a-zA-Z0-9]/g, '');
    });
    
    message.value = "Initializing interface...";
    
    const { data, error: funcError } = await supabase.functions.invoke("generate-draft", {
      body: {
        blueName: blueName.value,
        redName: redName.value,
        disabledChampions: disabledChampions,
        apiKey: apiKey.value
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
      message.value = "Draft generated!";
      
      if (syncInterval) clearInterval(syncInterval);
      syncInterval = setInterval(() => {
        syncDraftPicks();
      }, 5000);
    } else {
      throw new Error("Draft generated, but couldn't parse URL.");
    }
  } catch (err: any) {
    message.value = err.message || "Error generating draft";
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
  
  try {
    syncing.value = true;
    
    const { data, error: funcError } = await supabase.functions.invoke("sync-draft", {
      body: {
        draftId: draftId.value,
        apiKey: apiKey.value
      }
    });

    if (funcError) return;

    const picks = data?.picks || [];
    if (picks.length === 0) return;

    const { data: champions, error: fetchError } = await supabase
      .from("champions")
      .select("id, name, image_url")
      .eq("is_available", true);

    if (fetchError) return;

    const championsToDisable = champions.filter((c) => {
      let key = "";
      if (c.image_url) {
        const parts = c.image_url.split('/');
        key = parts[parts.length - 1].replace('.png', '');
      } else {
        key = c.name.replace(/[^a-zA-Z0-9]/g, '');
      }
      return picks.includes(key);
    });

    if (championsToDisable.length === 0) {
      if (picks.length === 10 && syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
      return;
    }

    const idsToDisable = championsToDisable.map(c => c.id);

    const { error: updateError } = await supabase
      .from("champions")
      .update({ is_available: false })
      .in("id", idsToDisable);

    if (updateError) return;

    if (picks.length === 10 && syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  } catch (err: any) {
    console.error("Auto-sync error:", err);
  } finally {
    syncing.value = false;
  }
};

const fetchTeams = async () => {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("points", { ascending: false })
    .order("wins", { ascending: false });

  if (data && !error) {
    teams.value = data;
  }
};

onMounted(() => {
  fetchTeams();
  
  subscription = subscribeToTable("teams", (payload) => {
    // Re-fetch to guarantee correct sort order after any update/insert/delete
    fetchTeams();
  });
});

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe();
  }
  if (syncInterval) {
    clearInterval(syncInterval);
  }
});
</script>