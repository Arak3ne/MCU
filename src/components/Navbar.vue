<template>
  <nav class="relative z-[100] border-b border-[#2A2A2A] bg-[#0B0F0C]/90 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity -ml-18">
        <img src="../assets/mcu_logo.png" alt="MCU Logo" class="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
        <span class="font-title tracking-widest uppercase text-3xl text-[#22C55E] drop-shadow-[0_2px_10px_rgba(34,197,94,0.2)]">Party</span>
      </router-link>
      
      <div class="flex flex-1 min-w-0 items-center justify-end gap-0 font-sans z-50">
        
        <!-- Tournament -->
        <router-link to="/" class="px-4 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer" :class="route.path === '/' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'">
          <span class="mt-1">Classement</span>
          <div class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300" :class="route.path === '/' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"></div>
          <div v-if="route.path === '/'" class="absolute inset-0 bg-gradient-to-t from-[#22C55E]/10 to-transparent opacity-100 pointer-events-none"></div>
        </router-link>

        <router-link to="/future-matches" class="px-4 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer" :class="route.path === '/future-matches' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'">
          <span class="mt-1">Matches</span>
          <div class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300" :class="route.path === '/future-matches' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"></div>
          <div v-if="route.path === '/future-matches'" class="absolute inset-0 bg-gradient-to-t from-[#22C55E]/10 to-transparent opacity-100 pointer-events-none"></div>
        </router-link>

        <router-link to="/champions" class="px-4 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer" :class="route.path === '/champions' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'">
          <span class="mt-1">Champions</span>
          <div class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300" :class="route.path === '/champions' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"></div>
          <div v-if="route.path === '/champions'" class="absolute inset-0 bg-gradient-to-t from-[#22C55E]/10 to-transparent opacity-100 pointer-events-none"></div>
        </router-link>

        <div class="h-8 w-px bg-[#2A2A2A] mx-2"></div>

        <!-- Scout -->
        <router-link to="/players" class="px-4 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer" :class="route.path === '/players' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'">
          <span class="mt-1">Players</span>
          <div class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300" :class="route.path === '/players' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"></div>
          <div v-if="route.path === '/players'" class="absolute inset-0 bg-gradient-to-t from-[#22C55E]/10 to-transparent opacity-100 pointer-events-none"></div>
        </router-link>

        <router-link to="/stats" class="px-4 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer" :class="route.path === '/stats' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'">
          <span class="mt-1">Stats</span>
          <div class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300" :class="route.path === '/stats' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"></div>
          <div v-if="route.path === '/stats'" class="absolute inset-0 bg-gradient-to-t from-[#22C55E]/10 to-transparent opacity-100 pointer-events-none"></div>
        </router-link>

        <div class="h-8 w-px bg-[#2A2A2A] mx-2"></div>

        <!-- Morue-verse dropdown -->
        <div class="relative group h-20 flex items-center cursor-pointer">
          <div class="px-4 py-3 text-sm font-bold tracking-widest uppercase flex items-center gap-1 transition-colors h-20"
               :class="isFantasyActive() ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] group-hover:text-[#F0FDF4]'">
            <span class="mt-1 normal-case">Morue-verse</span>
            <ChevronDown class="w-4 h-4 mt-1 transition-transform group-hover:rotate-180" />
            <div class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300" 
                 :class="isFantasyActive() ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"></div>
            <div v-if="isFantasyActive()" class="absolute inset-0 bg-gradient-to-t from-[#22C55E]/10 to-transparent opacity-100 pointer-events-none"></div>
          </div>
          
          <div class="absolute top-[calc(100%-8px)] left-1/2 -translate-x-1/2 w-56 pt-2 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-[100]">
            <div class="bg-[#0B0F0C]/95 backdrop-blur-lg border border-[#2A2A2A] rounded-b-lg shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
              <router-link to="/fantasy" class="flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest uppercase transition-colors"
                           :class="route.path === '/fantasy' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#A1A1AA] hover:text-[#22C55E] hover:bg-[#22C55E]/5'">
                <LayoutDashboard class="w-4 h-4" /> Dashboard
              </router-link>
              <router-link to="/fantasy-leaderboard" class="flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest uppercase transition-colors"
                           :class="route.path === '/fantasy-leaderboard' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#A1A1AA] hover:text-[#22C55E] hover:bg-[#22C55E]/5'">
                <ListOrdered class="w-4 h-4" /> Leaderboard
              </router-link>
            </div>
          </div>
        </div>

        <div class="h-8 w-px bg-[#2A2A2A] mx-2 shrink-0"></div>

        <!-- Playoffs button -->
        <router-link to="/playoffs" class="px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all rounded cursor-pointer shrink-0" :class="route.path === '/playoffs' ? 'text-[#0B0F0C] border border-[#22C55E] bg-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-[#22C55E] border border-[#22C55E]/30 hover:border-[#22C55E] hover:bg-[#22C55E]/10 shadow-[inset_0_0_20px_rgba(34,197,94,0.0)] hover:shadow-[inset_0_0_20px_rgba(34,197,94,0.2)]'">
          Playoffs
        </router-link>

        <router-link
          to="/profil"
          title="Profil"
          aria-label="Profil — avatar DiceBear"
          class="ml-3 flex shrink-0 items-center justify-center w-11 h-11 rounded-lg border transition-colors hover:border-[#2A2A2A]"
          :class="route.path === '/profil'
            ? 'text-[#22C55E] border-[#22C55E]/45 bg-[#22C55E]/10 shadow-[0_0_14px_rgba(34,197,94,0.2)]'
            : 'text-[#A1A1AA] border-transparent hover:text-[#F0FDF4]'"
        >
          <UserCircle class="w-6 h-6" stroke-width="2" />
        </router-link>

      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { 
  ChevronDown, 
  LayoutDashboard, 
  ListOrdered,
  UserCircle,
} from 'lucide-vue-next';

const route = useRoute();

const isFantasyActive = () => ['/fantasy', '/fantasy-leaderboard'].includes(route.path);
</script>
