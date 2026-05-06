<template>
  <div class="power-ranking-container relative w-full h-screen bg-[#050505] text-white overflow-hidden flex flex-col font-sans select-none">
    <!-- Background ambient effects -->
    <div class="absolute inset-0 pointer-events-none z-0">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-mcu-primary/20 blur-[120px] rounded-full mix-blend-screen"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80"></div>
    </div>

    <!-- Header -->
    <header class="flex-none h-[80px] bg-black/40 backdrop-blur-2xl border-b border-white/5 px-8 flex items-center justify-between z-20 relative">
      <div class="flex items-center gap-8">
        <!-- Logo / Title -->
        <div class="flex flex-col">
          <h1 class="text-2xl font-title uppercase tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] leading-none">
            Power <span class="text-mcu-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">Ranking</span>
          </h1>
          <span class="text-[10px] uppercase tracking-[0.3em] text-white/50 mt-1">MCU Party</span>
        </div>
        
        <!-- Categories Tabs -->
        <div class="flex gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="selectCategory(cat.id)"
            class="px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all relative overflow-hidden"
            :class="activeCategory === cat.id ? 'text-black shadow-lg' : 'text-white/50 hover:text-white/90 hover:bg-white/5'"
          >
            <div v-if="activeCategory === cat.id" class="absolute inset-0 bg-gradient-to-r from-mcu-primary to-[#4ade80]"></div>
            <span class="relative z-10">{{ cat.label }}</span>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <!-- Role Filter -->
        <div class="flex gap-1 bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
          <button
            v-for="r in roleFilters"
            :key="r.id"
            @click="selectRole(r.id)"
            class="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
            :class="activeRole === r.id ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80 hover:bg-white/5'"
          >
            {{ r.label }}
          </button>
        </div>

        <!-- Save Button -->
        <button 
          @click="saveRankings" 
          :disabled="isSaving"
          class="px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all flex items-center gap-2 border border-mcu-primary/30 relative overflow-hidden group"
          :class="isSaving ? 'bg-mcu-primary/10 text-mcu-primary/50 cursor-not-allowed' : 'bg-mcu-primary/10 text-mcu-primary hover:border-mcu-primary hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]'"
        >
          <div v-if="!isSaving" class="absolute inset-0 bg-mcu-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <svg v-if="isSaving" class="animate-spin h-3.5 w-3.5 relative z-10" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-3.5 h-3.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="relative z-10">{{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}</span>
        </button>
      </div>
    </header>

    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center relative z-10">
      <div class="relative w-24 h-24 mb-6">
        <div class="absolute inset-0 border-[3px] border-white/5 rounded-full"></div>
        <div class="absolute inset-0 border-[3px] border-mcu-primary rounded-full border-t-transparent animate-spin shadow-[0_0_20px_rgba(34,197,94,0.4)]"></div>
        <div class="absolute inset-3 border-[3px] border-mcu-primary/40 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
      </div>
      <p class="text-mcu-primary uppercase tracking-[0.3em] text-sm font-bold animate-pulse drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">Initialisation</p>
    </div>

    <!-- Main Content -->
    <div v-else class="flex-1 flex p-6 gap-6 relative z-10 min-h-0 overflow-hidden">
      
      <!-- Tier Rows (Left Side) -->
      <div class="flex-1 flex flex-col gap-2 min-w-0 min-h-0">
        <div 
          v-for="tier in tiers" 
          :key="tier.id"
          class="flex-1 flex bg-[#0f0f13]/80 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl relative group shadow-2xl min-h-0"
        >
          <!-- Subtle hover glow on tier row -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" :style="{ background: `radial-gradient(circle at 10% 50%, ${tier.color}15 0%, transparent 50%)` }"></div>

          <!-- Tier Label -->
          <div class="w-[100px] flex flex-col items-center justify-center relative shrink-0 overflow-hidden bg-black/40">
            <div class="absolute inset-0 opacity-[0.03]" :style="{ backgroundColor: tier.color }"></div>
            <!-- Neon line -->
            <div class="absolute right-0 top-0 bottom-0 w-[2px]" :style="{ backgroundColor: tier.color, boxShadow: `0 0 15px ${tier.color}` }"></div>
            <!-- Letter -->
            <span class="text-6xl font-title font-black drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] z-10 transition-transform duration-300 group-hover:scale-110" :style="{ color: tier.color, textShadow: `0 0 30px ${tier.color}40` }">
              {{ tier.id }}
            </span>
          </div>
          
          <!-- Drop Zone -->
          <VueDraggable
            v-model="groupedPlayers[tier.id]"
            :group="{ name: 'players' }"
            class="flex-1 flex flex-wrap content-center items-center p-2.5 gap-2 overflow-y-auto custom-scrollbar"
            :animation="150"
            ghost-class="power-ranking-ghost"
            :data-id-attr="'data-player-id'"
            @end="handleDragEnd"
          >
            <div
              v-for="player in groupedPlayers[tier.id]"
              :key="player.id"
              class="relative w-[85px] h-[85px] bg-[#1a1a24]/80 rounded-xl border border-white/10 overflow-hidden cursor-grab active:cursor-grabbing hover:border-white/30 transition-colors transition-shadow duration-200 hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] group/card shrink-0"
              :data-player-id="player.id"
              @contextmenu.prevent="openTagsMenu($event, player)"
            >
              <!-- Clean card surface (no splash background) -->
              <div class="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/40"></div>
              
              <!-- Accent Line -->
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-mcu-primary/40 group-hover/card:bg-mcu-primary transition-colors"></div>

              <!-- Content -->
              <div class="absolute inset-0 p-1.5 flex flex-col items-center justify-between pb-1.5">
                <!-- Tags indicator (dot) -->
                <div v-if="player.power_ranking_tags && player.power_ranking_tags.length" class="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-mcu-primary shadow-[0_0_5px_rgba(34,197,94,0.6)]"></div>

                <!-- Role icon -->
                <div v-if="getRoleIcon(player.primary_role)" class="absolute top-1 right-1 w-5 h-5 rounded-md bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                  <img :src="getRoleIcon(player.primary_role)" class="w-3.5 h-3.5 opacity-90" alt="" />
                </div>

                <!-- Avatar container -->
                <div class="w-11 h-11 mt-1 rounded-lg border border-white/10 overflow-hidden bg-black/50 relative shadow-inner">
                  <img :src="getAvatarUrl(player)" class="w-full h-full object-cover scale-[1.15]" />
                  <!-- Rank overlay bottom right -->
                  <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0f0f13] rounded-full border border-white/10 flex items-center justify-center p-[2px] backdrop-blur-sm shadow-xl z-10">
                    <img :src="getRankIconUrl(player.rank)" class="w-full h-full drop-shadow-md relative z-10" :alt="player.rank" />
                  </div>
                </div>
                
                <h3 class="text-[10px] font-sans font-bold tracking-wide text-white/90 truncate w-full text-center drop-shadow-md group-hover/card:text-white transition-colors mt-1">{{ player.pseudo }}</h3>
              </div>
            </div>
          </VueDraggable>
        </div>
      </div>

      <!-- Unranked Pool Sidebar (Right Side) -->
      <div class="w-[320px] bg-[#0f0f13]/60 border border-white/5 rounded-2xl backdrop-blur-md shrink-0 flex flex-col p-4 shadow-2xl relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        
        <div class="flex flex-col gap-1 mb-4 relative z-10">
          <div class="flex justify-between items-center">
            <h2 class="text-sm font-title tracking-[0.2em] text-white/60 uppercase">Player Pool</h2>
            <span class="text-[10px] font-bold text-white/80 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              {{ groupedPlayers['Unranked']?.length || 0 }}
            </span>
          </div>
          <div class="text-[10px] text-white/30 uppercase tracking-[0.1em]">
            {{ filteredPlayers.length }} affichés
          </div>
        </div>
        
        <VueDraggable
          v-model="groupedPlayers['Unranked']"
          :group="{ name: 'players' }"
          class="flex-1 flex flex-wrap content-start gap-2.5 overflow-y-auto custom-scrollbar relative z-10 pr-1 pb-1"
          :animation="150"
          ghost-class="power-ranking-ghost"
          :data-id-attr="'data-player-id'"
          @end="handleDragEnd"
        >
          <div 
            v-for="player in groupedPlayers['Unranked']"
            :key="player.id"
            class="relative w-[70px] h-[70px] bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors duration-200 hover:bg-white/[0.05] shrink-0"
            :data-player-id="player.id"
            @contextmenu.prevent="openTagsMenu($event, player)"
          >
            <div class="absolute inset-0 p-1.5 flex flex-col items-center justify-between pb-1.5">
              <!-- Role icon -->
              <div v-if="getRoleIcon(player.primary_role)" class="absolute top-1 right-1 w-5 h-5 rounded-md bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <img :src="getRoleIcon(player.primary_role)" class="w-3.5 h-3.5 opacity-90" alt="" />
              </div>

              <div class="w-9 h-9 rounded-lg border border-white/5 bg-black/60 overflow-hidden relative shadow-inner mt-0.5">
                <img :src="getAvatarUrl(player)" class="w-full h-full object-cover scale-[1.15] opacity-90" />
              </div>
              <h3 class="text-[9px] font-sans font-bold tracking-wide text-white/70 truncate w-full text-center">{{ player.pseudo }}</h3>
            </div>
          </div>
        </VueDraggable>
      </div>

    </div>

    <!-- Tags Context Menu -->
    <div 
      v-if="showTagsMenu"
      class="absolute z-50 bg-[#121218]/95 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-2 w-52 backdrop-blur-2xl"
      :style="{ top: menuY + 'px', left: menuX + 'px' }"
    >
      <div class="px-4 py-2.5 border-b border-white/5 mb-2 flex items-center gap-2">
        <div class="w-1.5 h-1.5 rounded-full bg-mcu-primary"></div>
        <span class="text-[10px] font-bold uppercase tracking-widest text-white/50 truncate">Tags de {{ selectedPlayer?.pseudo }}</span>
      </div>
      
      <div class="max-h-64 overflow-y-auto px-2 custom-scrollbar">
        <button
          v-for="tag in availableTags"
          :key="tag"
          @click="toggleTag(tag)"
          class="w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex justify-between items-center transition-all mb-0.5"
          :class="hasTag(tag) ? 'bg-mcu-primary/10 text-mcu-primary' : 'hover:bg-white/5 text-white/70 hover:text-white'"
        >
          {{ tag }}
          <svg v-if="hasTag(tag)" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
      
      <div class="fixed inset-0 z-[-1]" @click="closeTagsMenu"></div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { getPlayers } from '../../lib/queries';
