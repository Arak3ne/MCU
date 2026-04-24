<template>
  <div class="champion-grid-container p-4">
    <div
      class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 md:gap-4"
    >
      <div
        v-for="champion in champions"
        :key="champion.id"
        @click="toggleChampion(champion)"
        class="relative rounded-sm overflow-hidden border transition-all duration-300 group flex flex-col aspect-square bg-[#1A1A1A]"
        :class="[
          champion.is_available
            ? 'border-[#2A2A2A] hover:border-[#22C55E] shadow-lg hover:shadow-[0_0_15px_rgba(200,170,110,0.3)] hover:-translate-y-1'
            : 'border-red-900/50 opacity-50 grayscale-[0.8] hover:grayscale-[0.5] hover:opacity-80 hover:border-red-500/50',
          isAdmin ? 'cursor-pointer' : 'cursor-default pointer-events-none',
        ]"
      >
        <div
          class="w-full h-full relative bg-[#0B0F0C] flex items-center justify-center group"
        >
          <img
            v-if="champion.image_url"
            :src="champion.image_url"
            :alt="champion.name"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div
            v-else
            class="text-[10px] md:text-xs font-title uppercase text-[#A1A1AA] p-2 text-center break-words w-full"
          >
            {{ champion.name }}
          </div>

          <!-- Unavailable overlay -->
          <div
            v-if="!champion.is_available"
            class="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]"
          >
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 mix-blend-overlay"></div>
            <div class="w-full h-1 bg-red-500 rotate-45 absolute shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            <div class="w-full h-1 bg-red-500 -rotate-45 absolute shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            <span class="absolute text-red-500 font-title text-[10px] tracking-[0.2em] bg-black/80 px-2 py-1 border border-red-500/50 uppercase rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.8)]">
              Banned
            </span>
          </div>
          
          <!-- Hover gradient -->
          <div class="absolute inset-0 bg-gradient-to-t from-[#0B0F0C] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <!-- Name overlay on hover -->
          <div
            class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0B0F0C] to-transparent p-1.5 md:p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            <p
              class="font-title text-center text-[10px] md:text-xs tracking-wider uppercase text-[#F0FDF4] group-hover:text-[#22C55E] transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,1)] truncate"
              :title="champion.name"
            >
              {{ champion.name }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="champions.length === 0"
      class="flex flex-col items-center justify-center py-24 opacity-50"
    >
      <div class="w-12 h-12 border-4 border-[#2A2A2A] border-t-[#22C55E] rounded-full animate-spin mb-6"></div>
      <p class="text-[#22C55E] uppercase tracking-widest text-sm font-bold animate-pulse">Loading Champions...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "../lib/supabase";
import { subscribeToTable } from "../lib/realtime";

const props = defineProps<{
  isAdmin?: boolean;
}>();

interface Champion {
  id: string;
  name: string;
  image_url: string;
  is_available: boolean;
}

const champions = ref<Champion[]>([]);
let realtimeChannel: any = null;

const fetchChampions = async () => {
  const { data, error } = await supabase
    .from("champions")
    .select("*")
    .order("name");

  if (data && !error) {
    champions.value = data;
  }
};

const toggleChampion = async (champion: Champion) => {
  if (!props.isAdmin) return;

  // Optimistic update
  const originalState = champion.is_available;
  champion.is_available = !originalState;

  const { error } = await supabase
    .from("champions")
    .update({ is_available: !originalState })
    .eq("id", champion.id);

  if (error) {
    // Revert on error
    champion.is_available = originalState;
    console.error("Error toggling champion:", error);
  }
};

onMounted(() => {
  fetchChampions();

  realtimeChannel = subscribeToTable("champions", (payload) => {
    if (payload.eventType === "UPDATE") {
      const index = champions.value.findIndex(
        (c) => c.id === payload.new.id,
      );
      if (index !== -1) {
        champions.value[index] = {
          ...champions.value[index],
          ...payload.new,
        };
      }
    } else if (payload.eventType === "INSERT") {
      champions.value.push(payload.new as Champion);
      champions.value.sort((a, b) => a.name.localeCompare(b.name));
    } else if (payload.eventType === "DELETE") {
      champions.value = champions.value.filter(
        (c) => c.id !== payload.old.id,
      );
    }
  });
});

onUnmounted(() => {
  if (realtimeChannel) {
    realtimeChannel.unsubscribe();
  }
});
</script>