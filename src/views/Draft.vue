<template>
  <div
    class="min-h-screen bg-gray-950 text-white flex flex-col font-sans overflow-hidden p-4 md:p-8"
  >
    <header class="mb-8 text-center">
      <h1
        class="text-4xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-sm"
      >
        CHAMPION POOL
      </h1>
      <div
        class="mt-2 text-gray-400 font-mono text-sm tracking-widest flex items-center justify-center gap-2"
      >
        <div
          class="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"
        ></div>
        LIVE SYNC
      </div>
    </header>

    <div
      class="flex-1 w-full max-w-7xl mx-auto bg-gray-900/40 rounded-2xl border border-gray-800/60 p-4 shadow-2xl backdrop-blur-md overflow-y-auto"
    >
      <ChampionGrid :isAdmin="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChampionGrid from "../components/ChampionGrid.vue";
</script>
