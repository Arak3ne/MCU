<template>
  <Transition name="fade-modal">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-[#0B0F0C]/96 backdrop-blur-2xl font-sans text-[#F0FDF4]">
      
      <!-- Premium Animated Background -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden fixed">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-mcu-primary/10 blur-[150px] opacity-60"></div>
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[600px] bg-emerald-500/5 blur-[120px] rounded-t-full opacity-40"></div>
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.07] mix-blend-overlay"></div>
      </div>

      <div class="relative w-full max-w-[1200px] px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-full z-10">
        
        <!-- Header -->
        <div 
          class="shrink-0 text-center transition-all duration-1000 transform mb-6 md:mb-8"
          :class="step >= 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 scale-90'"
        >
          <div class="inline-flex items-center gap-3 mb-3 md:mb-4 px-4 py-1.5 rounded-full bg-mcu-primary/10 border border-mcu-primary/30 backdrop-blur-md shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <span class="w-2 h-2 rounded-full bg-mcu-primary animate-ping"></span>
            <span class="text-mcu-primary font-bold tracking-[0.2em] uppercase text-xs">Jour 2</span>
          </div>
          <h2 class="text-3xl md:text-5xl lg:text-6xl font-title uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-100 to-mcu-primary drop-shadow-[0_0_40px_rgba(34,197,94,0.4)] leading-tight">
            Le Mercato est Ouvert
          </h2>
        </div>

        <div class="w-full max-w-4xl flex flex-col gap-4 md:gap-6 items-center">
          
          <!-- Step 1: Prices (Top/Flop) -->
          <div 
            class="w-full bg-gradient-to-br from-[#1A1A1A] to-[#0B0F0C] border border-mcu-primary/30 rounded-2xl p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-1000 transform relative overflow-hidden"
            :class="step >= 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 scale-95'"
          >
            <div class="absolute -top-20 -right-20 w-64 h-64 bg-mcu-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h3 class="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 uppercase tracking-widest flex items-center justify-center gap-3 drop-shadow-lg">
              <svg class="w-6 h-6 md:w-8 md:h-8 text-mcu-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Évolution des Prix
            </h3>
            
            <div v-if="previousTeam && previousTeam.playerIds.length > 0" class="flex flex-wrap justify-center gap-3 md:gap-4">
              <div 
                v-for="playerId in previousTeam.playerIds" 
                :key="playerId"
                class="relative w-24 sm:w-28 md:w-32 aspect-[3/4] rounded-xl overflow-hidden border border-[#2A2A2A] shadow-lg group"
                :class="{
                  'border-mcu-primary/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]': getPriceChange(getFullPlayer(playerId)?.fantasy) > 0,
                  'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]': getPriceChange(getFullPlayer(playerId)?.fantasy) < 0
                }"
              >
                <!-- Splash -->
                <img v-if="getRosterCardSplashUrl(playerId)" :src="getRosterCardSplashUrl(playerId)" class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-500" />
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                <!-- Content -->
                <div class="relative z-10 h-full flex flex-col p-2">
                  <div class="flex justify-between items-start">
                    <div class="w-6 h-6 rounded-full bg-black/60 border border-white/10 flex items-center justify-center backdrop-blur-md">
                      <img v-if="getFullPlayer(playerId)" :src="getRoleIcon(getFullPlayer(playerId)!.primary_role)" class="w-3.5 h-3.5 invert-[.5] sepia-[1] hue-rotate-[90deg] saturate-[5]" />
                    </div>
                    
                    <!-- Stonks / Not Stonks Icon -->
                    <div v-if="getPriceChange(getFullPlayer(playerId)?.fantasy) > 0" class="w-6 h-6 rounded-full bg-mcu-primary/20 border border-mcu-primary/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                      <svg class="w-4 h-4 text-mcu-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <div v-else-if="getPriceChange(getFullPlayer(playerId)?.fantasy) < 0" class="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                      <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    </div>
                    <div v-else class="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                      <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" /></svg>
                    </div>
                  </div>
                  
                  <div class="mt-auto text-center">
                    <div class="text-xs md:text-sm font-title text-white truncate drop-shadow-md">{{ getFullPlayer(playerId)?.pseudo }}</div>
                    
                    <!-- Fantasy Points Earned -->
                    <div class="mt-0.5 text-[9px] md:text-[10px] font-bold flex flex-col items-center justify-center leading-tight" :class="(playerScores[playerId] || 0) > 0 ? 'text-mcu-primary' : (playerScores[playerId] || 0) < 0 ? 'text-red-400' : 'text-white/50'">
                      <span>{{ (playerScores[playerId] || 0) > 0 ? '+' : '' }}{{ Math.round(playerScores[playerId] || 0) }} pts</span>
                      <span v-if="getFullPlayer(playerId)?.fantasy?.price > 0" class="text-white/40 font-normal text-[8px] md:text-[9px] -mt-0.5" title="Rentabilité (Points / Prix)">
                        (x{{ ((playerScores[playerId] || 0) / getFullPlayer(playerId)!.fantasy.price).toFixed(1) }})
                      </span>
                    </div>
                    
                    <div class="mt-1 flex items-center justify-center">
                      <div v-if="getPriceChange(getFullPlayer(playerId)?.fantasy) > 0" class="flex items-center gap-1 bg-mcu-primary/20 border border-mcu-primary/50 text-mcu-primary px-1.5 py-0.5 rounded text-[10px] font-bold shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                        +{{ getPriceChange(getFullPlayer(playerId)?.fantasy) }}
                      </div>
                      <div v-else-if="getPriceChange(getFullPlayer(playerId)?.fantasy) < 0" class="flex items-center gap-1 bg-red-500/20 border border-red-500/50 text-red-400 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                        {{ getPriceChange(getFullPlayer(playerId)?.fantasy) }}
                      </div>
                      <div v-else class="flex items-center gap-1 bg-white/10 border border-white/20 text-white/50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        0
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-white/50 text-sm">
              Aucune équipe précédente trouvée.
            </div>
          </div>

          <!-- Step 2: Budget -->
          <div 
            class="w-full bg-gradient-to-br from-[#1A1A1A] to-[#0B0F0C] border border-mcu-primary/20 rounded-2xl p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-1000 transform"
            :class="step >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'"
          >
            <h3 class="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 uppercase tracking-widest flex items-center gap-3">
              <svg class="w-5 h-5 md:w-6 md:h-6 text-mcu-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Nouveau Budget
            </h3>
            <div class="flex flex-row flex-wrap items-center justify-center gap-2 md:gap-6 text-center">
              <div class="flex flex-col items-center">
                <span class="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mb-1">Budget Restant</span>
                <span class="text-2xl md:text-3xl font-title text-white">{{ carriedOverBudget }}</span>
              </div>
              <div class="text-xl md:text-2xl text-mcu-primary font-bold">+</div>
              <div class="flex flex-col items-center">
                <span class="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mb-1">Valeur Équipe</span>
                <span class="text-2xl md:text-3xl font-title text-white">{{ previousRosterValue }}</span>
              </div>
              <div class="text-xl md:text-2xl text-mcu-primary font-bold">=</div>
              <div class="flex flex-col items-center relative">
                <div class="absolute inset-0 bg-mcu-primary/20 blur-xl rounded-full"></div>
                <span class="text-[10px] md:text-xs text-mcu-primary uppercase tracking-widest mb-1 font-bold">Budget Total</span>
                <span class="text-4xl md:text-5xl font-title text-transparent bg-clip-text bg-gradient-to-b from-white to-mcu-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">{{ carriedOverBudget + previousRosterValue }}</span>
              </div>
            </div>
          </div>

          <!-- Step 3: Rules -->
          <div 
            class="w-full bg-gradient-to-br from-[#1A1A1A] to-[#0B0F0C] border border-mcu-primary/20 rounded-2xl p-3 md:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-1000 transform"
            :class="step >= 3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'"
          >
            <h3 class="text-sm md:text-base font-bold text-white mb-2 md:mb-3 uppercase tracking-widest flex items-center justify-center gap-2">
              <svg class="w-4 h-4 md:w-5 md:h-5 text-mcu-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              Règles des Transferts
            </h3>
            <div class="flex flex-row items-center justify-center gap-3 md:gap-6">
              <div class="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 md:p-3 text-center">
                <div class="text-xl md:text-2xl font-title text-mcu-primary mb-0.5">2</div>
                <div class="text-[9px] md:text-xs text-white/80 font-bold uppercase tracking-widest">Transferts Gratuits</div>
              </div>
              <div class="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl p-2 md:p-3 text-center">
                <div class="text-xl md:text-2xl font-title text-red-400 mb-0.5">-20 pts</div>
                <div class="text-[9px] md:text-xs text-red-300/80 font-bold uppercase tracking-widest">Par transfert supp.</div>
              </div>
            </div>
          </div>

        </div>

        <!-- Action Button -->
        <div 
          class="mt-6 md:mt-8 transition-all duration-1000 delay-500 flex items-center gap-4"
          :class="step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'"
        >
          <button 
            @click="replay"
            class="px-4 py-3 md:px-6 md:py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold text-sm md:text-lg uppercase tracking-[0.2em] rounded-xl transition-all duration-300 cursor-pointer"
            title="Rejouer l'animation"
          >
            <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <button 
            @click="close"
            class="group relative px-6 py-3 md:px-8 md:py-4 bg-mcu-primary hover:bg-mcu-accent text-white font-bold text-sm md:text-lg uppercase tracking-[0.2em] rounded-xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] cursor-pointer overflow-hidden"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span class="relative z-10 flex items-center gap-2 md:gap-3">
              Ouvrir le Marché
              <svg class="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps<{
  show: boolean;
  carriedOverBudget: number;
  previousRosterValue: number;
  previousTeam: any | null;
  playerScores: Record<string, number>;
  getFullPlayer: (id: string) => any;
  getRoleIcon: (roleName: string) => string;
  getPriceChange: (player: any) => number;
  getRosterCardSplashUrl: (playerId: string) => string;
}>();

const emit = defineEmits(['update:show']);

const step = ref(-1);
let animationTimeouts: number[] = [];

const close = () => {
  emit('update:show', false);
};

const replay = () => {
  step.value = -1;
  setTimeout(() => {
    startAnimationSequence();
  }, 500);
};

const startAnimationSequence = () => {
  step.value = 0;
  
  clearTimeouts();

  const delays = [800, 1600, 2400, 3200];
  
  delays.forEach((delay, index) => {
    const t = window.setTimeout(() => {
      step.value = index + 1;
    }, delay);
    animationTimeouts.push(t);
  });
};

const clearTimeouts = () => {
  animationTimeouts.forEach(clearTimeout);
  animationTimeouts = [];
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    startAnimationSequence();
  } else {
    clearTimeouts();
    step.value = -1;
  }
});

onUnmounted(() => {
  clearTimeouts();
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

@keyframes shimmer {
  100% { transform: translateX(100%); }
}
</style>
