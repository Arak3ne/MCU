<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <header class="max-w-6xl mx-auto flex justify-between items-center mb-8">
      <div>
        <h1
          class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2"
        >
          Champions
        </h1>
        <router-link
          to="/"
          class="text-sm text-gray-400 hover:text-white transition-colors"
          >← Back to Home</router-link
        >
      </div>
      <div class="flex gap-4 items-center">
        <!-- Available Only Toggle -->
        <button
          @click="showOnlyAvailable = !showOnlyAvailable"
          :class="[
            'px-4 py-2 rounded-lg font-semibold transition-all border',
            showOnlyAvailable
              ? 'bg-green-500/20 text-green-400 border-green-500/50'
              : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700',
          ]"
        >
          {{ showOnlyAvailable ? "✓ Only Available" : "Show All" }}
        </button>
      </div>
    </header>

    <main class="max-w-6xl mx-auto space-y-6">
      <!-- Filters -->
      <div
        class="bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center"
      >
        <!-- Search Input -->
        <div class="relative w-full md:w-1/3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search champions..."
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
          />
          <span
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-2.5 text-gray-500 hover:text-white cursor-pointer"
            >✕</span
          >
        </div>

        <!-- Role Tabs -->
        <div class="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            v-for="role in roles"
            :key="role.name"
            @click="toggleRole(role.name)"
            :class="[
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
              selectedRole === role.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
            ]"
            :title="role.name"
          >
            <span>{{ role.icon }}</span>
            <span class="hidden sm:inline">{{ role.name }}</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div
          class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-gray-400">Loading champions...</p>
      </div>

      <!-- Champion Grid -->
      <div
        v-else
        class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4"
      >
        <div
          v-for="champ in filteredChampions"
          :key="champ.id"
          class="bg-gray-800 rounded-lg overflow-hidden border transition-all duration-200 group flex flex-col"
          :class="[
            champ.is_available
              ? 'border-gray-700 hover:border-blue-500'
              : 'border-red-900/50 opacity-60 grayscale-[0.8]',
          ]"
        >
          <!-- Image -->
          <div class="relative aspect-square overflow-hidden bg-gray-900">
            <img
              :src="champ.image_url"
              :alt="champ.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div
              v-if="!champ.is_available"
              class="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
            >
              <span
                class="text-red-500 font-bold tracking-widest rotate-[-15deg] border-2 border-red-500 px-2 py-1 rounded bg-black/50"
                >BANNED</span
              >
            </div>

            <!-- Admin Toggle Overlay -->
            <div
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <button
                @click="toggleAvailability(champ)"
                class="px-3 py-1.5 rounded font-bold text-xs"
                :class="
                  champ.is_available
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                "
              >
                {{ champ.is_available ? "BAN" : "ALLOW" }}
              </button>
            </div>
          </div>

          <!-- Name & Roles -->
          <div class="p-2 flex-1 flex flex-col justify-between">
            <h3
              class="font-bold text-center text-sm truncate"
              :title="champ.name"
            >
              {{ champ.name }}
            </h3>
            <div class="flex justify-center gap-1 mt-1">
              <span
                v-for="r in champ.roles?.slice(0, 2)"
                :key="r"
                class="text-[10px] text-gray-400 bg-gray-900 px-1.5 rounded"
                >{{ r }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!loading && filteredChampions.length === 0"
        class="text-center py-12 bg-gray-800 rounded-xl border border-gray-700"
      >
        <p class="text-gray-400 text-lg">No champions match your filters.</p>
        <button
          @click="resetFilters"
          class="mt-4 text-blue-400 hover:text-blue-300 underline"
        >
          Reset Filters
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { getChampions, toggleChampion } from "../lib/queries";
import { subscribeToChampions } from "../lib/realtime";
import type { Database } from "../types/supabase";

type Champion = Database["public"]["Tables"]["champions"]["Row"];

// State
const champions = ref<Champion[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedRole = ref<string | null>(null);
const showOnlyAvailable = ref(false);
let subscription: any = null;

// League of Legends Roles mapping with emoji icons
const roles = [
  { name: "All", icon: "🌍" },
  { name: "Fighter", icon: "⚔️" },
  { name: "Tank", icon: "🛡️" },
  { name: "Mage", icon: "🔮" },
  { name: "Assassin", icon: "🗡️" },
  { name: "Marksman", icon: "🏹" },
  { name: "Support", icon: "💖" },
];

// Computed
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

    // 3. Role filter
    if (selectedRole.value && selectedRole.value !== "All") {
      // Data dragon tags usually match exactly: "Fighter", "Tank", etc.
      if (!champ.roles || !champ.roles.includes(selectedRole.value))
        return false;
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
  selectedRole.value = roleName === "All" ? null : roleName;
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
  subscription = subscribeToChampions((payload) => {
    const updatedChamp = payload.new;
    const index = champions.value.findIndex((c) => c.id === updatedChamp.id);
    if (index !== -1) {
      // Update the specific champion in our list
      champions.value[index] = { ...champions.value[index], ...updatedChamp };
    }
  });
});

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe();
  }
});
</script>
