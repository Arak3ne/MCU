<template>
  <Transition name="fade-modal">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0B0F0C]/96 backdrop-blur-2xl font-sans text-[#F0FDF4]">
      
      <!-- Premium Animated Background -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-mcu-primary/10 blur-[150px] opacity-60"></div>
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[600px] bg-mcu-primary/5 blur-[120px] rounded-t-full opacity-40"></div>
        <!-- Grid/Particles -->
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.07] mix-blend-overlay"></div>
      </div>

      <div class="relative w-full max-w-[1600px] px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 flex flex-col items-center justify-between h-full max-h-[100dvh] overflow-hidden">
        
        <!-- Epic Header -->
        <div 
          class="shrink-0 text-center transition-all duration-1000 transform"
          :class="step >= 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 scale-90'"
        >
          <div class="inline-flex items-center gap-2 md:gap-3 mb-1 md:mb-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-mcu-primary/10 border border-mcu-primary/30 backdrop-blur-md shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <span class="w-2 h-2 rounded-full bg-mcu-primary animate-ping"></span>
            <span class="text-mcu-primary font-bold tracking-[0.2em] uppercase text-xs">Match terminé</span>
          </div>
          <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-title uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-[#F0FDF4] to-mcu-primary/80 drop-shadow-[0_0_40px_rgba(34,197,94,0.4)] leading-tight">
            Résultats
          </h2>
        </div>

        <!-- Cards Container (Always single row, responsive aspect ratio) -->
        <div class="w-full flex-1 flex flex-nowrap justify-center items-center gap-1 sm:gap-2 md:gap-4 perspective-1000 px-2 py-2 min-h-0">
          <div 
            v-for="(playerId, index) in orderedPlayerIds" 
            :key="playerId"
            class="relative shrink w-full max-w-[19%] xl:max-w-[340px] max-h-full aspect-[5/7] transition-all duration-1000 ease-out cursor-pointer group"
            :class="[
              step > index ? 'opacity-100 translate-y-0 scale-100 rotate-x-0 rotate-y-0' : 'opacity-0 translate-y-32 scale-75 rotate-x-12 -rotate-y-12'
            ]"
            :style="{ transitionDelay: `${index * 150}ms` }"
            @click="toggleFlip(playerId)"
          >
            <!-- Card Inner (Flip) -->
            <div class="w-full h-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform-style-3d relative rounded-xl md:rounded-2xl"
                 :class="[
                   flippedCards[playerId] 
                     ? '[transform:rotateY(180deg)] group-hover:[transform:rotateX(10deg)_rotateY(160deg)_rotateZ(3deg)_translateY(-12px)_scale(1.05)] shadow-[0_20px_40px_rgba(0,0,0,0.6)] md:shadow-[0_30px_60px_rgba(0,0,0,0.6)] group-hover:shadow-[25px_35px_50px_rgba(0,0,0,0.7)]' 
                     : '[transform:rotateY(0deg)] group-hover:[transform:rotateX(10deg)_rotateY(20deg)_rotateZ(-3deg)_translateY(-12px)_scale(1.05)] shadow-[0_20px_40px_rgba(0,0,0,0.6)] md:shadow-[0_30px_60px_rgba(0,0,0,0.6)] group-hover:shadow-[-25px_35px_50px_rgba(0,0,0,0.7)]'
                 ]">
                 
              <!-- Colored Glow attached to the 3D card -->
              <div class="absolute inset-0 rounded-xl md:rounded-2xl pointer-events-none transition-shadow duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] [transform:translateZ(-1px)]"
                   :class="getCardGlowClass(playerId)"></div>
              
              <!-- CARD FRONT -->
              <div class="absolute inset-0 rounded-xl md:rounded-2xl overflow-hidden border border-[#2A2A2A] bg-gradient-to-br from-[#1A1A1A] to-[#0B0F0C] flex flex-col backface-hidden isolate">
                
                <!-- Premium Border Glow Overlay -->
                <div class="absolute inset-0 rounded-xl md:rounded-2xl border-2 pointer-events-none z-50 transition-colors duration-500 mix-blend-overlay"
                     :class="getCardBorderClass(playerId)"></div>
                     
                <!-- Dynamic Glare -->
                <div class="absolute -inset-[100%] z-40 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none [transform:translateZ(1px)_translateX(-50%)_translateY(50%)] group-hover:[transform:translateZ(1px)_translateX(50%)_translateY(-50%)]"></div>

                <!-- Splash Image Background -->
                <div class="absolute inset-0 z-0 transition-transform duration-1000 group-hover:scale-110">
                  <img v-if="splashSrcFor(playerId)" 
                       :src="splashSrcFor(playerId)" 
                       class="w-full h-full object-cover object-top opacity-55" />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#0B0F0C] via-[#0B0F0C]/72 to-transparent"></div>
                  <!-- Vignette -->
                  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0B0F0C_100%)] opacity-80"></div>
                </div>

                <!-- Content Overlay -->
                <div class="relative z-10 flex flex-col h-full p-1.5 sm:p-2 md:p-3">
                  <!-- Header -->
                  <div class="flex justify-between items-start">
                    <div class="relative">
                      <div class="absolute inset-0 bg-black/80 rounded-full blur-sm"></div>
                      <div class="relative w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border border-white/20 bg-black/40 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <img v-if="getFullPlayer(playerId)" :src="getRoleIcon(getFullPlayer(playerId)!.primary_role)" class="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 invert-[.5] sepia-[1] hue-rotate-[90deg] saturate-[5]" />
                      </div>
                    </div>
                    
                    <div v-if="team.captainId === playerId" class="relative">
                      <div class="absolute inset-0 bg-yellow-500/30 blur-md rounded-full animate-pulse"></div>
                      <div class="relative px-1 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-600/40 to-yellow-500/20 border border-yellow-500/50 rounded lg:rounded-lg text-[8px] sm:text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                        <span class="hidden sm:inline">CAPITAINE</span>
                        <span class="sm:hidden">CAP</span>
                      </div>
                    </div>
                  </div>

                  <!-- Player Identity -->
                  <div class="mt-auto text-center mb-1 md:mb-2 relative">
                    <h3 class="text-sm sm:text-base md:text-xl lg:text-2xl font-title tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate px-1">
                      {{ getFullPlayer(playerId)?.pseudo }}
                    </h3>
                  </div>

                  <!-- Score Display Area -->
                  <div class="relative">
                    <div class="absolute -inset-4 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.15)_0%,transparent_70%)] opacity-0 transition-opacity duration-1000"
                         :class="step > index ? 'opacity-100' : ''"></div>
                    
                    <div class="relative flex flex-col items-center justify-center py-0.5 sm:py-1 md:py-2 bg-gradient-to-b from-[#111111]/90 to-[#0B0F0C]/40 rounded-lg md:rounded-xl border border-[#2A2A2A] backdrop-blur-sm overflow-hidden">
                      <div class="text-[6px] sm:text-[7px] md:text-[8px] text-white/50 uppercase tracking-[0.3em] mb-0.5">Score</div>
                      
                      <div class="flex items-baseline gap-0.5 sm:gap-1">
                        <span class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-title drop-shadow-[0_0_20px_currentColor] transition-colors duration-500"
                              :class="getTextColorClass(displayScores[playerId] ?? playerScores[playerId] ?? 0)">
                          {{ displayScores[playerId] !== undefined ? displayScores[playerId].toFixed(1) : '0.0' }}
                        </span>
                        <span class="text-[8px] sm:text-[10px] md:text-sm text-white/40 font-bold uppercase tracking-widest">pts</span>
                      </div>

                      <!-- Cap multiplier tag -->
                      <Transition name="bounce">
                        <div v-if="team.captainId === playerId && step > index + 0.5" 
                             class="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 md:top-2 md:right-2 text-yellow-500 font-title text-[10px] sm:text-xs md:text-sm drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] rotate-[15deg]">
                          x1.5
                        </div>
                      </Transition>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CARD BACK -->
              <div class="absolute inset-0 rounded-xl md:rounded-2xl overflow-hidden border border-[#2A2A2A] bg-gradient-to-b from-[#1A1A1A] to-[#0B0F0C] flex flex-col backface-hidden [transform:rotateY(180deg)] isolate">
                
                <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
                <div class="absolute inset-0 bg-gradient-to-br from-mcu-primary/5 to-transparent pointer-events-none"></div>
                
                <!-- Dynamic Glare -->
                <div class="absolute -inset-[100%] z-40 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none [transform:translateZ(1px)_translateX(-50%)_translateY(50%)] group-hover:[transform:translateZ(1px)_translateX(50%)_translateY(-50%)]"></div>

                <div class="relative z-10 p-1.5 sm:p-2 md:p-3 flex flex-col h-full">
                  <div class="text-center border-b border-[#2A2A2A] pb-1 sm:pb-1.5 md:pb-2 mb-1 md:mb-2">
                    <h4 class="font-title text-white uppercase tracking-widest text-[10px] sm:text-xs md:text-sm">Stats</h4>
                    <div class="text-[7px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 md:mt-1"
                         :class="playerStats[playerId]?.wins > 0 ? 'text-mcu-primary' : 'text-red-400'">
                      {{ playerStats[playerId]?.wins > 0 ? 'Victoire' : 'Défaite' }}
                    </div>
                  </div>

                  <div v-if="playerStats[playerId] && (playerStats[playerId].wins > 0 || playerStats[playerId].losses > 0)" class="flex-1 flex flex-col justify-between space-y-1 md:space-y-2">
                    
                    <!-- KDA Focus -->
                    <div class="bg-white/5 rounded-lg md:rounded-xl p-1 md:p-2 border border-white/5 flex flex-col items-center">
                      <div class="text-[5px] sm:text-[6px] md:text-[7px] text-white/50 uppercase tracking-[0.2em] mb-0.5">K / D / A</div>
                      <div class="font-title text-[10px] sm:text-xs md:text-base text-white tracking-wider whitespace-nowrap">
                        <span class="text-mcu-primary">{{ playerStats[playerId].kills }}</span>
                        <span class="text-white/30 mx-0.5 md:mx-1">/</span>
                        <span class="text-red-400">{{ playerStats[playerId].deaths }}</span>
                        <span class="text-white/30 mx-0.5 md:mx-1">/</span>
                        <span class="text-white/85">{{ playerStats[playerId].assists }}</span>
                      </div>
                      <div class="text-[7px] sm:text-[10px] md:text-xs font-bold text-white mt-0.5 md:mt-1 bg-white/10 px-1.5 sm:px-3 py-0.5 rounded-full">
                        {{ playerStats[playerId].kda }} KDA
                      </div>
                    </div>

                    <!-- Minor Stats Grid -->
                    <div class="grid grid-cols-2 gap-1 md:gap-2">
                      <div class="bg-white/5 rounded-md md:rounded-lg p-0.5 md:p-1.5 border border-white/5 text-center">
                        <div class="text-[5px] sm:text-[6px] md:text-[7px] text-white/50 uppercase tracking-[0.2em]">CS (Sbires)</div>
                        <div class="font-bold text-xs sm:text-sm md:text-base text-mcu-primary">{{ playerStats[playerId].total_minions_killed || 0 }}</div>
                      </div>
                      <div class="bg-white/5 rounded-md md:rounded-lg p-0.5 md:p-1.5 border border-white/5 text-center">
                        <div class="text-[5px] sm:text-[6px] md:text-[7px] text-white/50 uppercase tracking-[0.2em]">Vision</div>
                        <div class="font-bold text-xs sm:text-sm md:text-base text-mcu-primary">{{ playerStats[playerId].vision_score || 0 }}</div>
                      </div>
                    </div>

                    <!-- Champions Played -->
                    <div v-if="playerStats[playerId].championIds?.length > 0" class="mt-auto pt-0.5 md:pt-1">
                      <div class="text-[5px] sm:text-[6px] md:text-[7px] text-white/50 uppercase tracking-[0.2em] text-center mb-0.5 md:mb-1">Champion</div>
                      <div class="flex justify-center flex-wrap gap-1 md:gap-2">
                        <div 
                          v-for="champId in playerStats[playerId].championIds" 
                          :key="champId"
                          class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full overflow-hidden border border-mcu-primary/30 shadow-[0_0_10px_rgba(34,197,94,0.2)] shrink-0"
                        >
                          <img v-if="getChampionSquareById(champId)" :src="getChampionSquareById(champId)" class="w-full h-full object-cover" />
                          <div v-else class="w-full h-full bg-[#111] flex items-center justify-center text-[6px] sm:text-[8px] text-white/50">?</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="flex-1 flex items-center justify-center">
                    <p class="text-[8px] sm:text-xs md:text-sm text-white/30 text-center uppercase tracking-widest font-bold">Aucune donnée</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Epic Total Score Area -->
        <div 
          class="shrink-0 text-center transition-all duration-1000 ease-out transform"
          :class="step >= 6 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-24 scale-90'"
        >
          <div class="relative inline-block group">
            <!-- Outer Glow Rings -->
            <div class="absolute inset-0 bg-mcu-primary/10 blur-[30px] sm:blur-[40px] rounded-full group-hover:bg-mcu-primary/20 transition-colors duration-700"></div>
            <div class="absolute -inset-4 bg-gradient-to-r from-mcu-primary/0 via-mcu-primary/10 to-mcu-primary/0 blur-xl animate-spin-slow rounded-full"></div>
            
            <div class="relative bg-gradient-to-b from-[#1A1A1A] to-[#0B0F0C] border border-[#22C55E]/25 backdrop-blur-2xl rounded-lg md:rounded-xl px-4 sm:px-6 md:px-10 py-1.5 sm:py-2 md:py-3 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(74,222,128,0.08)]">
              
              <p class="text-white/40 text-[7px] sm:text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-0.5 sm:mb-1">
                Score Total
              </p>
              
              <div class="flex items-center justify-center gap-2 sm:gap-3">
                <!-- Massive Number -->
                <span
                  class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-title text-transparent bg-clip-text drop-shadow-[0_0_20px_currentColor]"
                  :class="displayTotal > 0
                    ? 'bg-gradient-to-b from-white via-[#A7F3D0] to-mcu-primary'
                    : displayTotal < 0
                      ? 'bg-gradient-to-b from-red-200 to-red-500 drop-shadow-[0_0_20px_rgba(248,113,113,0.45)]'
                      : 'bg-gradient-to-b from-white to-white/70'">
                  {{ displayTotal.toFixed(1) }}
                </span>
                
                <!-- Diff Indicator -->
                <div v-if="newTotal !== oldTotal" 
                     class="flex flex-col items-center justify-center rounded-lg md:rounded-xl px-2 sm:px-3 md:px-4 py-1 sm:py-2 transition-all duration-700 delay-1000"
                     :class="[
                       step >= 6 ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
                       newTotal > oldTotal ? 'bg-mcu-primary/10 border border-mcu-primary/35' : 'bg-red-500/10 border border-red-500/30'
                     ]">
                  <svg v-if="newTotal > oldTotal" class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-mcu-primary drop-shadow-[0_0_10px_currentColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <svg v-else class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-500 drop-shadow-[0_0_10px_currentColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span class="font-bold text-xs sm:text-sm md:text-lg drop-shadow-[0_0_10px_currentColor]"
                        :class="newTotal > oldTotal ? 'text-mcu-primary' : 'text-red-500'">
                    {{ newTotal > oldTotal ? '+' : '' }}{{ (newTotal - oldTotal).toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Continue Action -->
        <div 
          class="shrink-0 mt-1.5 md:mt-2 transition-all duration-1000 delay-500"
          :class="step >= 7 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'"
        >
          <button 
            @click="close"
            class="group relative px-3 sm:px-4 md:px-6 py-1.5 md:py-2 bg-transparent overflow-hidden rounded-md md:rounded-lg cursor-pointer"
          >
            <!-- Button Backgrounds -->
            <div class="absolute inset-0 bg-mcu-primary transition-transform duration-300 group-hover:scale-105"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            
            <span class="relative z-10 text-white font-bold text-[8px] sm:text-[10px] md:text-xs uppercase tracking-[0.3em] flex items-center gap-1.5 sm:gap-2">
              Fermer les résultats
              <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue';
import type { FantasyTeam } from '../types/fantasy';
import { fantasyService } from '../services/fantasyService';

const props = defineProps<{
  show: boolean;
  team: FantasyTeam;
  playerScores: Record<string, number>;
  oldTotal: number;
  newTotal: number;
  getFullPlayer: (id: string) => any;
  getChampionSplash: (name: string) => string;
  getChampionSquareById: (id: number | string) => string;
  getChampionSplashById?: (id: number | string) => string;
  getRoleIcon: (roleName: string) => string;
}>();

const emit = defineEmits(['update:show']);

const step = ref(-1);
const displayScores = ref<Record<string, number>>({});
const displayTotal = ref(0);
const playerStats = ref<Record<string, any>>({});
const flippedCards = ref<Record<string, boolean>>({});

let animationTimeouts: number[] = [];
let rafIds: number[] = [];

const close = () => {
  emit('update:show', false);
};

const toggleFlip = (playerId: string) => {
  if (step.value >= 0) {
    flippedCards.value[playerId] = !flippedCards.value[playerId];
  }
};

const getCardBorderClass = (playerId: string) => {
  const stats = playerStats.value[playerId];
  if (stats && stats.wins > 0) return 'border-mcu-primary/50';
  if (stats && stats.losses > 0) return 'border-red-500/50';
  return 'border-[#2A2A2A]/90';
};

const getCardGlowClass = (playerId: string) => {
  const stats = playerStats.value[playerId];
  if (stats && stats.wins > 0) return 'shadow-[0_0_40px_rgba(34,197,94,0.18)] group-hover:shadow-[0_0_60px_rgba(34,197,94,0.28)]';
  if (stats && stats.losses > 0) return 'shadow-[0_0_40px_rgba(239,68,68,0.15)] group-hover:shadow-[0_0_60px_rgba(239,68,68,0.3)]';
  return 'shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.7)]';
};

const getTextColorClass = (score: number) => {
  if (score > 0) return 'text-mcu-primary';
  if (score < 0) return 'text-red-400';
  return 'text-white/75';
};

const splashSrcFor = (playerId: string) => {
  const stats = playerStats.value[playerId];
  const playedId = stats?.championIds?.[0];
  if (playedId != null && props.getChampionSplashById) {
    const url = props.getChampionSplashById(playedId);
    if (url) return url;
  }
  const sig = props.getFullPlayer(playerId)?.champion_signature;
  if (sig) return props.getChampionSplash(sig) || '';
  const poolFirst = props.getFullPlayer(playerId)?.champion_pool?.[0];
  if (poolFirst) return props.getChampionSplash(poolFirst) || '';
  return '';
};

const animateValue = (
  start: number, 
  end: number, 
  duration: number, 
  onUpdate: (val: number) => void,
  onComplete?: () => void
) => {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // Ease out expo
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentVal = start + (end - start) * easeProgress;
    
    onUpdate(currentVal);
    
    if (progress < 1) {
      const id = requestAnimationFrame(step);
      rafIds.push(id);
    } else {
      if (onComplete) onComplete();
    }
  };
  const id = requestAnimationFrame(step);
  rafIds.push(id);
};

const orderedPlayerIds = computed(() => {
  const roleOrder = ['top', 'jungle', 'mid', 'adc', 'support'];
  return [...props.team.playerIds].sort((a, b) => {
    const playerA = props.getFullPlayer(a);
    const playerB = props.getFullPlayer(b);
    const roleA = playerA?.primary_role?.toLowerCase() || '';
    const roleB = playerB?.primary_role?.toLowerCase() || '';
    const indexA = roleOrder.indexOf(roleA);
    const indexB = roleOrder.indexOf(roleB);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
});

const startAnimationSequence = async () => {
  step.value = 0;
  displayTotal.value = props.oldTotal;
  flippedCards.value = {};
  props.team.playerIds.forEach(id => {
    displayScores.value[id] = 0;
    flippedCards.value[id] = false;
  });
  
  clearTimeoutsAndRafs();

  try {
    playerStats.value = await fantasyService.getPlayerMatchStats(props.team.playerIds);
  } catch (e) {
    console.error('Failed to fetch player stats', e);
  }

  orderedPlayerIds.value.forEach((playerId, index) => {
    const t = window.setTimeout(() => {
      step.value = index + 1;
      
      let finalScore = props.playerScores[playerId] || 0;
      if (props.team.captainId === playerId) {
        finalScore *= 1.5;
      }
      
      animateValue(0, finalScore, 1200, (val) => {
        displayScores.value[playerId] = val;
      });
      
    }, 800 + index * 400); // Faster stagger for better flow
    animationTimeouts.push(t);
  });

  const totalDelay = 800 + props.team.playerIds.length * 400 + 800;
  const tTotal = window.setTimeout(() => {
    step.value = 6;
    animateValue(props.oldTotal, props.newTotal, 2000, (val) => {
      displayTotal.value = val;
    });
  }, totalDelay);
  animationTimeouts.push(tTotal);

  const tBtn = window.setTimeout(() => {
    step.value = 7;
  }, totalDelay + 2200);
  animationTimeouts.push(tBtn);
};

const clearTimeoutsAndRafs = () => {
  animationTimeouts.forEach(clearTimeout);
  animationTimeouts = [];
  rafIds.forEach(cancelAnimationFrame);
  rafIds = [];
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    startAnimationSequence();
  } else {
    clearTimeoutsAndRafs();
    step.value = -1;
  }
});

onUnmounted(() => {
  clearTimeoutsAndRafs();
});
</script>

<style scoped>
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

.perspective-1000 {
  perspective: 1200px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.bounce-enter-active {
  animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.bounce-leave-active {
  animation: bounce-in 0.6s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.4) rotate(25deg);
  }
  100% {
    transform: scale(1) rotate(15deg);
    opacity: 1;
  }
}

@keyframes pan {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.animate-spin-slow {
  animation: spin 15s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Hide scrollbar but allow scroll */
.hide-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>