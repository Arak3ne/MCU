<template>
  <div class="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-title uppercase tracking-widest text-white mb-2">
          Joueurs <span class="text-mcu-primary">Draftables</span>
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
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-mcu-surface/50 border border-mcu-border rounded-2xl p-4 md:p-6 mb-8 flex flex-col gap-6 md:flex-row md:items-end">
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

      <div class="shrink-0">
        <div class="inline-flex rounded-xl border border-mcu-border bg-mcu-surface p-1 gap-0.5">
          <button
            type="button"
            title="Vue cartes"
            @click="setPlayerView('cards')"
            class="rounded-lg p-2.5 transition-colors"
            :class="playerView === 'cards' ? 'bg-mcu-primary/20 text-mcu-primary' : 'text-mcu-text-muted hover:text-white hover:bg-mcu-surface-light/50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            type="button"
            title="Vue tableau"
            @click="setPlayerView('table')"
            class="rounded-lg p-2.5 transition-colors"
            :class="playerView === 'table' ? 'bg-mcu-primary/20 text-mcu-primary' : 'text-mcu-text-muted hover:text-white hover:bg-mcu-surface-light/50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke-width="2" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9h18M3 14h18M9 4v16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-32 opacity-80">
        <div class="relative w-20 h-20 mb-8">
          <div class="absolute inset-0 border-4 border-mcu-border rounded-full"></div>
          <div class="absolute inset-0 border-4 border-mcu-primary rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
          <div class="absolute inset-2 border-4 border-mcu-primary/30 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
        </div>
        <p class="text-mcu-primary uppercase tracking-widest text-sm font-bold animate-pulse drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">Chargement des joueurs...</p>
      </div>

      <!-- Players Grid -->
      <div v-else-if="!loading && filteredPlayers.length > 0 && playerView === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
      <div 
        v-for="player in filteredPlayers" 
        :key="player.id"
        class="relative bg-mcu-surface-light/80 backdrop-blur-xl rounded-2xl border border-mcu-border/70 overflow-hidden transition-all duration-300 group shadow-[0_10px_40px_rgba(0,0,0,0.55)] hover:shadow-[0_20px_70px_rgba(0,0,0,0.65)] hover:border-mcu-primary/40 hover:-translate-y-0.5"
      >
        <!-- Full-card splash background -->
        <img
          :src="getChampionSplash(player.champion_signature)"
          class="absolute inset-0 w-full h-full object-cover object-top opacity-60 scale-[1.06] transition-transform duration-700 group-hover:scale-[1.10]"
          alt=""
        />
        <div class="absolute inset-0 bg-gradient-to-b from-black/15 via-mcu-surface-light/25 to-mcu-surface-light/95"></div>

        <!-- Card Header (Avatar + Info) -->
        <div class="relative h-40 overflow-hidden">
          <div class="absolute bottom-3 left-4 right-4 z-20 flex justify-between items-end">
            <div>
              <h3 class="text-xl font-title tracking-wider text-white drop-shadow-md">{{ player.pseudo }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/50 text-mcu-primary border border-mcu-primary/30 backdrop-blur-sm shadow-inner" :title="player.rank">
                  <img :src="getRankIconUrl(player.rank)" class="w-4 h-4 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]" :alt="player.rank" />
                  <span class="text-[10px] font-bold uppercase tracking-wider">{{ player.rank }}</span>
                </div>
                <span v-if="player.fantasy_tier" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/50 border backdrop-blur-sm" :class="getFantasyTierBadgeClass(player.fantasy_tier)">
                  Tier {{ player.fantasy_tier }}
                </span>
                <span v-if="getPlayerTeam(player)" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white border border-white/30 backdrop-blur-sm truncate max-w-[100px]" :title="getPlayerTeam(player)">
                  {{ getPlayerTeam(player) }}
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
        <div class="relative p-4 space-y-4">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-black/35 rounded-lg p-2 border border-mcu-border/70 backdrop-blur-md">
              <span class="text-white/75 block mb-1 uppercase text-[10px] tracking-wider font-bold">Style</span>
              <span class="font-extrabold text-white">{{ player.playstyle }}</span>
            </div>
            <div class="bg-black/35 rounded-lg p-2 border border-mcu-border/70 backdrop-blur-md">
              <span class="text-white/75 block mb-1 uppercase text-[10px] tracking-wider font-bold">Mindset</span>
              <span class="font-extrabold text-white">{{ player.mindset }}</span>
            </div>
          </div>

          <div>
            <span class="text-white/80 block mb-2 uppercase text-[10px] tracking-wider font-bold">Champion Pool</span>
            <div class="flex gap-2">
              <div 
                v-for="champ in player.champion_pool" 
                :key="champ"
                class="w-8 h-8 rounded-full overflow-hidden border border-mcu-border/80 relative group/champ shadow-[0_6px_18px_rgba(0,0,0,0.6)] cursor-default"
              >
                <img :src="getChampionSquare(champ)" class="w-full h-full object-cover" :title="champ" />
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/champ:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px] pointer-events-none">
                  <span class="text-[8px] font-bold text-white truncate px-1">{{ champ.substring(0, 3) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Players Table -->
    <div v-else-if="!loading && filteredPlayers.length > 0 && playerView === 'table'" class="rounded-2xl border border-mcu-border bg-mcu-surface/40 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-[860px] w-full text-left text-sm">
          <thead class="sticky top-0 z-10 bg-mcu-surface/95 backdrop-blur-md border-b border-mcu-border">
            <tr class="text-[10px] font-bold uppercase tracking-widest text-mcu-text-muted">
              <th class="px-4 py-3 whitespace-nowrap">Pseudo</th>
              <th class="px-4 py-3 whitespace-nowrap">Rang</th>
              <th class="px-4 py-3 whitespace-nowrap">Rôle P.</th>
              <th class="px-4 py-3 whitespace-nowrap">Rôle S.</th>
              <th class="px-4 py-3 whitespace-nowrap">Style</th>
              <th class="px-4 py-3 whitespace-nowrap">Mindset</th>
              <th class="px-4 py-3 min-w-[200px]">Champion pool</th>
              <th class="px-4 py-3 whitespace-nowrap">Équipe</th>
              <th class="px-4 py-3 whitespace-nowrap text-right">Tier</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-mcu-border/60">
            <tr
              v-for="player in filteredPlayers"
              :key="player.id"
              class="hover:bg-mcu-surface-light/40 transition-colors"
            >
              <td class="px-4 py-3 font-title tracking-wide text-white whitespace-nowrap">{{ player.pseudo }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 text-mcu-primary border border-mcu-primary/30 shadow-inner w-fit" :title="player.rank">
                  <img :src="getRankIconUrl(player.rank)" class="w-5 h-5 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]" :alt="player.rank" />
                  <span class="text-xs font-bold uppercase tracking-wider">{{ player.rank }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-white/90 whitespace-nowrap uppercase text-xs font-bold">{{ player.primary_role }}</td>
              <td class="px-4 py-3 text-white/70 whitespace-nowrap uppercase text-xs font-bold">{{ player.secondary_role || '—' }}</td>
              <td class="px-4 py-3 text-white/90 max-w-[200px]">{{ player.playstyle }}</td>
              <td class="px-4 py-3 text-white/90 max-w-[200px]">{{ player.mindset }}</td>
              <td class="px-4 py-3">
                <div v-if="player.champion_pool?.length" class="flex flex-wrap items-center gap-1.5">
                  <div
                    v-for="champ in player.champion_pool"
                    :key="champ"
                    class="w-8 h-8 shrink-0 rounded-full overflow-hidden border border-mcu-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
                    :title="champ"
                  >
                    <img :src="getChampionSquare(champ)" class="w-full h-full object-cover" :alt="champ" />
                  </div>
                </div>
                <span v-else class="text-mcu-text-muted text-xs">—</span>
              </td>
              <td class="px-4 py-3 text-white/90 whitespace-nowrap font-bold">
                {{ getPlayerTeam(player) || '—' }}
              </td>
              <td class="px-4 py-3 text-right font-title">
                <span
                  v-if="player.fantasy_tier"
                  class="inline-block font-bold px-2 py-0.5 rounded border bg-black/40 backdrop-blur-sm"
                  :class="getFantasyTierBadgeClass(player.fantasy_tier)"
                >{{ player.fantasy_tier }}</span>
                <span v-else class="text-mcu-text-muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="text-center py-20 bg-mcu-surface/30 rounded-2xl border border-mcu-border border-dashed">
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
import { supabase } from '../lib/supabase';
import { getRankIconUrl } from '../utils/rankIcon';
import { getFantasyTierBadgeClass } from '../utils/tierStyles';
import type { Database } from '../types/supabase';

import topIcon from '../assets/top.png';
import jglIcon from '../assets/jgl.png';
import midIcon from '../assets/mid.png';
import adcIcon from '../assets/adc.png';
import supIcon from '../assets/support.png';

type Player = Database['public']['Tables']['players']['Row'] & {
  primary_role: string;
  secondary_role: string;
  rank: string;
  playstyle: string;
  mindset: string;
  champion_pool: string[];
  champion_signature: string;
  fantasy_tier?: string;
  team?: any;
  team_id?: string;
};

const players = ref<Player[]>([]);
const champions = ref<any[]>([]);
const teamsMap = ref<Map<string, string>>(new Map());
const loading = ref(true);

// Filters
const searchQuery = ref('');
const selectedRole = ref<string | null>(null);
const selectedRank = ref<string | null>(null);
const sortBy = ref('rank');

type PlayerViewMode = 'cards' | 'table';
const PLAYERS_VIEW_STORAGE_KEY = 'mcu_players_view';

const readStoredPlayerView = (): PlayerViewMode => {
  const raw = localStorage.getItem(PLAYERS_VIEW_STORAGE_KEY);
  if (!raw) return 'cards';
  return raw === 'table' ? 'table' : 'cards';
};

const playerView = ref<PlayerViewMode>(readStoredPlayerView());

const setPlayerView = (mode: PlayerViewMode) => {
  playerView.value = mode;
  localStorage.setItem(PLAYERS_VIEW_STORAGE_KEY, mode);
};

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
  
  const [playersRes, championsRes, teamsRes] = await Promise.all([
    getPlayers(),
    getChampions(),
    supabase.from('teams').select('id, name')
  ]);
  
  if (playersRes.data) {
    players.value = playersRes.data.filter((p: any) => p.participation_type && p.participation_type.toLowerCase() === 'joueur') as Player[];
  }
  
  if (championsRes.data) {
    champions.value = championsRes.data;
  }

  if (teamsRes.data) {
    teamsMap.value = new Map(teamsRes.data.map(t => [t.id, t.name]));
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

const getChampionSquare = (name: string) => {
  const champ = champions.value.find(c => c.name === name);
  return champ?.image_url || '';
};

const getChampionSplash = (name: string) => {
  const champ = champions.value.find(c => c.name === name);
  return champ?.splash_url || champ?.image_url || '';
};

const getPlayerTeam = (player: any) => {
  if (player.team?.name) return player.team.name;
  if (player.team) return player.team;
  if (player.team_id) return teamsMap.value.get(player.team_id);
  return null;
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
    // Priority role filtering: only match primary role
    result = result.filter(p => p.primary_role === selectedRole.value);
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
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
