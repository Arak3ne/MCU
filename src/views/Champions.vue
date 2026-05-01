<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] font-sans selection:bg-[#22C55E] selection:text-[#0B0F0C]">
    <!-- Background accents -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4ADE80] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#22C55E] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
    </div>

    <!-- Main Content -->
    <main class="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-8 animate-fade-in-up">
      <!-- Header & Filters -->
      <div class="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#2A2A2A] pb-6">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-4xl md:text-5xl font-title uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] drop-shadow-lg">
              Champions
            </h1>
          </div>
          <p class="text-[#A1A1AA] font-medium tracking-widest uppercase text-xs mt-2">Gérer la disponibilité globale des Champions</p>
        </div>

        <div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <!-- Search Input -->
          <div class="relative w-full md:w-64 group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher des champions..."
              class="w-full bg-[#111111] border border-[#2A2A2A] group-hover:border-[#22C55E]/50 focus:border-[#22C55E] rounded-sm px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-[#F0FDF4] placeholder-[#A1A1AA] transition-all font-medium text-sm tracking-wide shadow-inner"
            />
            <span
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-2.5 text-[#A1A1AA] hover:text-[#22C55E] cursor-pointer transition-colors"
            >✕</span>
          </div>

          <!-- Role Tabs -->
          <div class="flex gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 bg-[#111111] border border-[#2A2A2A] p-1 rounded-sm">
            <button
              v-for="role in roles"
              :key="role.name"
              @click="toggleRole(role.name)"
              :class="[
                'flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer border',
                selectedRole === role.name
                  ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E] shadow-[0_0_10px_rgba(200,170,110,0.2)]'
                  : 'bg-transparent text-[#A1A1AA] border-transparent hover:text-[#F0FDF4] hover:bg-[#1A1A1A]'
              ]"
              :title="role.name"
            >
              <img :src="role.icon" :alt="role.name" class="w-4 h-4 object-contain pointer-events-none drop-shadow-md" :class="{'brightness-0 invert opacity-60': selectedRole !== role.name}" />
              <span class="hidden sm:inline pointer-events-none">{{ role.name }}</span>
            </button>
          </div>

          <!-- Available Only Toggle -->
          <button
            @click="showOnlyAvailable = !showOnlyAvailable"
            :class="[
              'px-4 py-2 rounded-sm text-xs font-bold tracking-widest uppercase transition-all border cursor-pointer whitespace-nowrap shadow-inner flex items-center gap-2',
              showOnlyAvailable
                ? 'bg-green-500/10 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                : 'bg-[#111111] text-[#A1A1AA] border-[#2A2A2A] hover:border-[#22C55E]/30 hover:text-[#F0FDF4]',
            ]"
          >
            <div class="w-2 h-2 rounded-full" :class="showOnlyAvailable ? 'bg-green-400 shadow-[0_0_5px_#22c55e]' : 'bg-gray-600'"></div>
            {{ showOnlyAvailable ? "Disponibles Uniquement" : "Afficher Tout" }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-32 opacity-80">
        <div class="relative w-20 h-20 mb-8">
          <div class="absolute inset-0 border-4 border-mcu-border rounded-full"></div>
          <div class="absolute inset-0 border-4 border-mcu-primary rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
          <div class="absolute inset-2 border-4 border-mcu-primary/30 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
        </div>
        <p class="text-mcu-primary uppercase tracking-widest text-sm font-bold animate-pulse drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">Chargement des champions...</p>
      </div>

      <!-- Champion Grid -->
      <div
        v-else-if="!loading"
        class="bg-[#0B0F0C]/60 backdrop-blur-sm border border-[#22C55E]/30 p-1 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative before:absolute before:-inset-[1px] before:bg-gradient-to-b before:from-[#22C55E]/50 before:to-[#22C55E]/10 before:-z-10 before:rounded-sm rounded-sm animate-fade-in-up"
      >
        <div class="bg-[#111111] p-6 rounded-sm w-full h-full min-h-[500px]">
          <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 md:gap-4">
            <div
              v-for="champ in filteredChampions"
              :key="champ.id"
              @click="toggleAvailability(champ)"
              class="relative rounded-sm overflow-hidden border transition-all duration-300 group flex flex-col cursor-pointer bg-[#1A1A1A]"
              :class="[
                champ.is_available
                  ? 'border-[#2A2A2A] hover:border-[#22C55E] shadow-lg hover:shadow-[0_0_15px_rgba(200,170,110,0.3)] hover:-translate-y-1'
                  : 'border-red-900/50 opacity-50 grayscale-[0.8] hover:grayscale-[0.5] hover:opacity-80 hover:border-red-500/50',
              ]"
            >
              <!-- Image -->
              <div class="relative aspect-square overflow-hidden bg-[#0B0F0C]">
                <img
                  :src="champ.image_url || undefined"
                  :alt="champ.name"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                
                <!-- Banned Overlay -->
                <div
                  v-if="!champ.is_available"
                  class="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]"
                >
                  <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 mix-blend-overlay"></div>
                  <div class="w-full h-1 bg-red-500 rotate-45 absolute shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                  <div class="w-full h-1 bg-red-500 -rotate-45 absolute shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                  <span class="absolute text-red-500 font-title text-[10px] tracking-[0.2em] bg-black/80 px-2 py-1 border border-red-500/50 uppercase rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                    Banni
                  </span>
                </div>
                
                <!-- Hover gradient -->
                <div class="absolute inset-0 bg-gradient-to-t from-[#0B0F0C] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <!-- Name -->
              <div class="absolute bottom-0 inset-x-0 p-1.5 md:p-2 bg-gradient-to-t from-[#0B0F0C] to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3
                  class="font-title text-center text-[10px] md:text-xs tracking-wider uppercase text-[#F0FDF4] group-hover:text-[#22C55E] transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,1)] truncate"
                  :title="champ.name"
                >
                  {{ champ.name }}
                </h3>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="!loading && filteredChampions.length === 0"
            class="flex flex-col items-center justify-center py-20 text-center"
          >
            <div class="text-4xl mb-4 opacity-50">🔍</div>
            <p class="text-[#A1A1AA] uppercase tracking-widest text-sm font-bold mb-4">Aucun champion ne correspond à vos filtres</p>
            <button
              @click="resetFilters"
              class="px-6 py-2 text-xs font-bold tracking-widest uppercase text-[#22C55E] border border-[#22C55E]/30 hover:border-[#22C55E] hover:bg-[#22C55E]/10 transition-all rounded-sm cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { getChampions, toggleChampion } from "../lib/queries";
