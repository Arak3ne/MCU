<template>
  <div
    class="relative min-h-[300px] cursor-pointer group perspective-1000"
    @click="emit('flip')"
  >
    <!-- Card inner (flip 3D — même pattern que FantasyScoreReveal) -->
    <div
      class="w-full min-h-[300px] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform-style-3d relative rounded-2xl"
      :class="innerFlipClass"
    >
      <!-- Glow attaché à la carte 3D -->
      <div
        class="absolute inset-0 rounded-2xl pointer-events-none transition-shadow duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] [transform:translateZ(-1px)]"
        :class="cardGlowClass"
      />

      <!-- Recto -->
      <div
        class="absolute inset-0 rounded-2xl overflow-hidden border border-mcu-border/70 bg-gradient-to-br from-[#1A1A1A] to-[#0B0F0C] flex flex-col backface-hidden isolate"
      >
        <div
          class="absolute inset-0 rounded-2xl border-2 pointer-events-none z-50 transition-colors duration-500 mix-blend-overlay"
          :class="cardBorderClass"
        />

        <!-- Glare dynamique -->
        <div
          class="absolute -inset-[100%] z-40 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none [transform:translateZ(1px)_translateX(-50%)_translateY(50%)] group-hover:[transform:translateZ(1px)_translateX(50%)_translateY(-50%)]"
        />

        <img
          :src="championSplash"
          class="absolute inset-0 w-full h-full object-cover object-top opacity-55 scale-[1.06] transition-transform duration-700 group-hover:scale-110"
          alt=""
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#0B0F0C] via-[#0B0F0C]/72 to-transparent" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0B0F0C_100%)] opacity-80" />

        <div class="relative z-10 flex flex-col h-full min-h-[300px]">
          <div class="relative h-40 overflow-hidden shrink-0">
            <div class="absolute bottom-3 left-4 right-4 z-20 flex justify-between items-end">
              <div class="min-w-0">
                <h3 class="text-xl font-title tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate">
                  {{ player.pseudo }}
                </h3>
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <div
                    class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/50 text-mcu-primary border border-mcu-primary/30 backdrop-blur-sm shadow-inner"
                    :title="player.rank ?? ''"
                  >
                    <img :src="getRankIconUrl(player.rank)" class="w-4 h-4 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]" :alt="player.rank ?? ''" />
                    <span class="text-[10px] font-bold uppercase tracking-wider">{{ player.rank }}</span>
                  </div>
                  <span
                    v-if="player.fantasy_tier"
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/50 border backdrop-blur-sm"
                    :class="getFantasyTierBadgeClass(player.fantasy_tier)"
                  >
                    Tier {{ player.fantasy_tier }}
                  </span>
                  <span
                    v-if="teamName"
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white border border-white/30 backdrop-blur-sm truncate max-w-[100px]"
                    :title="teamName"
                  >
                    {{ teamName }}
                  </span>
                </div>
              </div>

              <div class="flex gap-1 shrink-0">
                <div class="w-8 h-8 rounded-full bg-black/60 border border-mcu-border flex items-center justify-center backdrop-blur-sm" title="Rôle Principal">
                  <img :src="roleIcon(player.primary_role)" class="w-5 h-5 invert-[.5] sepia-[1] hue-rotate-[90deg] saturate-[5]" alt="" />
                </div>
                <div
                  v-if="player.secondary_role"
                  class="w-8 h-8 rounded-full bg-black/60 border border-mcu-border flex items-center justify-center backdrop-blur-sm"
                  title="Rôle Secondaire"
                >
                  <img :src="roleIcon(player.secondary_role)" class="w-5 h-5 invert-[.5] sepia-[1] hue-rotate-[190deg] saturate-[5]" alt="" />
                </div>
              </div>
            </div>
          </div>

          <div class="relative p-4 space-y-4 flex-1">
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
              <div class="flex gap-2 flex-wrap">
                <div
                  v-for="champ in player.champion_pool"
                  :key="champ"
                  class="w-8 h-8 rounded-full overflow-hidden border border-mcu-border/80 relative group/champ shadow-[0_6px_18px_rgba(0,0,0,0.6)]"
                >
                  <img :src="championSquare(champ)" class="w-full h-full object-cover" :title="champ" :alt="champ" />
                  <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/champ:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px] pointer-events-none">
                    <span class="text-[8px] font-bold text-white truncate px-1">{{ champ.substring(0, 3) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Verso — Power Ranking -->
      <div
        class="absolute inset-0 rounded-2xl overflow-hidden border border-mcu-border/70 bg-gradient-to-b from-[#1A1A1A] to-[#0B0F0C] flex flex-col backface-hidden [transform:rotateY(180deg)] isolate"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-mcu-primary/5 to-transparent pointer-events-none" />
        <div
          class="absolute inset-0 opacity-25 pointer-events-none"
          :style="{
            background: `radial-gradient(circle at 80% 20%, ${globalTierColor}40 0%, transparent 55%)`,
          }"
        />

        <!-- Glare dynamique -->
        <div
          class="absolute -inset-[100%] z-40 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none [transform:translateZ(1px)_translateX(-50%)_translateY(50%)] group-hover:[transform:translateZ(1px)_translateX(50%)_translateY(-50%)]"
        />

        <div class="relative z-10 p-3 flex flex-col h-full min-h-[300px] min-h-0 overflow-hidden">
          <div class="shrink-0 text-center pb-2 border-b border-mcu-border/50">
            <p class="text-[8px] font-bold uppercase tracking-[0.25em] text-mcu-primary">Power Ranking</p>
            <h3 class="text-sm font-title tracking-wider text-white truncate leading-tight mt-0.5">{{ player.pseudo }}</h3>
          </div>

          <div
            class="shrink-0 mt-2.5 rounded-xl border overflow-hidden relative flex flex-col items-center justify-center py-3 px-3"
            :style="globalHeroContainerStyle"
          >
            <div
              class="absolute left-0 top-0 bottom-0 w-1"
              :style="{ backgroundColor: globalTierColor, boxShadow: `0 0 12px ${globalTierColor}80` }"
            />
            <span class="text-[8px] font-bold uppercase tracking-[0.2em] text-white/45 mb-1">Tier global</span>
            <span
              v-if="globalTier"
              class="font-title text-4xl font-black leading-none"
              :style="tierHeroStyle(globalTier)"
            >
              {{ globalTier }}
            </span>
            <span
              v-else
              class="text-[11px] font-bold uppercase tracking-widest text-mcu-text-muted"
            >
              Non classé
            </span>
          </div>

          <div class="grid grid-cols-2 gap-1.5 flex-1 min-h-0 content-start mt-2.5 auto-rows-min">
            <div
              v-for="cat in subCategories"
              :key="cat.id"
              class="rounded-lg bg-white/[0.04] border border-white/[0.06] px-2 py-1.5 flex items-center justify-between gap-1 min-w-0"
            >
              <span
                class="text-[8px] font-bold uppercase tracking-wider text-white/55 truncate leading-tight"
                :title="cat.label"
              >
                {{ categoryShortLabel(cat.id) }}
              </span>
              <span
                v-if="tiersByCategory[cat.id]"
                class="shrink-0 w-5 h-5 rounded flex items-center justify-center font-title text-[11px] font-black border leading-none"
                :style="tierBadgeStyleCompact(tiersByCategory[cat.id])"
              >
                {{ tiersByCategory[cat.id] }}
              </span>
              <span
                v-else
                class="shrink-0 text-[7px] font-bold text-mcu-text-muted/80 uppercase"
              >
                —
              </span>
            </div>
          </div>

          <p class="shrink-0 text-[7px] text-mcu-text-muted/80 text-center uppercase tracking-widest pt-2 mt-auto">
            Cliquez pour retourner
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Database } from '../types/supabase';
import { getRankIconUrl } from '../utils/rankIcon';
import { getFantasyTierBadgeClass } from '../utils/tierStyles';
import {
  POWER_RANKING_CATEGORIES,
  getPlayerTierForCategory,
  getPowerRankingTierColor,
  normalizePowerRankingTier,
  type PowerRankingCategoryId,
  type PowerRankingLetterTier,
} from '../utils/powerRanking';
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
  team?: { name?: string } | string;
  team_id?: string;
};