import { supabase } from '../../lib/supabase';
import { getRankIconUrl } from '../../utils/rankIcon';
import type { Database } from '../../types/supabase';
import { dicebearPortraitUrl } from '../../lib/dicebear';
import { fetchPlayerAvatarConfigsByIds } from '../../services/playerAvatarService';
import topIcon from '../../assets/top.png';
import jglIcon from '../../assets/jgl.png';
import midIcon from '../../assets/mid.png';
import adcIcon from '../../assets/adc.png';
import supIcon from '../../assets/support.png';

type Player = Database['public']['Tables']['players']['Row'] & {
  primary_role?: string;
  rank?: string;
  champion_signature?: string;
};

type TierLetter = 'S' | 'A' | 'B' | 'C' | 'D';

// State
const loading = ref(true);
const isSaving = ref(false);
const players = ref<Player[]>([]);
const champions = ref<any[]>([]);
const avatarUrlByPlayerId = ref<Map<string, string>>(new Map());

const roleIconById: Record<string, string> = {
  top: topIcon,
  jungle: jglIcon,
  jgl: jglIcon,
  mid: midIcon,
  adc: adcIcon,
  support: supIcon,
  sup: supIcon,
};

const getRoleIcon = (role: string | null | undefined) => {
  const key = (role ?? '').toLowerCase().trim();
  return roleIconById[key] ?? '';
};