import { subscribeToTable } from "../lib/realtime";
import type { Database } from "../types/supabase";

import topIcon from "../assets/top.png";
import jglIcon from "../assets/jgl.png";
import midIcon from "../assets/mid.png";
import adcIcon from "../assets/adc.png";
import supportIcon from "../assets/support.png";

type Champion = Database["public"]["Tables"]["champions"]["Row"];

// State
const champions = ref<Champion[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedRole = ref<string | null>(null);
const showOnlyAvailable = ref(false);
let subscription: any = null;

// League of Legends Positions mapping with imported icons
const roles = [
  { name: "Top", icon: topIcon, tags: ["top"] },
  { name: "Jgl", icon: jglIcon, tags: ["jungle"] },
  { name: "Mid", icon: midIcon, tags: ["mid"] },
  { name: "ADC", icon: adcIcon, tags: ["adc"] },
  { name: "Supp", icon: supportIcon, tags: ["support"] },
];

const filteredChampions = computed(() => {
  return champions.value.filter((champ) => {
    // 1. Availability filter
    if (showOnlyAvailable.value && !champ.is_available) return false;

    // 2. Search filter
    if (
      searchQuery.value &&
      !champ.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
      return false;

    // 3. Position filter
    if (selectedRole.value) {
      const position = roles.find((r) => r.name === selectedRole.value);
      if (position && position.tags.length > 0) {
        // If champion has ANY of the tags associated with the position
        if (!champ.roles || !champ.roles.some(tag => position.tags.includes(tag)))
          return false;
      }
    }

    return true;
  });
});

// Methods
const loadChampions = async () => {
  loading.value = true;
  const { data, error } = await getChampions();
  if (data) {
    champions.value = data;
  } else if (error) {
    console.error("Failed to fetch champions:", error);
  }
  loading.value = false;
};

const toggleRole = (roleName: string) => {
  selectedRole.value = selectedRole.value === roleName ? null : roleName;
};

const resetFilters = () => {
  searchQuery.value = "";
  selectedRole.value = null;
  showOnlyAvailable.value = false;
};

const toggleAvailability = async (champ: Champion) => {
  // Optimistic UI update
  const previousState = champ.is_available;
  champ.is_available = !champ.is_available;

  const { error } = await toggleChampion(champ.id, champ.is_available!);

  // Revert if error
  if (error) {
    console.error("Failed to toggle champion:", error);
    champ.is_available = previousState;
    alert("Failed to update champion. Are you an admin?");
  }
};

// Lifecycle
onMounted(() => {
  loadChampions();

  // Setup Realtime
  subscription = subscribeToTable("champions", (payload) => {
    if (payload.eventType === "UPDATE") {
      const updatedChamp = payload.new;
      const index = champions.value.findIndex((c) => c.id === updatedChamp.id);
      if (index !== -1) {
        // Update the specific champion in our list
        champions.value[index] = { ...champions.value[index], ...updatedChamp };
      }
    }
  });
});

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe();
  }
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