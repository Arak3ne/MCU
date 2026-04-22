<template>
  <div class="champion-grid-container p-4">
    <div
      class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3"
    >
      <div
        v-for="champion in champions"
        :key="champion.id"
        @click="toggleChampion(champion)"
        class="aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2"
        :class="[
          champion.is_available
            ? 'border-transparent hover:border-blue-500 opacity-100 shadow-lg hover:-translate-y-1'
            : 'border-red-500/50 grayscale opacity-40 hover:opacity-60',
          isAdmin ? 'cursor-pointer' : 'cursor-default pointer-events-none',
        ]"
      >
        <div
          class="w-full h-full relative bg-gray-800 flex items-center justify-center group"
        >
          <img
            v-if="champion.image_url"
            :src="champion.image_url"
            :alt="champion.name"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="text-xs font-bold text-gray-400 p-2 text-center break-words w-full"
          >
            {{ champion.name }}
          </div>

          <!-- Unavailable overlay -->
          <div
            v-if="!champion.is_available"
            class="absolute inset-0 bg-red-900/20 flex items-center justify-center backdrop-blur-[1px]"
          >
            <div
              class="w-full h-1 bg-red-500 rotate-45 absolute scale-150 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
            ></div>
          </div>

          <!-- Name overlay on hover -->
          <div
            class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200"
          >
            <p
              class="text-[10px] md:text-xs font-bold text-white text-center truncate"
            >
              {{ champion.name }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="champions.length === 0"
      class="flex justify-center items-center h-40 text-gray-500 font-mono italic"
    >
      Waiting for champions data...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "../lib/supabase";

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

  realtimeChannel = supabase
    .channel("champions_channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "champions" },
      (payload) => {
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
      },
    )
    .subscribe();
});

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }
});
</script>
