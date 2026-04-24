<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] font-sans selection:bg-[#22C55E] selection:text-[#0B0F0C]">
    <!-- Background accents -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4ADE80] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#22C55E] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
    </div>

    <!-- Main Content -->
    <main class="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-8">
      <!-- Header -->
      <div class="text-center mb-12 relative">
        <div class="inline-block relative">
          <h1 class="text-4xl md:text-5xl font-title uppercase tracking-wider mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] drop-shadow-2xl">
            Matches
          </h1>
          <div class="absolute -inset-x-16 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/30 to-transparent -z-10"></div>
        </div>
        <p class="text-[#A1A1AA] font-medium tracking-widest uppercase text-sm mt-2">Select a match to start the draft process</p>
      </div>

      <!-- Match List -->
      <div class="flex flex-col gap-4">
        <button
          v-for="(match, index) in matches"
          :key="index"
          @click="startDraftForMatch(match)"
          class="group relative bg-gradient-to-r from-[#111111] to-[#1A1A1A] hover:from-[#1A1A1A] hover:to-[#282d33] rounded-sm border border-[#2A2A2A] hover:border-[#22C55E] transition-all duration-300 flex items-center justify-between p-6 overflow-hidden w-full shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] cursor-pointer"
        >
          <!-- Hover Effects -->
          <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5 mix-blend-overlay"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-[#22C55E]/0 via-[#22C55E]/10 to-[#22C55E]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          <div class="absolute left-0 top-0 w-1.5 h-full bg-[#22C55E] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_20px_rgba(34,197,94,1)]"></div>
          <div class="absolute right-0 top-0 w-1.5 h-full bg-[#22C55E] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_20px_rgba(34,197,94,1)]"></div>

          <!-- Blue Side -->
          <div class="flex-1 flex items-center justify-end gap-6 relative z-10">
            <span class="text-2xl md:text-3xl font-title text-[#4ADE80] drop-shadow-[0_0_8px_rgba(11,198,227,0.4)] transition-all uppercase tracking-wide truncate text-right">
              {{ match.team1.name }}
            </span>
            <div class="w-16 h-16 rounded-sm bg-[#0B0F0C] border border-[#4ADE80]/50 flex items-center justify-center shadow-[inset_0_0_10px_rgba(11,198,227,0.2)] transition-all">
              <span class="font-title text-[#4ADE80] text-xl uppercase tracking-wider transition-colors">{{ match.team1.name.substring(0, 2) }}</span>
            </div>
          </div>

          <!-- VS -->
          <div class="mx-8 md:mx-12 relative flex flex-col items-center justify-center z-10">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-[#2A2A2A] group-hover:via-[#22C55E] to-transparent transition-colors -z-10"></div>
            <div class="text-sm text-[#A1A1AA] group-hover:text-[#0B0F0C] font-title italic bg-[#0B0F0C] group-hover:bg-[#22C55E] px-5 py-2 rounded-sm border border-[#2A2A2A] group-hover:border-[#22C55E] shadow-[0_0_20px_rgba(0,0,0,1)] group-hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] uppercase tracking-[0.3em] transition-all group-hover:scale-110">
              VS
            </div>
          </div>

          <!-- Red Side -->
          <div class="flex-1 flex items-center justify-start gap-6 relative z-10">
            <div class="w-16 h-16 rounded-sm bg-[#0B0F0C] border border-[#EF4444]/50 flex items-center justify-center shadow-[inset_0_0_10px_rgba(255,78,80,0.2)] transition-all">
              <span class="font-title text-[#EF4444] text-xl uppercase tracking-wider transition-colors">{{ match.team2.name.substring(0, 2) }}</span>
            </div>
            <span class="text-2xl md:text-3xl font-title text-[#EF4444] drop-shadow-[0_0_8px_rgba(255,78,80,0.4)] transition-all uppercase tracking-wide truncate text-left">
              {{ match.team2.name }}
            </span>
          </div>
        </button>
      </div>
    </main>

    <!-- Modal Popup for Draft -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50 bg-[#0B0F0C]/90 backdrop-blur-md p-4">
      <div class="bg-[#111111] border border-[#22C55E]/30 rounded-sm p-1 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,1)] relative before:absolute before:-inset-[1px] before:bg-gradient-to-b before:from-[#22C55E]/50 before:to-[#22C55E]/10 before:-z-10 before:rounded-sm">
        <div class="bg-[#111111] p-8 h-full w-full rounded-sm relative">
          <!-- Close Button -->
          <button @click="closeModal" class="absolute top-4 right-4 text-[#A1A1AA] hover:text-[#22C55E] transition-colors p-2" cursor-pointer>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/supabase";


type Team = Database["public"]["Tables"]["teams"]["Row"];

interface Match {
  team1: Team;
  team2: Team;
}

const teams = ref<Team[]>([]);
const matches = ref<Match[]>([]);

const showModal = ref(false);
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

onMounted(() => {
  fetchTeams();
});

onUnmounted(() => {
  if (syncInterval) clearInterval(syncInterval);
});

const fetchTeams = async () => {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name");
    
  if (error) {
    console.error("Error fetching teams:", error);
    return;
  }
  
  if (data) {
    teams.value = data;
    generateRoundRobinMatches();
  }
};

const generateRoundRobinMatches = () => {
  const newMatches: Match[] = [];
  for (let i = 0; i < teams.value.length; i++) {
    for (let j = i + 1; j < teams.value.length; j++) {
      newMatches.push({
        team1: teams.value[i],
        team2: teams.value[j]
      });
    }
  }
  matches.value = newMatches;
};

const startDraftForMatch = (match: Match) => {
  blueName.value = match.team1.name;
  redName.value = match.team2.name;
  showModal.value = true;
  generateDraft();
};

const closeModal = () => {
  showModal.value = false;
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
</script>