type Champion = { name: string; image_url?: string; splash_url?: string };

const props = defineProps<{
  player: Player;
  champions: Champion[];
  teamName?: string | null;
  flipped?: boolean;
}>();

const emit = defineEmits<{ flip: [] }>();

/** Même transforms que FantasyScoreReveal (match terminé). */
const innerFlipClass = computed(() =>
  props.flipped
    ? '[transform:rotateY(180deg)] group-hover:[transform:rotateX(10deg)_rotateY(160deg)_rotateZ(3deg)_translateY(-12px)_scale(1.05)] shadow-[0_20px_40px_rgba(0,0,0,0.6)] group-hover:shadow-[25px_35px_50px_rgba(0,0,0,0.7)]'
    : '[transform:rotateY(0deg)] group-hover:[transform:rotateX(10deg)_rotateY(20deg)_rotateZ(-3deg)_translateY(-12px)_scale(1.05)] shadow-[0_20px_40px_rgba(0,0,0,0.6)] group-hover:shadow-[-25px_35px_50px_rgba(0,0,0,0.7)]'
);

const cardGlowClass = computed(() => {
  const tier = normalizePowerRankingTier(props.player.fantasy_tier);
  switch (tier) {
    case 'S':
      return 'shadow-[0_0_40px_rgba(249,115,22,0.18)] group-hover:shadow-[0_0_60px_rgba(249,115,22,0.28)]';
    case 'A':
      return 'shadow-[0_0_40px_rgba(234,179,8,0.18)] group-hover:shadow-[0_0_60px_rgba(234,179,8,0.28)]';
    case 'B':
      return 'shadow-[0_0_40px_rgba(34,197,94,0.18)] group-hover:shadow-[0_0_60px_rgba(34,197,94,0.28)]';
    case 'C':
      return 'shadow-[0_0_40px_rgba(59,130,246,0.18)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.28)]';
    case 'D':
      return 'shadow-[0_0_40px_rgba(168,85,247,0.18)] group-hover:shadow-[0_0_60px_rgba(168,85,247,0.28)]';
    default:
      return 'shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.7)]';
  }
});

