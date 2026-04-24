<template>
  <nav class="relative z-10 border-b border-[#2A2A2A] bg-[#0B0F0C]/90 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity cursor-pointer">
        <img src="../assets/mcu_logo.png" alt="MCU Logo" class="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
        <span class="font-title tracking-widest uppercase text-3xl text-[#22C55E] drop-shadow-[0_2px_10px_rgba(34,197,94,0.2)]">Party</span>
      </router-link>
      <div class="flex items-center space-x-2 font-sans">
        <router-link to="/" class="px-5 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer" :class="route.path === '/' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'">
          <span class="mt-1">Ranking</span>
          <div class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300" :class="route.path === '/' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"></div>
          <div v-if="route.path === '/'" class="absolute inset-0 bg-gradient-to-t from-[#22C55E]/10 to-transparent opacity-100"></div>
        </router-link>

        <router-link to="/champions" class="px-5 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer" :class="route.path === '/champions' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'">
          <span class="mt-1">Champions</span>
          <div class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300" :class="route.path === '/champions' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"></div>
          <div v-if="route.path === '/champions'" class="absolute inset-0 bg-gradient-to-t from-[#22C55E]/10 to-transparent opacity-100"></div>
        </router-link>

        <router-link to="/players" class="px-5 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer" :class="route.path === '/players' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'">
          <span class="mt-1">Players</span>
          <div class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300" :class="route.path === '/players' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"></div>
          <div v-if="route.path === '/players'" class="absolute inset-0 bg-gradient-to-t from-[#22C55E]/10 to-transparent opacity-100"></div>
        </router-link>

        <router-link to="/future-matches" class="px-5 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer" :class="route.path === '/future-matches' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'">
          <span class="mt-1">Matches</span>
          <div class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300" :class="route.path === '/future-matches' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"></div>
          <div v-if="route.path === '/future-matches'" class="absolute inset-0 bg-gradient-to-t from-[#22C55E]/10 to-transparent opacity-100"></div>
        </router-link>

        <div class="h-8 w-px bg-[#2A2A2A] mx-4"></div>

        <router-link to="/playoffs" class="px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all rounded cursor-pointer" :class="route.path === '/playoffs' ? 'text-[#0B0F0C] border border-[#22C55E] bg-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-[#22C55E] border border-[#22C55E]/30 hover:border-[#22C55E] hover:bg-[#22C55E]/10 shadow-[inset_0_0_20px_rgba(34,197,94,0.0)] hover:shadow-[inset_0_0_20px_rgba(34,197,94,0.2)]'">
          Playoffs
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
</script>