// Role filters
const roleFilters = [
  { id: 'all', label: 'Tous' },
  { id: 'top', label: 'Top' },
  { id: 'jungle', label: 'Jungle' },
  { id: 'mid', label: 'Mid' },
  { id: 'adc', label: 'ADC' },
  { id: 'support', label: 'Support' },
];
const activeRole = ref<string>('all');

// Categories
const categories = [
  { id: 'skill', label: 'Skill Individuel', column: 'tier_skill' },
  { id: 'champion_pool', label: 'Champion Pool', column: 'tier_champion_pool' },
  { id: 'game_knowledge', label: 'Game Knowledge', column: 'tier_game_knowledge' },
  { id: 'teamplay', label: 'Teamplay', column: 'tier_teamplay' },
  { id: 'mental', label: 'Mental / Clutch', column: 'tier_mental' },
  { id: 'global', label: 'Global', column: 'fantasy_tier' },
];
const activeCategory = ref(categories[0].id);

// Tiers config (Premium palette)
const tiers = [
  { id: 'G', color: '#ef4444' }, // Red
  { id: 'S', color: '#f97316' }, // Orange
  { id: 'A', color: '#eab308' }, // Yellow
  { id: 'B', color: '#22c55e' }, // Green
  { id: 'C', color: '#3b82f6' }, // Blue
  { id: 'D', color: '#8b5cf6' }, // Purple
];

