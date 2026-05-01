<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] font-sans selection:bg-[#22C55E] selection:text-[#0B0F0C] overflow-x-hidden">
    <!-- Background accents -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4ADE80] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#22C55E] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
    </div>

    <!-- Main Content -->
    <main class="relative z-10 w-full px-6 py-12">
      <!-- Header -->
      <div class="text-center mb-16 relative">
        <div class="inline-block relative">
          <h1 class="text-5xl md:text-7xl font-title uppercase tracking-wider mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] drop-shadow-2xl">
            Playoffs
          </h1>
          <div class="absolute -inset-x-16 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/30 to-transparent -z-10"></div>
        </div>
        <p class="text-[#A1A1AA] font-medium tracking-widest uppercase text-sm mt-2">Phase de Groupes & Arbre Final</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 opacity-50">
        <div class="w-12 h-12 border-4 border-[#2A2A2A] border-t-[#22C55E] rounded-full animate-spin mb-6"></div>
        <p class="text-[#22C55E] uppercase tracking-widest text-sm font-bold animate-pulse">Chargement...</p>
      </div>

      <div v-else-if="matches.length === 0" class="text-center py-20">
        <p class="text-[#A1A1AA] uppercase tracking-widest text-sm font-bold mb-4">Aucun match de playoff actif</p>
      </div>

      <div v-else class="w-full overflow-x-auto custom-scrollbar pb-12">
        <div class="min-w-max mx-auto flex flex-col gap-24 px-8">
          
          <!-- GROUP STAGE -->
          <div v-if="groupARounds.length > 0 || groupBRounds.length > 0" class="w-full max-w-6xl mx-auto">
            <h3 class="text-3xl font-title mb-12 text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#A1A1AA] uppercase tracking-widest text-center">Group Stage</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
              <!-- Group A -->
              <div v-if="groupARounds.length > 0" class="bg-[#111111]/80 backdrop-blur border border-[#2A2A2A] rounded-sm p-6 shadow-xl relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-[#4ADE80] opacity-[0.05] blur-[50px] pointer-events-none"></div>
                <h4 class="text-2xl font-title text-[#4ADE80] mb-8 text-center uppercase tracking-widest">Group A</h4>
                
                <div class="flex flex-col gap-6">
                  <div v-for="(round, rIndex) in groupARounds" :key="'ga'+rIndex" class="flex flex-col gap-4">
                    <div v-for="match in round.matches" :key="match.id" class="match-node relative z-10 w-full flex flex-col justify-center">
                      <div @click="startDraftForMatch(match)" 
                           class="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm flex flex-col transition-all group cursor-pointer"
                           :class="[match.is_completed ? 'border-[#22C55E]/30 cursor-default pointer-events-none' : 'hover:border-[#4ADE80]/50']">
                        
                        <div class="flex items-center justify-between p-3 border-b border-[#2A2A2A] bg-[#111111]/50 group-hover:bg-[#111111]"
                             :class="getWinnerStatusClass(match, 1, 'A')">
                          <span class="font-bold truncate text-sm" :class="match.team1 ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] italic'">{{ match.team1?.name || 'TBD' }}</span>
                          <span class="font-title text-lg ml-3" :class="getWinnerScoreClass(match, 1, 'A')">{{ match.team1_score }}</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-[#111111]/50 group-hover:bg-[#111111]"
                             :class="getWinnerStatusClass(match, 2, 'A')">
                          <span class="font-bold truncate text-sm" :class="match.team2 ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] italic'">{{ match.team2?.name || 'TBD' }}</span>
                          <span class="font-title text-lg ml-3" :class="getWinnerScoreClass(match, 2, 'A')">{{ match.team2_score }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Group B -->
              <div v-if="groupBRounds.length > 0" class="bg-[#111111]/80 backdrop-blur border border-[#2A2A2A] rounded-sm p-6 shadow-xl relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6] opacity-[0.05] blur-[50px] pointer-events-none"></div>
                <h4 class="text-2xl font-title text-[#3B82F6] mb-8 text-center uppercase tracking-widest">Group B</h4>
                
                <div class="flex flex-col gap-6">
                  <div v-for="(round, rIndex) in groupBRounds" :key="'gb'+rIndex" class="flex flex-col gap-4">
                    <div v-for="match in round.matches" :key="match.id" class="match-node relative z-10 w-full flex flex-col justify-center">
                      <div @click="startDraftForMatch(match)" 
                           class="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm flex flex-col transition-all group cursor-pointer"
                           :class="[match.is_completed ? 'border-[#3B82F6]/30 cursor-default pointer-events-none' : 'hover:border-[#3B82F6]/50']">
                        
                        <div class="flex items-center justify-between p-3 border-b border-[#2A2A2A] bg-[#111111]/50 group-hover:bg-[#111111]"
                             :class="getWinnerStatusClass(match, 1, 'B')">
                          <span class="font-bold truncate text-sm" :class="match.team1 ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] italic'">{{ match.team1?.name || 'TBD' }}</span>
                          <span class="font-title text-lg ml-3" :class="getWinnerScoreClass(match, 1, 'B')">{{ match.team1_score }}</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-[#111111]/50 group-hover:bg-[#111111]"
                             :class="getWinnerStatusClass(match, 2, 'B')">
                          <span class="font-bold truncate text-sm" :class="match.team2 ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] italic'">{{ match.team2?.name || 'TBD' }}</span>
                          <span class="font-title text-lg ml-3" :class="getWinnerScoreClass(match, 2, 'B')">{{ match.team2_score }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- KNOCKOUT STAGE -->
          <div v-if="knockoutRounds.length > 0" class="bracket-section relative mt-12">
            <h3 class="text-3xl font-title mb-12 text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#A1A1AA] uppercase tracking-widest text-center">Knockout Stage</h3>
            
            <div class="flex justify-center gap-24 relative">
              <div v-for="(round, rIndex) in knockoutRounds" :key="'ko'+rIndex" class="flex flex-col justify-around min-w-[300px]">
                <!-- Round Header -->
                <div class="text-center mb-8 text-[#A1A1AA] text-xs font-bold uppercase tracking-[0.2em]">
                  {{ round.number === 1 ? 'Semi-Finals' : round.number === 2 ? 'Final (BO3)' : `Round ${round.number}` }}
                </div>
                
                <div class="flex flex-col justify-around flex-1 relative gap-16">
                  <div v-for="match in round.matches" :key="match.id" class="match-node relative z-10 w-full flex flex-col justify-center" :class="{'scale-110 origin-center': round.number === 2}">
                    
                    <div @click="startDraftForMatch(match)" 
                         class="bg-[#111111] border border-[#2A2A2A] rounded-sm flex flex-col shadow-xl transition-all group cursor-pointer"
                         :class="[
                           match.is_completed 
                             ? 'border-[#22C55E]/50 shadow-[0_0_15px_rgba(34,197,94,0.15)] cursor-default pointer-events-none' 
                             : 'hover:border-[#22C55E]/50',
                           round.number === 2 ? 'border-2 border-[#22C55E] shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]' : ''
                         ]">
                      
                      <!-- Top Team -->
                      <div class="flex items-center justify-between p-4 border-b border-[#1A1A1A] bg-[#1A1A1A]/50 group-hover:bg-[#1A1A1A]"
                           :class="getWinnerStatusClass(match, 1)">
                        <span class="font-bold truncate" :class="[match.team1 ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] italic', round.number === 2 ? 'text-base uppercase tracking-wider' : 'text-sm']">
                          {{ match.team1?.name || 'TBD' }}
                        </span>
                        <span class="font-title ml-4" :class="[getWinnerScoreClass(match, 1), round.number === 2 ? 'text-2xl' : 'text-lg']">
                          {{ match.team1_score }}
                        </span>
                      </div>
                      
                      <!-- Bottom Team -->
                      <div class="flex items-center justify-between p-4 bg-[#1A1A1A]/50 group-hover:bg-[#1A1A1A]"
                           :class="getWinnerStatusClass(match, 2)">
                        <span class="font-bold truncate" :class="[match.team2 ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] italic', round.number === 2 ? 'text-base uppercase tracking-wider' : 'text-sm']">
                          {{ match.team2?.name || 'TBD' }}
                        </span>
                        <span class="font-title ml-4" :class="[getWinnerScoreClass(match, 2), round.number === 2 ? 'text-2xl' : 'text-lg']">
                          {{ match.team2_score }}
                        </span>
                      </div>

                      <!-- Crown for winner of the Final -->
                      <div v-if="match.is_completed && round.number === 2" class="absolute -top-4 -right-4 text-4xl drop-shadow-[0_0_10px_rgba(34,197,94,1)] z-20 rotate-12">
                        👑
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>

    <!-- Modal Popup for Draft (Same as before) -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showDraftModal" class="fixed inset-0 flex items-center justify-center z-[60] p-4" @click.self="closeDraftModal">
        <div class="absolute inset-0 bg-[#0B0F0C]/90 backdrop-blur-md -z-10"></div>

        <div class="bg-[#111111] border border-[#22C55E]/30 rounded-sm p-1 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,1)] relative before:absolute before:-inset-[1px] before:bg-gradient-to-b before:from-[#22C55E]/50 before:to-[#22C55E]/10 before:-z-10 before:rounded-sm">
          <div class="bg-[#111111] p-8 h-full w-full rounded-sm relative">
            <button @click="closeDraftModal" class="absolute top-4 right-4 text-[#A1A1AA] hover:text-[#22C55E] transition-colors p-2 z-20" cursor-pointer>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 class="text-3xl font-title mb-2 text-center text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] tracking-wider uppercase">Initialiser la Draft</h2>
            
            <div class="flex justify-center items-center gap-4 mb-8 text-sm font-bold uppercase tracking-widest">
              <span class="text-[#4ADE80]">{{ blueName }}</span>
              <span class="text-[#A1A1AA] text-xs italic">vs</span>
              <span class="text-[#EF4444]">{{ redName }}</span>
            </div>

            <div v-if="drafting" class="text-center py-10">
              <div class="w-16 h-16 border-4 border-[#2A2A2A] border-t-[#22C55E] rounded-full animate-spin mx-auto mb-6"></div>
              <p class="text-[#22C55E] uppercase tracking-widest text-sm font-bold animate-pulse">{{ message || 'Génération de la draft...' }}</p>
            </div>

            <div v-else-if="draftUrl" class="space-y-6">
              <p class="text-green-400 text-center font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">Draft Générée !</p>
              
              <div class="flex flex-col gap-4">
                <a
                  :href="draftUrl"
                  target="_blank"
                  class="w-full py-4 bg-gradient-to-r from-[#22C55E] to-[#14532D] hover:from-[#d9b876] hover:to-[#8a6831] text-[#0B0F0C] rounded-sm font-title text-center transition-all shadow-[0_0_15px_rgba(200,170,110,0.3)] uppercase tracking-widest text-sm border border-[#22C55E]"
                >
                  Ouvrir l'outil de Draft
                </a>
                <button
                  @click="copyDraftLink"
                  class="w-full py-4 bg-[#1A1A1A] hover:bg-[#282d33] border border-[#2A2A2A] hover:border-[#22C55E]/50 rounded-sm font-bold transition-all flex items-center justify-center gap-2 text-[#A1A1AA] hover:text-[#F0FDF4] uppercase tracking-widest text-xs"
                 cursor-pointer>
                  <svg v-if="!linkCopied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span :class="linkCopied ? 'text-green-400' : ''">{{ linkCopied ? 'Copié !' : 'Copier le lien' }}</span>
                </button>
              </div>
              
              <div v-if="draftId" class="flex items-center justify-center gap-2 mt-6 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
                <span class="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                <p class="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-bold">
                  Synchronisation automatique des picks en arrière-plan...
                </p>
              </div>
            </div>
            
            <div v-else class="text-center py-8">
              <p class="text-red-400 font-bold uppercase tracking-widest text-xs mb-6">{{ message || 'Erreur lors de la génération de la draft' }}</p>
              <button @click="generateDraft" class="px-8 py-3 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#22C55E]/50 hover:bg-[#282d33] rounded-sm text-[#F0FDF4] font-bold uppercase tracking-widest text-xs transition-all" cursor-pointer>
                Réessayer
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
  height: 8px;
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #0B0F0C;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #2A2A2A;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #22C55E;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { supabase } from '../lib/supabase';
import { fetchPlayoffMatches } from '../lib/queries';
import { subscribeToTable } from '../lib/realtime';

const matches = ref<any[]>([]);
const loading = ref(true);
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

const loadMatches = async () => {
  const { data } = await fetchPlayoffMatches();
  if (data) matches.value = data;
  loading.value = false;
};

onMounted(() => {
  loadMatches();
  subscription = subscribeToTable('playoff_matches', () => {
    // When a match updates, reload all matches to get full team objects populated
    loadMatches();
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

const startDraftForMatch = (match: any) => {
  if (!match.team1 || !match.team2) return;
  if (match.is_completed) {
    alert("Ce match est déjà terminé. Impossible de lancer une nouvelle draft.");
    return;
  }
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
    message.value = "Récupération des bans globaux...";

    const draftCacheKey = `draft_${blueName.value}_${redName.value}`;
    const cachedDraft = localStorage.getItem(draftCacheKey);

    if (cachedDraft) {
      message.value = "Initialisation de l'interface...";
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const parsed = JSON.parse(cachedDraft);
      draftUrl.value = parsed.draftUrl;
      draftId.value = parsed.draftId || "";
      message.value = "Draft récupérée !";
      
      if (syncInterval) clearInterval(syncInterval);
      syncInterval = setInterval(() => {
        syncDraftPicks();
      }, 5000);
      return;
    }

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
      return c.name.replace(/[^a-zA-Z0-9]/g, '');
    });
    
    message.value = "Initialisation de l'interface...";
    
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
      message.value = "Draft générée !";
      
      localStorage.setItem(draftCacheKey, JSON.stringify({
        draftUrl: data.draftUrl,
        draftId: data.draftId || ""
      }));
      
      if (syncInterval) clearInterval(syncInterval);
      syncInterval = setInterval(() => {
        syncDraftPicks();
      }, 5000);
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

const getWinnerStatusClass = (match: any, teamNum: 1 | 2, group: 'A' | 'B' | 'KO' = 'KO') => {
  if (!match.is_completed) return '';
  const isWinner = teamNum === 1 ? match.team1_score > match.team2_score : match.team2_score > match.team1_score;
  if (!isWinner) return 'opacity-50 grayscale';
  
  if (group === 'A') return 'bg-[#4ADE80]/20 border-l-4 border-l-[#4ADE80]';
  if (group === 'B') return 'bg-[#3B82F6]/20 border-l-4 border-l-[#3B82F6]';
  return 'bg-[#22C55E]/20 border-l-4 border-l-[#22C55E]';
};

const getWinnerScoreClass = (match: any, teamNum: 1 | 2, group: 'A' | 'B' | 'KO' = 'KO') => {
  if (!match.is_completed) return 'text-[#A1A1AA]';
  const isWinner = teamNum === 1 ? match.team1_score > match.team2_score : match.team2_score > match.team1_score;
  if (!isWinner) return 'text-[#2A2A2A]';
  
  if (group === 'A') return 'text-[#4ADE80] drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]';
  if (group === 'B') return 'text-[#3B82F6] drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]';
  return 'text-[#22C55E] drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]';
};

// Group matches by stage and round
const groupedMatches = computed(() => {
  const groups: Record<string, any> = {
    group_a: { name: 'group_a', rounds: {} },
    group_b: { name: 'group_b', rounds: {} },
    knockout: { name: 'knockout', rounds: {} }
  };

  for (const m of matches.value) {
    const b = m.stage;
    if (!groups[b]) groups[b] = { name: b, rounds: {} };
    if (!groups[b].rounds[m.round]) {
      groups[b].rounds[m.round] = { number: m.round, matches: [] };
    }
    groups[b].rounds[m.round].matches.push(m);
  }

  return Object.values(groups)
    .filter(g => Object.keys(g.rounds).length > 0)
    .map(g => ({
      ...g,
      rounds: Object.values(g.rounds).sort((a: any, b: any) => a.number - b.number)
    }));
});

const knockoutRounds = computed(() => {
  const group = groupedMatches.value.find((g: any) => g.name === 'knockout');
  return group ? group.rounds : [];
});

const groupARounds = computed(() => {
  const group = groupedMatches.value.find((g: any) => g.name === 'group_a');
  return group ? group.rounds : [];
});

const groupBRounds = computed(() => {
  const group = groupedMatches.value.find((g: any) => g.name === 'group_b');
  return group ? group.rounds : [];
});

</script>