<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <header class="max-w-4xl mx-auto flex justify-between items-center mb-12">
      <h1
        class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
      >
        LoL Tournament
      </h1>
      <nav class="space-x-6">
        <router-link to="/" class="hover:text-blue-400">Ranking</router-link>
        <router-link to="/champions" class="hover:text-blue-400"
          >Champions</router-link
        >
        <router-link to="/draft" class="hover:text-blue-400">Draft</router-link>
        <router-link to="/admin" class="hover:text-blue-400 text-sm opacity-50"
          >Admin</router-link
        >
      </nav>
    </header>
    <main class="max-w-4xl mx-auto">
      <div class="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
        <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
          🏆 Live Ranking
        </h2>
        <div class="space-y-4">
          <div
            v-for="i in 5"
            :key="i"
            class="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800"
          >
            <div class="flex items-center gap-4">
              <span class="text-gray-500 font-mono">#{{ i }}</span>
              <div class="w-8 h-8 rounded bg-gray-700"></div>
              <span class="font-medium text-gray-200">Team {{ i }}</span>
            </div>
            <div class="flex gap-8 text-sm">
              <div class="text-center">
                <p
                  class="text-gray-500 uppercase text-[10px] tracking-wider mb-1"
                >
                  Wins
                </p>
                <span class="font-mono text-blue-400">{{
                  Math.floor(Math.random() * 10)
                }}</span>
              </div>
              <div class="text-center">
                <p
                  class="text-gray-500 uppercase text-[10px] tracking-wider mb-1"
                >
                  Losses
                </p>
                <span class="font-mono text-red-400">{{
                  Math.floor(Math.random() * 5)
                }}</span>
              </div>
              <div class="text-center">
                <p
                  class="text-gray-500 uppercase text-[10px] tracking-wider mb-1"
                >
                  Points
                </p>
                <span class="font-mono text-green-400 text-lg">{{
                  Math.floor(Math.random() * 20)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
