<template>
  <div class="min-h-screen bg-mcu-bg text-mcu-text flex flex-col items-center justify-center p-4 relative overflow-hidden">
    <!-- Background effects -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.05)_0%,transparent_70%)]"></div>
    <div class="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>

    <div class="w-full max-w-2xl bg-mcu-surface-light/80 backdrop-blur-xl rounded-2xl border border-mcu-border shadow-2xl overflow-hidden relative z-10">
      <!-- Success State -->
      <div v-if="success" class="p-16 text-center flex flex-col items-center justify-center animate-fade-in">
        <div class="w-24 h-24 bg-mcu-primary/20 rounded-full flex items-center justify-center mb-8 relative">
          <div class="absolute inset-0 rounded-full border-2 border-mcu-primary animate-ping opacity-20"></div>
          <svg class="w-12 h-12 text-mcu-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-4xl font-title text-white mb-4 uppercase tracking-widest drop-shadow-sm">Inscription validée</h2>
        <p class="text-mcu-text-muted text-lg mb-10">Tu seras draft le jour J. Prépare-toi.</p>
        
        <div v-if="signatureChampion" class="mt-4 flex flex-col items-center animate-fade-in" style="animation-delay: 0.2s">
          <p class="text-sm text-mcu-text-muted uppercase tracking-widest mb-6 font-bold">Ton Avatar</p>
          <div class="w-40 h-40 rounded-full overflow-hidden border-4 border-mcu-primary shadow-[0_0_30px_rgba(34,197,94,0.3)] relative group">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img :src="signatureChampion.image_url" class="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" alt="Avatar" />
            <div class="absolute bottom-4 left-0 right-0 text-center z-20">
              <span class="font-title text-xl tracking-wider">{{ signatureChampion.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <div v-else>
        <!-- Header & Progress -->
        <div class="p-8 pb-6 border-b border-mcu-border relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-mcu-surface">
            <div class="h-full bg-mcu-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]" :style="{ width: `${(currentStep / 4) * 100}%` }"></div>
          </div>
          <div class="flex flex-col items-center justify-center mb-8 mt-2 gap-4">
            <img src="../assets/mcu_logo.png" alt="MCU Logo" class="w-16 h-16 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <h1 class="text-3xl font-title uppercase tracking-widest text-center text-white">
              <span class="text-mcu-primary">MCU Party</span> Inscription
            </h1>
          </div>
          
          <div class="flex items-center justify-between relative px-4">
            <div class="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-mcu-border -z-10"></div>
            <div v-for="step in 4" :key="step" class="flex flex-col items-center gap-2 bg-mcu-surface-light px-2">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2"
                :class="currentStep > step ? 'bg-mcu-primary border-mcu-primary text-white' : currentStep === step ? 'bg-mcu-surface border-mcu-primary text-mcu-primary shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-mcu-surface border-mcu-border text-mcu-text-muted'"
              >
                <svg v-if="currentStep > step" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else>{{ step }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Steps -->
        <form @submit.prevent="submitForm" class="p-8 sm:p-10">
          
          <!-- Step 1: Basic Info -->
          <div v-show="currentStep === 1" class="space-y-8 animate-fade-in">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-title tracking-wider text-mcu-primary mb-2">Identifiants</h2>
              <p class="text-mcu-text-muted text-sm">Comment on t'appelle sur la faille ?</p>
            </div>
            
            <div class="space-y-6">
              <div class="relative group">
                <input 
                  v-model="form.pseudo" 
                  type="text" 
                  id="pseudo"
                  required
                  class="peer w-full bg-mcu-surface border border-mcu-border rounded-xl px-4 pt-6 pb-2 text-white focus:outline-none focus:border-mcu-primary focus:ring-1 focus:ring-mcu-primary transition-all placeholder-transparent"
                  placeholder="Pseudo en jeu"
                />
                <label for="pseudo" class="absolute left-4 top-2 text-xs font-medium text-mcu-text-muted uppercase tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-mcu-primary cursor-text">Pseudo en jeu</label>
              </div>

              <div class="relative group">
                <input 
                  v-model="form.riot_id" 
                  type="text" 
                  id="riot_id"
                  required
                  pattern="^.+#.+$"
                  title="Format requis: Pseudo#TAG"
                  class="peer w-full bg-mcu-surface border border-mcu-border rounded-xl px-4 pt-6 pb-2 text-white focus:outline-none focus:border-mcu-primary focus:ring-1 focus:ring-mcu-primary transition-all placeholder-transparent"
                  placeholder="Riot ID (Pseudo#TAG)"
                />
                <label for="riot_id" class="absolute left-4 top-2 text-xs font-medium text-mcu-text-muted uppercase tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-mcu-primary cursor-text">Riot ID (Pseudo#TAG)</label>
              </div>
              
              <div class="relative group">
                <input 
                  v-model="form.discord" 
                  type="text" 
                  id="discord"
                  required
                  class="peer w-full bg-mcu-surface border border-mcu-border rounded-xl px-4 pt-6 pb-2 text-white focus:outline-none focus:border-mcu-primary focus:ring-1 focus:ring-mcu-primary transition-all placeholder-transparent"
                  placeholder="Pseudo Discord"
                />
                <label for="discord" class="absolute left-4 top-2 text-xs font-medium text-mcu-text-muted uppercase tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-mcu-primary cursor-text">Pseudo Discord</label>
              </div>
            </div>

            <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
              <svg class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-blue-200/80 leading-relaxed">
                Si tu es déjà inscrit avec ce compte Discord, tu seras automatiquement connecté et redirigé vers l'application en cliquant sur Suivant.
              </p>
            </div>
          </div>

          <!-- Step 2: Roles -->
          <div v-show="currentStep === 2" class="space-y-8 animate-fade-in">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-title tracking-wider text-mcu-primary mb-2">Tes Rôles</h2>
              <p class="text-mcu-text-muted text-sm">Où vas-tu carry ta team ?</p>
            </div>
            
            <div class="space-y-8">
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-white mb-4 uppercase tracking-wider">
                  <span class="w-2 h-2 rounded-full bg-mcu-primary shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                  Rôle Principal
                </label>
                <div class="grid grid-cols-5 gap-2 sm:gap-4">
                  <div 
                    v-for="role in roles" 
                    :key="'pri-'+role.value"
                    @click="form.primary_role = role.value; if(form.secondary_role === role.value) form.secondary_role = '';"
                    class="group cursor-pointer rounded-xl border-2 flex flex-col items-center justify-center py-4 sm:py-6 transition-all duration-300 relative overflow-hidden"
                    :class="form.primary_role === role.value ? 'bg-mcu-primary/10 border-mcu-primary shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-mcu-surface border-mcu-border hover:border-mcu-text-muted'"
                  >
                    <div v-if="form.primary_role === role.value" class="absolute inset-0 bg-gradient-to-b from-mcu-primary/20 to-transparent opacity-50"></div>
                    <img :src="role.icon" class="w-8 h-8 sm:w-10 sm:h-10 mb-3 transition-all duration-300 relative z-10" :class="form.primary_role === role.value ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] invert-[.5] sepia-[1] hue-rotate-[90deg] saturate-[5]' : 'grayscale opacity-40 group-hover:opacity-80 group-hover:grayscale-0'" />
                    <span class="text-[10px] sm:text-xs uppercase font-bold tracking-wider relative z-10" :class="form.primary_role === role.value ? 'text-mcu-primary' : 'text-mcu-text-muted'">{{ role.label }}</span>
                  </div>
                </div>
              </div>

              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-white mb-4 uppercase tracking-wider">
                  <span class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                  Rôle Secondaire
                </label>
                <div class="grid grid-cols-5 gap-2 sm:gap-4">
                  <div 
                    v-for="role in roles" 
                    :key="'sec-'+role.value"
                    @click="form.primary_role !== role.value && (form.secondary_role = role.value)"
                    class="group rounded-xl border-2 flex flex-col items-center justify-center py-4 sm:py-6 transition-all duration-300 relative overflow-hidden"
                    :class="[
                      form.primary_role === role.value ? 'opacity-20 cursor-not-allowed bg-mcu-surface border-transparent' : 'cursor-pointer',
                      form.secondary_role === role.value ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : (form.primary_role !== role.value ? 'bg-mcu-surface border-mcu-border hover:border-mcu-text-muted' : '')
                    ]"
                  >
                    <div v-if="form.secondary_role === role.value" class="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent opacity-50"></div>
                    <img :src="role.icon" class="w-8 h-8 sm:w-10 sm:h-10 mb-3 transition-all duration-300 relative z-10" :class="form.secondary_role === role.value ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] invert-[.5] sepia-[1] hue-rotate-[190deg] saturate-[5]' : 'grayscale opacity-40 group-hover:opacity-80 group-hover:grayscale-0'" />
                    <span class="text-[10px] sm:text-xs uppercase font-bold tracking-wider relative z-10" :class="form.secondary_role === role.value ? 'text-blue-400' : 'text-mcu-text-muted'">{{ role.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Profiling -->
          <div v-show="currentStep === 3" class="space-y-8 animate-fade-in">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-title tracking-wider text-mcu-primary mb-2">Ton Profil</h2>
              <p class="text-mcu-text-muted text-sm">Dis-nous en plus sur ton style</p>
            </div>
            
            <div class="space-y-6">
              <div>
                <label class="block text-xs font-medium text-mcu-text-muted mb-2 uppercase tracking-widest">Rang Actuel</label>
                <div class="relative">
                  <select v-model="form.rank" class="w-full bg-mcu-surface border border-mcu-border rounded-xl px-4 py-4 text-white focus:outline-none focus:border-mcu-primary focus:ring-1 focus:ring-mcu-primary transition-colors appearance-none cursor-pointer font-medium">
                    <option value="" disabled>Sélectionne ton rang</option>
                    <option v-for="rank in ranks" :key="rank" :value="rank">{{ rank }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-mcu-text-muted">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-mcu-text-muted mb-2 uppercase tracking-widest">Style de Jeu</label>
                <div class="grid grid-cols-2 gap-3">
                  <div 
                    v-for="style in playstyles" 
                    :key="style"
                    @click="form.playstyle = style"
                    class="cursor-pointer rounded-xl border-2 px-4 py-4 text-center transition-all duration-300"
                    :class="form.playstyle === style ? 'bg-mcu-primary/10 border-mcu-primary text-mcu-primary shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-mcu-surface border-mcu-border text-mcu-text-muted hover:border-mcu-text-muted hover:text-white'"
                  >
                    <span class="text-sm font-bold tracking-wide">{{ style }}</span>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-mcu-text-muted mb-2 uppercase tracking-widest">État d'Esprit</label>
                <div class="grid grid-cols-3 gap-3">
                  <div 
                    v-for="mindset in mindsets" 
                    :key="mindset"
                    @click="form.mindset = mindset"
                    class="cursor-pointer rounded-xl border-2 px-2 py-4 text-center transition-all duration-300 flex items-center justify-center"
                    :class="form.mindset === mindset ? 'bg-mcu-primary/10 border-mcu-primary text-mcu-primary shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-mcu-surface border-mcu-border text-mcu-text-muted hover:border-mcu-text-muted hover:text-white'"
                  >
                    <span class="text-xs sm:text-sm font-bold tracking-wide">{{ mindset }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Champions -->
          <div v-show="currentStep === 4" class="space-y-6 animate-fade-in flex flex-col h-[500px]">
            <div class="text-center shrink-0">
              <h2 class="text-2xl font-title tracking-wider text-mcu-primary mb-2">Champion Pool</h2>
              <p class="text-mcu-text-muted text-sm">Tes 5 meilleurs picks</p>
            </div>
            
            <div class="flex justify-between items-center shrink-0">
              <div class="relative w-full max-w-xs">
                <input 
                  v-model="championSearch" 
                  type="text" 
                  placeholder="Rechercher..."
                  class="w-full bg-mcu-surface border border-mcu-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-mcu-primary focus:ring-1 focus:ring-mcu-primary transition-colors"
                />
                <svg class="w-4 h-4 text-mcu-text-muted absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div class="flex items-center gap-2 bg-mcu-surface px-4 py-2 rounded-xl border border-mcu-border">
                <span class="text-lg font-title" :class="form.champion_pool.length === 5 ? 'text-mcu-primary' : 'text-white'">{{ form.champion_pool.length }}</span>
                <span class="text-mcu-text-muted text-sm">/ 5</span>
              </div>
            </div>
            
            <div class="flex-1 overflow-y-auto pr-2 rounded-xl border border-mcu-border bg-mcu-surface/50 p-3 custom-scrollbar min-h-0">
              <div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
                <div
                  v-for="champion in filteredChampions"
                  :key="champion.id"
                  @click="toggleChampionPool(champion.name)"
                  class="group relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300"
                  :class="form.champion_pool.includes(champion.name) ? 'border-mcu-primary shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-transparent hover:border-mcu-border opacity-70 hover:opacity-100'"
                >
                  <img :src="champion.image_url" :alt="champion.name" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1">
                    <span class="text-[10px] font-bold text-white truncate px-1">{{ champion.name }}</span>
                  </div>
                  <div v-if="form.champion_pool.includes(champion.name)" class="absolute inset-0 bg-mcu-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                    <svg class="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="form.champion_pool.length > 0" class="shrink-0 animate-fade-in bg-mcu-surface rounded-xl p-4 border border-mcu-border">
              <label class="block text-xs font-medium text-mcu-text-muted mb-3 uppercase tracking-widest text-center">Choisis ton Main (Avatar)</label>
              <div class="flex justify-center gap-4">
                <div 
                  v-for="champName in form.champion_pool" 
                  :key="'sig-'+champName"
                  @click="form.champion_signature = champName"
                  class="group flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 cursor-pointer rounded-full overflow-hidden border-2 transition-all duration-300 relative"
                  :class="form.champion_signature === champName ? 'border-mcu-primary shadow-[0_0_20px_rgba(34,197,94,0.5)] scale-110 z-10' : 'border-mcu-border opacity-50 hover:opacity-100 hover:border-mcu-text-muted'"
                >
                  <img :src="getChampionImage(champName)" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div v-if="form.champion_signature === champName" class="absolute inset-0 bg-mcu-primary/10"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between items-center mt-8 pt-6 border-t border-mcu-border">
            <button 
              type="button" 
              @click="prevStep" 
              :class="currentStep > 1 ? 'opacity-100 visible' : 'opacity-0 invisible'"
              class="px-6 py-3 rounded-xl font-bold text-sm bg-mcu-surface text-mcu-text-muted hover:text-white border border-mcu-border hover:border-mcu-text-muted transition-all flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            
            <button 
              v-if="currentStep < 4"
              type="button" 
              @click="nextStep"
              :disabled="!isStepValid || loading"
              class="px-8 py-3 rounded-xl font-bold text-sm bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center gap-2 group shadow-lg"
            >
              <span v-if="loading" class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              {{ loading ? 'Vérification...' : 'Suivant' }}
              <svg v-if="!loading" class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button 
              v-if="currentStep === 4"
              type="submit"
              :disabled="!isStepValid || loading"
              class="px-8 py-3 rounded-xl font-bold text-sm bg-mcu-primary text-white hover:bg-mcu-accent transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center gap-2"
            >
              <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ loading ? 'En cours...' : 'Terminer' }}
              <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
          
          <div v-if="errorMsg" class="mt-6 animate-fade-in">
            <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
              <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-red-400 font-medium">{{ errorMsg }}</p>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../lib/supabase';
import topIcon from '../assets/top.png';
import jglIcon from '../assets/jgl.png';
import midIcon from '../assets/mid.png';
import adcIcon from '../assets/adc.png';
import supIcon from '../assets/support.png';

interface FormState {
  pseudo: string;
  discord: string;
  riot_id: string;
  primary_role: string;
  secondary_role: string;
  rank: string;
  playstyle: string;
  mindset: string;
  champion_pool: string[];
  champion_signature: string;
}

const currentStep = ref(1);
const loading = ref(false);
const success = ref(false);
const errorMsg = ref('');

const roles = [
  { label: 'Top', value: 'top', icon: topIcon },
  { label: 'Jungle', value: 'jungle', icon: jglIcon },
  { label: 'Mid', value: 'mid', icon: midIcon },
  { label: 'ADC', value: 'adc', icon: adcIcon },
  { label: 'Support', value: 'support', icon: supIcon },
];

const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];
const playstyles = ['Carry', 'Teamplayer', 'Shotcaller', 'Flexible'];
const mindsets = ['Chill', 'Competitive', 'Tryhard'];

const form = ref<FormState>({
  pseudo: '',
  discord: '',
  riot_id: '',
  primary_role: '',
  secondary_role: '',
  rank: '',
  playstyle: '',
  mindset: '',
  champion_pool: [],
  champion_signature: ''
});

const allChampions = ref<any[]>([]);
const championSearch = ref('');

onMounted(async () => {
  const { data } = await supabase.from('champions').select('id, name, image_url').order('name');
  if (data) allChampions.value = data;
});

const filteredChampions = computed(() => {
  if (!championSearch.value) return allChampions.value;
  const lower = championSearch.value.toLowerCase();
  return allChampions.value.filter(c => c.name.toLowerCase().includes(lower));
});

const toggleChampionPool = (champName: string) => {
  const index = form.value.champion_pool.indexOf(champName);
  if (index > -1) {
    form.value.champion_pool.splice(index, 1);
    if (form.value.champion_signature === champName) {
      form.value.champion_signature = '';
    }
  } else if (form.value.champion_pool.length < 5) {
    form.value.champion_pool.push(champName);
    if (form.value.champion_pool.length === 1) {
      form.value.champion_signature = champName;
    }
  }
};

const getChampionImage = (name: string) => {
  const champ = allChampions.value.find(c => c.name === name);
  return champ?.image_url || '';
};

const signatureChampion = computed(() => {
  if (!form.value.champion_signature) return null;
  return allChampions.value.find(c => c.name === form.value.champion_signature);
});

const isStepValid = computed(() => {
  if (currentStep.value === 1) {
    const isRiotIdValid = /^.+#.+$/.test(form.value.riot_id.trim());
    return form.value.pseudo.trim().length > 0 && form.value.discord.trim().length > 0 && isRiotIdValid;
  }
  if (currentStep.value === 2) {
    return form.value.primary_role !== '' && form.value.secondary_role !== '';
  }
  if (currentStep.value === 3) {
    return form.value.rank !== '' && form.value.playstyle !== '' && form.value.mindset !== '';
  }
  if (currentStep.value === 4) {
    return form.value.champion_pool.length > 0 && form.value.champion_signature !== '';
  }
  return false;
});

const nextStep = async () => {
  if (!isStepValid.value) return;

  if (currentStep.value === 1) {
    loading.value = true;
    errorMsg.value = '';
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('discord', form.value.discord)
        .single();
        
      if (data) {
        // User already exists, log them in
        localStorage.setItem('mcu_user', JSON.stringify(data));
        window.location.href = '/';
        return;
      } else if (error && error.code !== 'PGRST116') {
        // PGRST116 is "No rows found", which means user doesn't exist (this is expected)
        console.error(error);
        errorMsg.value = "Erreur lors de la vérification du profil.";
        loading.value = false;
        return;
      }
    } catch (err) {
      console.error(err);
      loading.value = false;
      return;
    }
    loading.value = false;
  }

  if (currentStep.value < 4) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const submitForm = async () => {
  if (!isStepValid.value) return;
  
  errorMsg.value = '';
  loading.value = true;
  
  try {
    const { data, error } = await supabase.from('players').insert({
      pseudo: form.value.pseudo,
      discord: form.value.discord,
      riot_id: form.value.riot_id.trim(),
      primary_role: form.value.primary_role,
      secondary_role: form.value.secondary_role,
      rank: form.value.rank,
      playstyle: form.value.playstyle,
      mindset: form.value.mindset,
      champion_pool: form.value.champion_pool,
      champion_signature: form.value.champion_signature
    }).select().single();
    
    if (error) {
      if (error.code === '23505') {
        errorMsg.value = "Ce compte Discord est déjà inscrit.";
      } else {
        errorMsg.value = "Une erreur est survenue lors de l'inscription.";
        console.error(error);
      }
    } else {
      success.value = true;
      localStorage.setItem('mcu_user', JSON.stringify(data));
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  } catch (err) {
    errorMsg.value = "Erreur inattendue.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(17, 17, 17, 0.5); 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1); 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2); 
}
</style>
