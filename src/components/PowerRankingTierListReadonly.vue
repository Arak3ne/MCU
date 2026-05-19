<template>
  <div class="rounded-2xl border border-mcu-border bg-mcu-surface/40 overflow-hidden animate-fade-in-up">
    <div class="px-4 py-4 md:px-6 border-b border-mcu-border bg-mcu-surface/60 flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-lg font-title uppercase tracking-widest text-white">
            Power <span class="text-mcu-primary">Ranking</span>
          </h2>
          <p class="text-[11px] text-mcu-text-muted mt-1 uppercase tracking-wider">
            MCU Party
          </p>
        </div>
        <span class="text-[10px] font-bold uppercase tracking-widest text-mcu-text-muted bg-black/30 border border-mcu-border px-3 py-1.5 rounded-lg w-fit">
          {{ players.length }} joueur{{ players.length > 1 ? 's' : '' }}
        </span>
      </div>

      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="cat in POWER_RANKING_CATEGORIES"
          :key="cat.id"
          type="button"
          @click="activeCategory = cat.id"
          class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border"
          :class="
            activeCategory === cat.id
              ? 'bg-mcu-primary/20 border-mcu-primary text-mcu-primary'
              : 'bg-mcu-surface border-mcu-border text-mcu-text-muted hover:text-white hover:border-mcu-text-muted/50'
          "
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <div class="p-3 md:p-4 space-y-2">
      <div
        v-for="tier in POWER_RANKING_TIERS"
        :key="tier.id"
        class="flex bg-black/30 border border-mcu-border/80 rounded-xl overflow-hidden min-h-[88px]"
      >
        <div class="w-[56px] md:w-[72px] shrink-0 flex items-center justify-center relative bg-black/50 border-r border-mcu-border/60">
          <div
            class="absolute right-0 top-0 bottom-0 w-[2px]"
            :style="{ backgroundColor: tier.color, boxShadow: `0 0 12px ${tier.color}80` }"
          />
          <span
            class="text-3xl md:text-4xl font-title font-black z-10"
            :style="{ color: tier.color, textShadow: `0 0 20px ${tier.color}50` }"
          >
            {{ tier.id }}
          </span>
        </div>

        <div class="flex-1 flex flex-wrap content-start items-center gap-2 p-2.5 min-h-[88px]">
          <div
            v-for="player in groupedPlayers[tier.id]"
            :key="player.id"
            class="relative w-[76px] h-[76px] md:w-[82px] md:h-[82px] rounded-xl border border-mcu-border/80 bg-mcu-surface-light/80 overflow-hidden shrink-0 transition-transform hover:scale-[1.03] hover:border-mcu-primary/40"
            :title="playerCardTitle(player)"
          >
            <div
              class="absolute bottom-0 left-0 right-0 h-0.5"
              :style="{ backgroundColor: tier.color }"
            />

            <div
              v-if="player.power_ranking_tags?.length"
              class="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-mcu-primary shadow-[0_0_5px_rgba(34,197,94,0.6)] z-10"
              :title="player.power_ranking_tags.join(', ')"
            />

            <div
              v-if="getRoleIcon(player.primary_role)"
              class="absolute top-1 right-1 w-5 h-5 rounded-md bg-black/60 border border-mcu-border flex items-center justify-center z-10"
            >
              <img :src="getRoleIcon(player.primary_role)" class="w-3.5 h-3.5 opacity-90" alt="" />
            </div>

            <div class="absolute inset-0 p-1.5 flex flex-col items-center justify-between pb-1.5">
              <div class="w-10 h-10 mt-0.5 rounded-lg border border-mcu-border overflow-hidden bg-black/50 relative">
                <img
                  :src="getAvatarUrl(player)"
                  class="w-full h-full object-cover scale-[1.12]"
                  :alt="player.pseudo"
                />
                <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-mcu-surface rounded-full border border-mcu-border flex items-center justify-center p-[1px]">
                  <img
                    :src="getRankIconUrl(player.rank)"
                    class="w-full h-full"
                    :alt="player.rank"
                  />
                </div>
              </div>
              <p class="text-[11px] font-sans font-semibold text-white antialiased truncate w-full text-center leading-none px-0.5">
                {{ player.pseudo }}
              </p>
            </div>
          </div>

          <p
            v-if="!groupedPlayers[tier.id].length"
            class="text-[10px] text-mcu-text-muted uppercase tracking-widest px-2 py-1"
          >
            —
          </p>
        </div>
      </div>

      <div
        v-if="groupedPlayers.Unranked.length"
        class="flex bg-black/20 border border-dashed border-mcu-border/60 rounded-xl overflow-hidden min-h-[72px] mt-1"
      >
        <div class="w-[56px] md:w-[72px] shrink-0 flex items-center justify-center bg-black/40 border-r border-mcu-border/60">
          <span class="text-[10px] font-bold uppercase tracking-widest text-mcu-text-muted text-center leading-tight px-1">
            N/C
          </span>
        </div>
        <div class="flex-1 flex flex-wrap content-start items-center gap-2 p-2.5">
          <div
            v-for="player in groupedPlayers.Unranked"
            :key="player.id"
            class="relative w-[68px] h-[68px] rounded-xl border border-mcu-border/50 bg-mcu-surface/30 overflow-hidden shrink-0 opacity-80 hover:opacity-100 transition-opacity"
            :title="player.pseudo"
          >
            <div class="absolute inset-0 p-1.5 flex flex-col items-center justify-end">
              <div class="w-8 h-8 rounded-lg border border-mcu-border/50 overflow-hidden bg-black/40">
                <img :src="getAvatarUrl(player)" class="w-full h-full object-cover scale-[1.1]" alt="" />
              </div>
              <p class="text-[10px] font-sans font-semibold text-white/80 antialiased truncate w-full text-center leading-none mt-1 px-0.5">
                {{ player.pseudo }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Database } from '../types/supabase';