// Data model for DnD: Record<tierId, Player[]>
const groupedPlayers = ref<Record<string, Player[]>>({
  'G': [], 'S': [], 'A': [], 'B': [], 'C': [], 'D': [], 'Unranked': []
});

// Tags Menu
const showTagsMenu = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const selectedPlayer = ref<Player | null>(null);

const availableTags = [
  'Overrated', 'Underrated', 'Coin Flip', 'Clutch', 'Choke', '1v9', 'Toxic', 'Shotcaller', 'OTP', 'Solid', 'Washed Up'
];

onMounted(async () => {
  document.body.style.overflow = 'hidden'; // Lock scrolling for stream view
  await loadData();
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

const loadData = async () => {
  loading.value = true;
  const [playersRes, champsRes] = await Promise.all([
    getPlayers(),
    supabase.from('champions').select('*').order('name', { ascending: true })
  ]);
  
  if (champsRes.data) {
    champions.value = champsRes.data as any[];
  }
  
  if (playersRes.data) {
    // Only keep participants who are players
    players.value = playersRes.data.filter((p: any) => p.participation_type?.toLowerCase() === 'joueur') as Player[];

    // Preload avatar urls (Dicebear)
    try {
      const ids = players.value.map((p) => p.id);
      const rows = await fetchPlayerAvatarConfigsByIds(ids);
      const byPid = new Map(rows.map((r) => [r.player_id, r]));
      const urlMap = new Map<string, string>();
      for (const p of players.value) {
        urlMap.set(p.id, dicebearPortraitUrl(byPid.get(p.id), p.pseudo || p.riot_id || 'Joueur'));
      }
      avatarUrlByPlayerId.value = urlMap;
    } catch (e) {
      console.warn('Avatar URL cache:', e);
      // Fallback: seed-only URLs (still stable) if avatar config fetch fails
      const urlMap = new Map<string, string>();
      for (const p of players.value) {
        urlMap.set(p.id, dicebearPortraitUrl(undefined, p.pseudo || p.riot_id || 'Joueur'));
      }
      avatarUrlByPlayerId.value = urlMap;
    }
    
    // Initialize groups for the first category
    distributePlayers(activeCategory.value);
  }
  loading.value = false;
};

const getAvatarUrl = (player: Player) => {
  return avatarUrlByPlayerId.value.get(player.id) ?? dicebearPortraitUrl(undefined, player.pseudo || player.riot_id || 'Joueur');
};

const filteredPlayers = computed(() => {
  if (activeRole.value === 'all') return players.value;
  return players.value.filter((p) => (p.primary_role ?? '').toLowerCase() === activeRole.value);
});

const getCategoryColumn = (categoryId: string) => {
  const cat = categories.find(c => c.id === categoryId);
  return cat ? cat.column : 'fantasy_tier';
};

const distributePlayers = (categoryId: string) => {
  const col = getCategoryColumn(categoryId);
  
  // Reset groups
  groupedPlayers.value = {
    'G': [], 'S': [], 'A': [], 'B': [], 'C': [], 'D': [], 'Unranked': []
  };
  
  filteredPlayers.value.forEach(p => {
    let tierVal = (p as any)[col];
    
    // Normalize tier value
    if (tierVal) tierVal = tierVal.toUpperCase().trim();
    
    if (tierVal && groupedPlayers.value[tierVal]) {
      groupedPlayers.value[tierVal].push(p);
    } else {
      groupedPlayers.value['Unranked'].push(p);
    }
  });
  
  // Sort Unranked by rank/name maybe?
  groupedPlayers.value['Unranked'].sort((a, b) => a.pseudo.localeCompare(b.pseudo));
};

const normalizeTierForDb = (t: unknown): TierLetter | null => {
  const v = String(t ?? '').toUpperCase().trim();
  if (!v) return null;
  // UI has 'G' but DB doesn't: map it to 'S'
  if (v === 'G') return 'S';
  if (v === 'S' || v === 'A' || v === 'B' || v === 'C' || v === 'D') return v;
  return null;
};

const tierToScore: Record<TierLetter, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };
const scoreToTier: Record<number, TierLetter> = { 5: 'S', 4: 'A', 3: 'B', 2: 'C', 1: 'D' };

const computeGlobalTierIfComplete = (p: Player): TierLetter | null => {
  const vals: Array<TierLetter | null> = [
    normalizeTierForDb(p.tier_skill),
    normalizeTierForDb(p.tier_champion_pool),
    normalizeTierForDb(p.tier_game_knowledge),
    normalizeTierForDb(p.tier_teamplay),
    normalizeTierForDb(p.tier_mental),
  ];

  if (vals.some((v) => v == null)) return null;
  const scores = vals as TierLetter[];
  const avg = scores.reduce((sum, t) => sum + tierToScore[t], 0) / scores.length;
  const rounded = Math.max(1, Math.min(5, Math.round(avg)));
  return scoreToTier[rounded] ?? null;
};

const recomputeGlobalsInMemory = () => {
  for (const p of players.value) {
    const global = computeGlobalTierIfComplete(p);
    if (global) (p as any).fantasy_tier = global;
  }
};

const selectRole = (roleId: string) => {
  if (activeRole.value === roleId) return;
  // Keep current category distribution in memory (for all players) before filtering
  saveCurrentDistributionToMemory();
  activeRole.value = roleId;
  distributePlayers(activeCategory.value);
};

const selectCategory = (categoryId: string) => {
  if (activeCategory.value === categoryId) return;
  
  // Save current category state to local memory before switching
  saveCurrentDistributionToMemory();
  
  activeCategory.value = categoryId;
  distributePlayers(categoryId);
};

const saveCurrentDistributionToMemory = () => {
  const col = getCategoryColumn(activeCategory.value);
  
  Object.keys(groupedPlayers.value).forEach(tierId => {
    const list = groupedPlayers.value[tierId];
    list.forEach(p => {
      let realTier = tierId === 'Unranked' ? null : tierId;
      // Database has no 'G' tier, it maps to 'S' tier
      if (realTier === 'G') realTier = 'S';
      
      // Update in local memory
      const playerIndex = players.value.findIndex(pl => pl.id === p.id);
      if (playerIndex !== -1) {
        (players.value[playerIndex] as any)[col] = realTier;
      }
    });
  });
};

const saveRankings = async () => {
  isSaving.value = true;
  
  // Flush current view to memory first
  saveCurrentDistributionToMemory();
  // Ensure global tier is up-to-date before persisting
  recomputeGlobalsInMemory();
  
  try {
    const updates = players.value.map(p => ({
      id: p.id,
      fantasy_tier: (p as any).fantasy_tier,
      tier_skill: p.tier_skill,
      tier_champion_pool: p.tier_champion_pool,
      tier_game_knowledge: p.tier_game_knowledge,
      tier_teamplay: p.tier_teamplay,
      tier_mental: p.tier_mental,
      power_ranking_tags: p.power_ranking_tags || []
    }));
    
    const promises = updates.map(u => 
      supabase.from('players').update({
        fantasy_tier: u.fantasy_tier,
        tier_skill: u.tier_skill,
        tier_champion_pool: u.tier_champion_pool,
        tier_game_knowledge: u.tier_game_knowledge,
        tier_teamplay: u.tier_teamplay,
        tier_mental: u.tier_mental,
        power_ranking_tags: u.power_ranking_tags
      }).eq('id', u.id)
    );
    
    await Promise.all(promises);
    
    console.log('Saved successfully!');
  } catch (e) {
    console.error('Error saving rankings:', e);
  } finally {
    isSaving.value = false;
  }
};

const handleDragEnd = () => {
  // Persist the current UI distribution into local player memory
  saveCurrentDistributionToMemory();

  // After rating any category, if all 5 categories are filled, compute global immediately
  if (activeCategory.value !== 'global') {
    recomputeGlobalsInMemory();
  }

  // If the user is currently looking at Global, refresh placement immediately
  if (activeCategory.value === 'global') {
    distributePlayers('global');
  }
};

// Context Menu Methods
const openTagsMenu = (event: MouseEvent, player: Player) => {
  selectedPlayer.value = player;
  showTagsMenu.value = true;
  
  let x = event.clientX;
  let y = event.clientY;
  
  if (x + 200 > window.innerWidth) x = window.innerWidth - 200;
  if (y + 300 > window.innerHeight) y = window.innerHeight - 300;
  
  menuX.value = x;
  menuY.value = y;
};

const closeTagsMenu = () => {
  showTagsMenu.value = false;
  selectedPlayer.value = null;
};

const hasTag = (tag: string) => {
  if (!selectedPlayer.value) return false;
  return selectedPlayer.value.power_ranking_tags?.includes(tag) || false;
};

const toggleTag = (tag: string) => {
  if (!selectedPlayer.value) return;
  
  if (!selectedPlayer.value.power_ranking_tags) {
    selectedPlayer.value.power_ranking_tags = [];
  }
  
  const index = selectedPlayer.value.power_ranking_tags.indexOf(tag);
  if (index !== -1) {
    selectedPlayer.value.power_ranking_tags.splice(index, 1);
  } else {
    selectedPlayer.value.power_ranking_tags.push(tag);
  }
};

// Helpers
const getChampionSplash = (name: string) => {
  const champ = champions.value.find(c => c.name === name);
  return champ?.splash_url || champ?.image_url || '';
};

const getChampionSquare = (name: string) => {
  const champ = champions.value.find(c => c.name === name);
  return champ?.image_url || '';
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 197, 94, 0.3);
}

.power-ranking-ghost {
  opacity: 0.2;
  transform: scale(0.95);
  box-shadow: none !important;
}
</style>
