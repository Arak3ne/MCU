<template>
  <div class="h-[1080px] w-[1920px] bg-transparent text-[#F0FDF4] font-sans overflow-hidden relative">
    <!-- Scoreboard (Top Center) -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[100px] bg-[#0B0F0C]/90 backdrop-blur-md rounded-b-sm border-x border-b border-[#22C55E]/50 flex items-center justify-between px-12 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative before:absolute before:-inset-[1px] before:bg-gradient-to-b before:from-transparent before:to-[#22C55E]/30 before:-z-10 before:rounded-b-sm">
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#22C55E] to-transparent shadow-[0_0_15px_#22C55E]"></div>
      
      <div class="flex items-center gap-6 w-[250px] justify-end">
        <span class="text-3xl font-title uppercase tracking-wider text-[#4ADE80] drop-shadow-[0_0_8px_rgba(74,222,128,0.4)] truncate">{{ match.team1?.name }}</span>
        <span class="text-5xl font-title text-[#22C55E] drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">{{ match.team1_score }}</span>
      </div>
      
      <div class="flex flex-col items-center justify-center w-[100px] relative">
        <div class="w-[1px] h-8 bg-[#2A2A2A] absolute -top-2"></div>
        <div class="text-xs font-bold text-[#22C55E] tracking-[0.3em] uppercase bg-[#111111] px-3 py-1 border border-[#2A2A2A] rounded-sm z-10 shadow-inner">VS</div>
        <div class="w-[1px] h-8 bg-[#2A2A2A] absolute -bottom-2"></div>
        
        <!-- League icon -->
        <div class="w-14 h-14 bg-gradient-to-br from-[#22C55E] to-[#14532D] absolute -bottom-10 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] rotate-45 border border-[#F0FDF4]/20">
          <span class="font-title text-xl italic text-[#0B0F0C] -rotate-45">LoL</span>
        </div>
      </div>
      
      <div class="flex items-center gap-6 w-[250px] justify-start">
        <span class="text-5xl font-title text-[#22C55E] drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">{{ match.team2_score }}</span>
        <span class="text-3xl font-title uppercase tracking-wider text-[#EF4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.4)] truncate">{{ match.team2?.name }}</span>
      </div>
    </div>

    <!-- Live Indicator (Bottom Left) -->
    <div class="absolute bottom-10 left-10 flex items-center gap-4 bg-[#0B0F0C]/90 backdrop-blur-md px-6 py-4 rounded-sm border border-[#2A2A2A] shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#22C55E]/50 to-transparent"></div>
      <div class="relative flex items-center justify-center w-6 h-6">
        <div class="w-3 h-3 bg-red-500 rotate-45 animate-ping absolute"></div>
        <div class="w-3 h-3 bg-red-500 rotate-45 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
      </div>
      <div>
        <div class="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest leading-none mb-1">Status</div>
        <div class="text-xl font-title uppercase tracking-widest text-[#22C55E]">Live Tournament</div>
      </div>
    </div>

    <!-- Match Info (Bottom Right) -->
    <div class="absolute bottom-10 right-10 text-right bg-gradient-to-l from-[#0B0F0C]/90 to-transparent backdrop-blur-sm px-10 py-4 rounded-sm border-r-2 border-[#22C55E] shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      <div class="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-[0.2em] mb-1">{{ match.title }}</div>
      <div class="text-2xl font-title uppercase tracking-wider text-[#F0FDF4]">{{ match.subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "../lib/supabase";
import { subscribeToTable } from "../lib/realtime";

const match = ref({
  team1_score: 0,
  team2_score: 0,
  title: "...",
  subtitle: "...",
  team1: { name: "Loading..." },
  team2: { name: "Loading..." }
});

let subscription: any = null;

onMounted(async () => {
  // Fetch initial state
  const { data } = await supabase.from("live_match").select("*, team1:teams!team1_id(*), team2:teams!team2_id(*)").eq("id", 1).single();
  if (data) {
    match.value = data as any;
  }

  // Listen for admin changes
  subscription = subscribeToTable("live_match", async (payload) => {
    if (payload.new) {
      const { data } = await supabase.from("live_match").select("*, team1:teams!team1_id(*), team2:teams!team2_id(*)").eq("id", 1).single();
      if (data) {
        match.value = data as any;
      } else {
        match.value = payload.new;
      }
    }
  });
});

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe();
  }
});
</script>

<style scoped>
/* Ensure this view is exactly 1080p for OBS */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>