import { getRankIconUrl } from '../utils/rankIcon';
import { dicebearPortraitUrl } from '../lib/dicebear';
import { fetchPlayerAvatarConfigsByIds } from '../services/playerAvatarService';
import {
  POWER_RANKING_CATEGORIES,
  POWER_RANKING_TIERS,
  distributePlayersByTier,
  type PowerRankingCategoryId,
} from '../utils/powerRanking';
import topIcon from '../assets/top.png';
import jglIcon from '../assets/jgl.png';
import midIcon from '../assets/mid.png';
import adcIcon from '../assets/adc.png';
import supIcon from '../assets/support.png';

type Player = Database['public']['Tables']['players']['Row'] & {
  primary_role?: string;
  rank?: string;
  pseudo?: string;
};

const props = defineProps<{
  players: Player[];
}>();

const activeCategory = ref<PowerRankingCategoryId>('global');
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

const groupedPlayers = computed(() =>
  distributePlayersByTier(props.players, activeCategory.value)
);

const getRoleIcon = (role: string | null | undefined) => {
  const key = (role ?? '').toLowerCase().trim();
  return roleIconById[key] ?? '';
};

const getAvatarUrl = (player: Player) =>
  avatarUrlByPlayerId.value.get(player.id) ??
  dicebearPortraitUrl(undefined, player.pseudo || 'Joueur');

const playerCardTitle = (player: Player) => {
  const tags = player.power_ranking_tags?.length
    ? `\nTags: ${player.power_ranking_tags.join(', ')}`
    : '';
  return `${player.pseudo} · ${player.primary_role ?? '—'} · ${player.rank ?? '—'}${tags}`;
};

const preloadAvatars = async (list: Player[]) => {
  if (!list.length) {
    avatarUrlByPlayerId.value = new Map();
    return;
  }
  try {
    const rows = await fetchPlayerAvatarConfigsByIds(list.map((p) => p.id));
    const byPid = new Map(rows.map((r) => [r.player_id, r]));
    const urlMap = new Map<string, string>();
    for (const p of list) {
      urlMap.set(p.id, dicebearPortraitUrl(byPid.get(p.id), p.pseudo || 'Joueur'));
    }
    avatarUrlByPlayerId.value = urlMap;
  } catch {
    const urlMap = new Map<string, string>();
    for (const p of list) {
      urlMap.set(p.id, dicebearPortraitUrl(undefined, p.pseudo || 'Joueur'));
    }
    avatarUrlByPlayerId.value = urlMap;
  }
};

onMounted(() => preloadAvatars(props.players));
watch(
  () => props.players.map((p) => p.id).join(','),
  () => preloadAvatars(props.players)
);
</script>