const cardBorderClass = computed(() => {
  const tier = normalizePowerRankingTier(props.player.fantasy_tier);
  switch (tier) {
    case 'S':
      return 'border-orange-500/40';
    case 'A':
      return 'border-yellow-500/40';
    case 'B':
      return 'border-mcu-primary/40';
    case 'C':
      return 'border-blue-500/40';
    case 'D':
      return 'border-purple-500/40';
    default:
      return 'border-mcu-border/90';
  }
});

const roleIconById: Record<string, string> = {
  top: topIcon,
  jungle: jglIcon,
  jgl: jglIcon,
  mid: midIcon,
  adc: adcIcon,
  support: supIcon,
  sup: supIcon,
};

const roleIcon = (role: string | null | undefined) => {
  const key = (role ?? '').toLowerCase().trim();
  return roleIconById[key] ?? '';
};

const championSplash = computed(() => {
  const champ = props.champions.find((c) => c.name === props.player.champion_signature);
  return champ?.splash_url || champ?.image_url || '';
});

const championSquare = (name: string) => {
  const champ = props.champions.find((c) => c.name === name);
  return champ?.image_url || '';
};

const subCategories = POWER_RANKING_CATEGORIES.filter((c) => c.id !== 'global');

const categoryShortLabel = (id: PowerRankingCategoryId): string => {
  const labels: Record<PowerRankingCategoryId, string> = {
    skill: 'Skill',
    champion_pool: 'Pool',
    teamplay: 'Team',
    mental: 'Mental',
    global: 'Global',
  };
  return labels[id];
};

const tiersByCategory = computed(() => {
  const map = {} as Record<PowerRankingCategoryId, PowerRankingLetterTier | null>;
  for (const cat of POWER_RANKING_CATEGORIES) {
    map[cat.id] = getPlayerTierForCategory(props.player as Record<string, unknown>, cat.id);
  }
  return map;
});

const globalTier = computed(() => tiersByCategory.value.global);

const globalTierColor = computed(() => getPowerRankingTierColor(globalTier.value ?? props.player.fantasy_tier));

const globalHeroContainerStyle = computed(() => {
  const color = globalTierColor.value;
  return {
    borderColor: `${color}40`,
    background: `linear-gradient(135deg, ${color}12 0%, rgba(0,0,0,0.35) 55%, rgba(11,15,12,0.9) 100%)`,
    boxShadow: globalTier.value ? `0 0 24px ${color}18, inset 0 1px 0 ${color}20` : undefined,
  };
});

const tierHeroStyle = (tier: PowerRankingLetterTier) => {
  const color = getPowerRankingTierColor(tier);
  return {
    color,
    textShadow: `0 0 28px ${color}70, 0 2px 8px rgba(0,0,0,0.8)`,
  };
};

const tierBadgeStyleCompact = (tier: PowerRankingLetterTier | null) => {
  if (!tier) return {};
  const color = getPowerRankingTierColor(tier);
  return {
    color,
    borderColor: `${color}55`,
    backgroundColor: `${color}14`,
  };
};
</script>

<style scoped>
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
</style>
