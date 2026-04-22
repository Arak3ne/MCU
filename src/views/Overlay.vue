<template>
  <div
    class="h-[1080px] w-[1920px] bg-transparent text-white font-sans overflow-hidden relative border-[10px] border-green-500/20"
  >
    <!-- Scoreboard (Top Center) -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[100px] bg-gray-950/90 backdrop-blur-md rounded-b-3xl border-x-2 border-b-2 border-white/10 flex items-center justify-between px-12 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
    >
      <div class="flex items-center gap-4">
        <span class="text-2xl font-black italic tracking-tighter">ALPHA</span>
        <span class="text-4xl font-mono font-black text-blue-400">1</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-xs font-bold text-gray-500 tracking-[.5em]">VS</span>
        <div
          class="w-12 h-12 bg-red-500 absolute -bottom-6 rounded-full border-4 border-gray-950 flex items-center justify-center font-bold text-lg italic shadow-lg"
        >
          L
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-4xl font-mono font-black text-red-400">0</span>
        <span class="text-2xl font-black italic tracking-tighter">OMEGA</span>
      </div>
    </div>

    <!-- Live Indicator (Bottom Left) -->
    <div
      class="absolute bottom-10 left-10 flex items-center gap-4 bg-black/80 px-6 py-4 rounded-2xl border border-white/10"
    >
      <div class="relative">
        <div
          class="w-4 h-4 bg-red-600 rounded-full animate-ping absolute"
        ></div>
        <div class="w-4 h-4 bg-red-600 rounded-full"></div>
      </div>
      <div>
        <div
          class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1"
        >
          Status
        </div>
        <div class="text-xl font-black italic">LIVE TOURNAMENT</div>
      </div>
    </div>

    <!-- Match Info (Bottom Right) -->
    <div
      class="absolute bottom-10 right-10 text-right bg-gradient-to-l from-black/80 to-transparent px-10 py-4 rounded-r-none rounded-l-2xl border-r-4 border-blue-500"
    >
      <div
        class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"
      >
        Grand Final
      </div>
      <div class="text-2xl font-black italic tracking-tighter">
        BEST OF 5 SERIES
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure this view is exactly 1080p for OBS */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
