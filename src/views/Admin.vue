<template>
  <div class="min-h-screen bg-black text-white p-12">
    <div class="max-w-4xl mx-auto space-y-12">
      <header
        class="flex justify-between items-center bg-gray-900 p-6 rounded-xl border-l-4 border-red-500 shadow-2xl"
      >
        <div>
          <h2
            class="text-sm font-semibold text-gray-400 uppercase tracking-[.25em] mb-1"
          >
            Control Center
          </h2>
          <h1 class="text-3xl font-black">TOURNAMENT ADMIN</h1>
        </div>
        <div
          class="px-4 py-2 bg-red-500/10 text-red-400 rounded-full text-xs font-bold border border-red-500/20 animate-pulse"
        >
          LIVE ACCESS
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section
          class="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 backdrop-blur-sm"
        >
          <h3 class="text-lg font-bold mb-6 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
            Update Match Results
          </h3>
          <div class="space-y-4">
            <div
              class="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-700/50"
            >
              <span class="font-bold">Team Alpha</span>
              <input
                type="number"
                class="w-12 h-12 bg-gray-900 border border-gray-700 rounded text-center text-xl font-black focus:ring-2 focus:ring-blue-500 outline-none"
                value="0"
              />
              <span class="text-gray-500 font-mono italic text-sm">VS</span>
              <input
                type="number"
                class="w-12 h-12 bg-gray-900 border border-gray-700 rounded text-center text-xl font-black focus:ring-2 focus:ring-blue-500 outline-none"
                value="0"
              />
              <span class="font-bold">Team Omega</span>
            </div>
            <button
              class="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all rounded-xl font-bold shadow-lg shadow-blue-600/20"
            >
              Finalize Result
            </button>
          </div>
        </section>

        <section
          class="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 backdrop-blur-sm"
        >
          <h3 class="text-lg font-bold mb-6 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-orange-500"></div>
            Quick Actions
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <button
              class="aspect-square bg-gray-800 hover:bg-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border border-gray-700"
            >
              <div class="text-2xl opacity-50">📋</div>
              <span class="text-xs font-bold">RESET DRAFT</span>
            </button>
            <button
              class="aspect-square bg-gray-800 hover:bg-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border border-gray-700"
            >
              <div class="text-2xl opacity-50">🔄</div>
              <span class="text-xs font-bold">FLIP SIDES</span>
            </button>
          </div>
        </section>
      </div>

      <!-- Champion Pool Admin -->
      <section
        class="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 backdrop-blur-sm"
      >
        <h3 class="text-lg font-bold mb-6 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-purple-500"></div>
          Champion Availability
        </h3>
        <ChampionGrid :isAdmin="true" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChampionGrid from "../components/ChampionGrid.vue";
</script>
