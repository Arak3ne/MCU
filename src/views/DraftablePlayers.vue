<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-title uppercase tracking-widest text-white mb-2">
          <span class="text-mcu-primary">Draftable</span> Players
        </h1>
        <p class="text-mcu-text-muted text-sm">Préparez vos équipes pour le tournoi.</p>
      </div>
      
      <div class="flex items-center gap-4 w-full md:w-auto">
        <div class="relative flex-1 md:w-64">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Rechercher un pseudo..."
            class="w-full bg-mcu-surface border border-mcu-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-mcu-primary focus:ring-1 focus:ring-mcu-primary transition-colors"
          />
          <svg class="w-4 h-4 text-mcu-text-muted absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <button 
          v-if="isAdmin"
          @click="copyPlayerList"
          class="px-4 py-2 rounded-xl text-sm font-bold bg-mcu-surface border border-mcu-border text-mcu-text-muted hover:text-white hover:border-mcu-primary transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copier
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-mcu-surface/50 border border-mcu-border rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-6">
      <div class="flex-1">
        <label class="block text-xs font-medium text-mcu-text-muted mb-3 uppercase tracking-widest">Filtrer par Rôle</label>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="role in roles" 
            :key="role.value"
            @click="toggleRoleFilter(role.value)"
            class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border"
            :class="selectedRole === role.value ? 'bg-mcu-primary/20 border-mcu-primary text-mcu-primary' : 'bg-mcu-surface border-mcu-border text-mcu-text-muted hover:border-mcu-text-muted'"
          >
            <img :src="role.icon" class="w-4 h-4" :class="selectedRole === role.value ? 'invert-[.5] sepia-[1] hue-rotate-[90deg] saturate-[5]' : 'grayscale opacity-60'" />
            {{ role.label }}
          </button>
          <button 
            v-if="selectedRole"
            @click="selectedRole = null"
            class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all bg-mcu-surface border border-mcu-border text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div class="flex-1 md:max-w-xs">
        <label class="block text-xs font-medium text-mcu-text-muted mb-3 uppercase tracking-widest">Filtrer par Rang</label>
        <div class="relative">
          <select v-model="selectedRank" class="w-full bg-mcu-surface border border-mcu-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-mcu-primary focus:ring-1 focus:ring-mcu-primary transition-colors appearance-none cursor-pointer">
            <option :value="null">Tous les rangs</option>
            <option v-for="rank in ranks" :key="rank" :value="rank">{{ rank }}</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-mcu-text-muted">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="flex-1 md:max-w-[200px]">
        <label class="block text-xs font-medium text-mcu-text-muted mb-3 uppercase tracking-widest">Trier par</label>
        <div class="relative">
          <select v-model="sortBy" class="w-full bg-mcu-surface border border-mcu-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-mcu-primary focus:ring-1 focus:ring-mcu-primary transition-colors appearance-none cursor-pointer">
            <option value="rank">Rang (Décroissant)</option>
            <option value="role">Rôle</option>
            <option value="name">Pseudo (A-Z)</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-mcu-text-muted">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 opacity-50">
      <div class="w-12 h-12 border-4 border-[#2A2A2A] border-t-[#22C55E] rounded-full animate-spin mb-6"></div>
      <p class="text-[#22C55E] uppercase tracking-widest text-sm font-bold animate-pulse">Chargement des joueurs...</p>
    </div>

    <!-- Players Grid -->
    <div v-else-if="filteredPlayers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="player in filteredPlayers" 
        :key="player.id"
        class="bg-mcu-surface-light rounded-2xl border border-mcu-border overflow-hidden hover:border-mcu-primary/50 transition-all duration-300 group shadow-lg"
      >
        <!-- Card Header (Avatar + Info) -->
        <div class="relative h-32 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-t from-mcu-surface-light to-transparent z-10"></div>
          <img 
            :src="getChampionImage(player.champion_signature)" 
            class="w-full h-full object-cover object-top opacity-60 group-hover:scale-105 transition-transform duration-700" 
            alt="" 
          />
          
          <div class="absolute bottom-3 left-4 right-4 z-20 flex justify-between items-end">
            <div>
              <h3 class="text-xl font-title tracking-wider text-white drop-shadow-md">{{ player.pseudo }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs font-bold px-2 py-0.5 rounded bg-black/50 text-mcu-primary border border-mcu-primary/30 backdrop-blur-sm">
                  {{ player.rank }}
                </span>
              </div>
            </div>
            
            <div class="flex gap-1">
              <div class="w-8 h-8 rounded-full bg-black/60 border border-mcu-border flex items-center justify-center backdrop-blur-sm" title="Rôle Principal">
                <img :src="getRoleIcon(player.primary_role)" class="w-5 h-5 invert-[.5] sepia-[1] hue-rotate-[90deg] saturate-[5]" />
              </div>
              <div v-if="player.secondary_role" class="w-8 h-8 rounded-full bg-black/60 border border-mcu-border flex items-center justify-center backdrop-blur-sm" title="Rôle Secondaire">
                <img :src="getRoleIcon(player.secondary_role)" class="w-5 h-5 invert-[.5] sepia-[1] hue-rotate-[190deg] saturate-[5]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-mcu-surface rounded-lg p-2 border border-mcu-border">
              <span class="text-mcu-text-muted block mb-1 uppercase text-[10px] tracking-wider">Style</span>
              <span class="font-bold text-white">{{ player.playstyle }}</span>
            </div>
            <div class="bg-mcu-surface rounded-lg p-2 border border-mcu-border">
              <span class="text-mcu-text-muted block mb-1 uppercase text-[10px] tracking-wider">Mindset</span>
              <span class="font-bold text-white">{{ player.mindset }}</span>
            </div>
          </div>

          <div>
            <span class="text-mcu-text-muted block mb-2 uppercase text-[10px] tracking-wider font-bold">Champion Pool</span>
            <div class="flex gap-2">
              <div 
                v-for="champ in player.champion_pool" 
                :key="champ"
                class="w-8 h-8 rounded-full overflow-hidden border border-mcu-border relative group/champ"
              >
                <img :src="getChampionImage(champ)" class="w-full h-full object-cover" :title="champ" />
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/champ:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                  <span class="text-[8px] font-bold text-white truncate px-1">{{ champ.substring(0, 3) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 bg-mcu-surface/30 rounded-2xl border border-mcu-border border-dashed">
      <svg class="w-16 h-16 text-mcu-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="text-xl font-title tracking-wider text-white mb-2">Aucun joueur trouvé</h3>
      <p class="text-mcu-text-muted text-sm">Modifiez vos filtres pour voir plus de résultats.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getPlayers, getChampions } from '../lib/queries';
import type { Database } from '../types/supabase';

import topIcon from '../assets/top.png';
import jglIcon from '../assets/jgl.png';
import midIcon from '../assets/mid.png';
import adcIcon from '../assets/adc.png';
import supIcon from '../assets/support.png';

type Player = Database['public']['Tables']['players']['Row'];

const isAdmin = ref(localStorage.getItem('admin_auth') === 'true');
const players = ref<Player[]>([]);
const champions = ref<any[]>([]);
const loading = ref(true);

// Filters
const searchQuery = ref('');
const selectedRole = ref<string | null>(null);
const selectedRank = ref<string | null>(null);
const sortBy = ref('rank');

const roles = [
  { label: 'Top', value: 'top', icon: topIcon },
  { label: 'Jungle', value: 'jungle', icon: jglIcon },
  { label: 'Mid', value: 'mid', icon: midIcon },
  { label: 'ADC', value: 'adc', icon: adcIcon },
  { label: 'Support', value: 'support', icon: supIcon },
];

const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];

// Rank weights for sorting
const rankWeights: Record<string, number> = {
  'Iron': 1,
  'Bronze': 2,
  'Silver': 3,
  'Gold': 4,
  'Platinum': 5,
  'Emerald': 6,
  'Diamond': 7,
  'Master': 8,
  'Grandmaster': 9,
  'Challenger': 10
};

// Role weights for sorting
const roleWeights: Record<string, number> = {
  'top': 1,
  'jungle': 2,
  'mid': 3,
  'adc': 4,
  'support': 5
};

onMounted(async () => {
  loading.value = true;
  
  const [playersRes, championsRes] = await Promise.all([
    getPlayers(),
    getChampions()
  ]);
  
  if (playersRes.data) {
    players.value = playersRes.data;
  }
  
  if (championsRes.data) {
    champions.value = championsRes.data;
  }
  
  loading.value = false;
});

const toggleRoleFilter = (role: string) => {
  if (selectedRole.value === role) {
    selectedRole.value = null;
  } else {
    selectedRole.value = role;
  }
};

const getRoleIcon = (roleName: string) => {
  const role = roles.find(r => r.value === roleName);
  return role ? role.icon : '';
};

const getChampionImage = (name: string) => {
  const champ = champions.value.find(c => c.name === name);
  return champ?.image_url || '';
};

const filteredPlayers = computed(() => {
  let result = [...players.value];
  
  // Apply Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => p.pseudo.toLowerCase().includes(query));
  }
  
  // Apply Role Filter
  if (selectedRole.value) {
    result = result.filter(p => p.primary_role === selectedRole.value || p.secondary_role === selectedRole.value);
  }
  
  // Apply Rank Filter
  if (selectedRank.value) {
    result = result.filter(p => p.rank === selectedRank.value);
  }
  
  // Apply Sorting
  result.sort((a, b) => {
    if (sortBy.value === 'rank') {
      const weightA = rankWeights[a.rank] || 0;
      const weightB = rankWeights[b.rank] || 0;
      if (weightA !== weightB) return weightB - weightA; // Descending
      return a.pseudo.localeCompare(b.pseudo);
    } 
    else if (sortBy.value === 'role') {
      const weightA = roleWeights[a.primary_role] || 99;
      const weightB = roleWeights[b.primary_role] || 99;
      if (weightA !== weightB) return weightA - weightB; // Ascending (Top -> Sup)
      
      // Secondary role as tiebreaker
      const secWeightA = roleWeights[a.secondary_role] || 99;
      const secWeightB = roleWeights[b.secondary_role] || 99;
      if (secWeightA !== secWeightB) return secWeightA - secWeightB;
      
      return rankWeights[b.rank] - rankWeights[a.rank]; // Rank as final tiebreaker
    }
    else if (sortBy.value === 'name') {
      return a.pseudo.localeCompare(b.pseudo);
    }
    return 0;
  });
  
  return result;
});

const copyPlayerList = () => {
  const text = filteredPlayers.value.map(p => {
    return `${p.pseudo} - ${p.rank} - ${p.primary_role}/${p.secondary_role} - Pool: ${p.champion_pool.join(', ')}`;
  }).join('\n');
  
  navigator.clipboard.writeText(text).then(() => {
    alert('Liste copiée dans le presse-papier !');
  }).catch(err => {
    console.error('Erreur lors de la copie:', err);
  });
};
</script>