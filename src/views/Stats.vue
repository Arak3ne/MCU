<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] font-sans pb-20 selection:bg-[#22C55E] selection:text-[#0B0F0C]">
    <!-- Background accents -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4ADE80] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#22C55E] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
    </div>

    <!-- Subtle Scroll Hint -->
    <div 
      class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 cursor-pointer"
      :class="showScrollHint ? 'opacity-50 hover:opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'"
      @click="scrollToRawData"
    >
      <div class="w-5 h-8 border-2 border-[#A1A1AA] rounded-full flex justify-center pt-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-[#0B0F0C]/50 backdrop-blur-sm">
        <div class="w-1 h-1.5 bg-[#22C55E] rounded-full animate-scroll-wheel shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
      </div>
    </div>

    <!-- Hero & Podium Section -->
    <div class="relative pt-8 md:pt-10 pb-8 overflow-hidden border-b border-[#22C55E]/10 bg-gradient-to-b from-[#0B0F0C] via-[#111814] to-[#0B0F0C]">
      <div class="absolute inset-0 bg-[url('../assets/mcu_logo.png')] bg-center bg-no-repeat opacity-[0.02] blur-sm scale-150"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 z-10">
        <!-- Header -->
          <div class="text-center mb-6 md:mb-8">
            <div class="inline-block relative mb-1">
              <h1 class="text-5xl md:text-6xl font-title tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                Hall of Fame
              </h1>
            </div>
            <p class="text-[#A1A1AA] text-xs md:text-sm max-w-2xl mx-auto font-medium tracking-[0.2em] uppercase">
              Where Legends Are Made
            </p>
          </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-20 opacity-80">
          <div class="relative w-16 h-16 mb-6">
            <div class="absolute inset-0 border-4 border-[#2A2A2A] rounded-full"></div>
            <div class="absolute inset-0 border-4 border-[#22C55E] rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
          </div>
          <p class="text-[#22C55E] uppercase tracking-widest text-sm font-bold animate-pulse">Analyse des données...</p>
        </div>
        
        <div v-else-if="error" class="bg-red-900/20 border border-red-500/50 text-red-400 p-6 rounded-lg text-center backdrop-blur-md max-w-xl mx-auto">
          <div class="text-3xl mb-2">⚠️</div>
          <p class="font-bold uppercase tracking-widest text-sm">{{ error }}</p>
        </div>
        
        <div v-else class="animate-fade-in-up">
          <!-- Controls & Title Row -->
          <div class="flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto mb-8 gap-6">
            <!-- Left Title -->
            <div class="text-center lg:text-left shrink-0">
              <h2 class="text-2xl md:text-3xl font-title uppercase tracking-widest text-[#F0FDF4] mb-1 flex items-center justify-center lg:justify-start gap-3">
                <span class="w-6 h-[2px] bg-[#EAB308] hidden lg:block"></span>
                The Elite Tier
              </h2>
              <p class="text-[#A1A1AA] text-xs md:text-sm uppercase tracking-widest font-bold mt-1">
                Top <span class="text-[#EAB308]">{{ activeTopMetricLabel }}</span>
              </p>
            </div>

            <!-- Metric Selector -->
            <div class="relative group w-full lg:w-[700px]">
              <div class="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#111814] to-transparent z-10 pointer-events-none"></div>
              <div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#111814] to-transparent z-10 pointer-events-none"></div>
              
              <div 
                ref="metricsContainer" 
                class="flex overflow-x-auto hide-scrollbar gap-2 py-2 px-4 snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing"
                @mousedown="startDrag"
                @mousemove="onDrag"
                @mouseup="stopDrag"
                @mouseleave="stopDrag"
                @wheel="onWheel"
              >
                <button 
                  v-for="metric in topMetrics" 
                  :key="metric.id"
                  @click="activeTopMetric = metric.id"
                  class="snap-center whitespace-nowrap px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-all rounded-full border pointer-events-auto cursor-pointer"
                  :class="activeTopMetric === metric.id 
                    ? 'bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                    : 'bg-[#1A1A1A]/50 border-[#2A2A2A] text-[#A1A1AA] hover:text-[#F0FDF4] hover:border-[#4A4A4A] hover:bg-[#2A2A2A]/50'"
                >
                  {{ metric.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- The Podium -->
          <div class="flex justify-center items-end h-[320px] md:h-[380px] gap-2 md:gap-4 max-w-5xl mx-auto px-2">
            <!-- 1st Place (Gold) -->
            <div v-if="top4[0]" class="flex flex-col items-center w-[30%] max-w-[200px] relative group h-full justify-end z-20">
              <div class="relative z-10 flex flex-col items-center transition-transform duration-500 group-hover:-translate-y-6">
                <div class="absolute -top-10 md:-top-14 text-4xl md:text-6xl animate-bounce drop-shadow-[0_0_15px_rgba(234,179,8,0.6)] z-20">👑</div>
                <div class="relative">
                  <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${top4[0].playerName}&backgroundColor=transparent`" 
                       class="w-20 h-20 md:w-32 md:h-32 rounded-full border-[4px] border-[#FBBF24] bg-gradient-to-b from-[#78350F] to-[#451A03] shadow-[0_0_30px_rgba(251,191,36,0.4)] object-cover" />
                  <div class="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-[#451A03] font-bold text-lg md:text-2xl w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border-[3px] border-[#0B0F0C] shadow-[0_0_15px_rgba(234,179,8,0.5)]">1</div>
                </div>
                <div class="mt-5 text-center">
                  <div class="text-[#F0FDF4] font-bold text-base md:text-xl uppercase tracking-widest truncate w-full px-1 group-hover:text-[#FBBF24] transition-colors drop-shadow-md">{{ top4[0].playerName }}</div>
                  <div class="text-[#FBBF24] font-title text-3xl md:text-5xl mt-1 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">{{ formatMetricValue(top4[0][activeTopMetric]) }}</div>
                </div>
              </div>
              <!-- Pedestal -->
              <div class="w-full h-[220px] md:h-[284px] mt-4 relative">
                <div class="absolute inset-0 bg-gradient-to-t from-[#FBBF24]/5 to-[#FBBF24]/20 border-t-[3px] border-[#FBBF24]/60 backdrop-blur-sm transition-all duration-500 group-hover:from-[#FBBF24]/10 group-hover:to-[#FBBF24]/30 shadow-[0_-10px_30px_rgba(251,191,36,0.2)]" style="clip-path: polygon(10% 0, 90% 0, 100% 100%, 0% 100%);">
                  <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                  <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent"></div>
                  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-[#FDE047] shadow-[0_0_10px_rgba(253,224,71,0.8)]"></div>
                </div>
              </div>
            </div>

            <!-- 2nd Place (Silver) -->
            <div v-if="top4[1]" class="flex flex-col items-center w-[25%] max-w-[160px] relative group h-full justify-end">
              <div class="relative z-10 flex flex-col items-center transition-transform duration-500 group-hover:-translate-y-4">
                <div class="relative">
                  <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${top4[1].playerName}&backgroundColor=transparent`" 
                       class="w-16 h-16 md:w-24 md:h-24 rounded-full border-[3px] border-[#94A3B8] bg-gradient-to-b from-[#334155] to-[#0F172A] shadow-[0_0_20px_rgba(148,163,184,0.3)] object-cover" />
                  <div class="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#CBD5E1] to-[#94A3B8] text-[#0F172A] font-bold text-sm md:text-lg w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center border-2 border-[#0B0F0C] shadow-lg">2</div>
                </div>
                <div class="mt-4 text-center">
                  <div class="text-[#F0FDF4] font-bold text-sm md:text-base uppercase tracking-wider truncate w-full px-1 group-hover:text-[#94A3B8] transition-colors">{{ top4[1].playerName }}</div>
                  <div class="text-[#94A3B8] font-title text-xl md:text-3xl mt-1">{{ formatMetricValue(top4[1][activeTopMetric]) }}</div>
                </div>
              </div>
              <!-- Pedestal -->
              <div class="w-full h-[100px] md:h-[130px] mt-4 relative">
                <div class="absolute inset-0 bg-gradient-to-t from-[#94A3B8]/5 to-[#94A3B8]/20 border-t-[3px] border-[#94A3B8]/60 backdrop-blur-sm transition-all duration-500 group-hover:from-[#94A3B8]/10 group-hover:to-[#94A3B8]/30 shadow-[0_-5px_20px_rgba(148,163,184,0.15)]" style="clip-path: polygon(10% 0, 90% 0, 100% 100%, 0% 100%);">
                  <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                  <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent"></div>
                </div>
              </div>
            </div>

            <!-- 3rd Place (Bronze) -->
            <div v-if="top4[2]" class="flex flex-col items-center w-[25%] max-w-[160px] relative group h-full justify-end">
              <div class="relative z-10 flex flex-col items-center transition-transform duration-500 group-hover:-translate-y-4">
                <div class="relative">
                  <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${top4[2].playerName}&backgroundColor=transparent`" 
                       class="w-14 h-14 md:w-20 md:h-20 rounded-full border-[3px] border-[#B45309] bg-gradient-to-b from-[#451A03] to-[#1A0E06] shadow-[0_0_20px_rgba(180,83,9,0.3)] object-cover" />
                  <div class="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#D97706] to-[#B45309] text-[#FFFBEB] font-bold text-sm md:text-lg w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 border-[#0B0F0C] shadow-lg">3</div>
                </div>
                <div class="mt-4 text-center">
                  <div class="text-[#F0FDF4] font-bold text-sm md:text-base uppercase tracking-wider truncate w-full px-1 group-hover:text-[#D97706] transition-colors">{{ top4[2].playerName }}</div>
                  <div class="text-[#D97706] font-title text-xl md:text-2xl mt-1">{{ formatMetricValue(top4[2][activeTopMetric]) }}</div>
                </div>
              </div>
              <!-- Pedestal -->
              <div class="w-full h-[80px] md:h-[110px] mt-4 relative">
                <div class="absolute inset-0 bg-gradient-to-t from-[#B45309]/5 to-[#B45309]/20 border-t-[3px] border-[#B45309]/60 backdrop-blur-sm transition-all duration-500 group-hover:from-[#B45309]/10 group-hover:to-[#B45309]/30 shadow-[0_-5px_20px_rgba(180,83,9,0.15)]" style="clip-path: polygon(10% 0, 90% 0, 100% 100%, 0% 100%);">
                  <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                  <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent"></div>
                </div>
              </div>
            </div>

            <!-- 4th Place (Iron/Slate) -->
            <div v-if="top4[3]" class="flex flex-col items-center w-[20%] max-w-[140px] relative group h-full justify-end">
              <div class="relative z-10 flex flex-col items-center transition-transform duration-500 group-hover:-translate-y-3">
                <div class="relative">
                  <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${top4[3].playerName}&backgroundColor=transparent`" 
                       class="w-12 h-12 md:w-16 md:h-16 rounded-full border-[2px] border-[#475569] bg-gradient-to-b from-[#1E293B] to-[#0F172A] shadow-[0_0_15px_rgba(71,85,105,0.3)] object-cover" />
                  <div class="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#64748B] to-[#475569] text-white font-bold text-xs md:text-sm w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center border-2 border-[#0B0F0C] shadow-lg">4</div>
                </div>
                <div class="mt-3 text-center">
                  <div class="text-[#F0FDF4] font-bold text-xs md:text-sm uppercase tracking-wider truncate w-full px-1 group-hover:text-[#64748B] transition-colors">{{ top4[3].playerName }}</div>
                  <div class="text-[#64748B] font-title text-lg md:text-xl mt-1">{{ formatMetricValue(top4[3][activeTopMetric]) }}</div>
                </div>
              </div>
              <!-- Pedestal -->
              <div class="w-full h-[50px] md:h-[70px] mt-4 relative">
                <div class="absolute inset-0 bg-gradient-to-t from-[#475569]/5 to-[#475569]/20 border-t-[2px] border-[#475569]/60 backdrop-blur-sm transition-all duration-500 group-hover:from-[#475569]/10 group-hover:to-[#475569]/30 shadow-[0_-3px_15px_rgba(71,85,105,0.1)]" style="clip-path: polygon(10% 0, 90% 0, 100% 100%, 0% 100%);">
                  <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Raw Stats Section -->
    <div id="raw-data-section" class="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 pt-16" v-if="!loading && !error">
      <div class="animate-fade-in-up" style="animation-delay: 0.2s;">
        <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div class="text-center md:text-left">
            <h2 class="text-2xl md:text-3xl font-title uppercase tracking-widest text-[#F0FDF4] mb-1 flex items-center justify-center md:justify-start gap-3">
              <span class="w-6 h-[2px] bg-[#22C55E] hidden md:block"></span>
              The Numbers Don't Lie
            </h2>
            <p class="text-[#A1A1AA] text-xs md:text-sm uppercase tracking-widest font-bold">Statistiques complètes des joueurs</p>
          </div>
          
          <!-- Tabs -->
          <div class="flex bg-[#111111] p-1.5 border border-[#2A2A2A] rounded-full shadow-lg">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-5 py-2 text-xs font-bold tracking-widest uppercase transition-all rounded-full cursor-pointer"
              :class="activeTab === tab.id 
                ? 'bg-[#22C55E] text-[#0B0F0C] shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                : 'text-[#A1A1AA] hover:text-[#F0FDF4] hover:bg-[#1A1A1A]'"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Stats Table -->
        <div class="bg-[#111111]/80 backdrop-blur-md border border-[#2A2A2A] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <!-- Scroll hint shadows -->
          <div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#111111] to-transparent z-10 pointer-events-none"></div>
          
          <div class="overflow-x-auto pb-4">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr class="bg-[#1A1A1A]/80 text-[#A1A1AA] text-[10px] font-bold uppercase tracking-[0.15em] border-b border-[#2A2A2A]">
                  <th class="p-5 cursor-pointer hover:text-[#22C55E] transition-colors sticky left-0 bg-[#1A1A1A] z-20 shadow-[4px_0_10px_rgba(0,0,0,0.2)]" @click="sortBy('playerName')">
                    <div class="flex items-center gap-2">
                      Joueur 
                      <span v-if="sortKey === 'playerName'" class="text-[#22C55E]">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                    </div>
                  </th>
                  
                  <!-- Classic Stats -->
                  <template v-if="activeTab === 'classic'">
                    <th v-for="col in classicCols" :key="col.key" class="p-5 text-center cursor-pointer hover:text-[#22C55E] transition-colors" @click="sortBy(col.key)">
                      <div class="flex items-center justify-center gap-2">
                        {{ col.label }}
                        <span v-if="sortKey === col.key" class="text-[#22C55E]">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                      </div>
                    </th>
                  </template>

                  <!-- Advanced Stats -->
                  <template v-if="activeTab === 'advanced'">
                    <th v-for="col in advancedCols" :key="col.key" class="p-5 text-center cursor-pointer hover:text-[#22C55E] transition-colors" @click="sortBy(col.key)">
                      <div class="flex items-center justify-center gap-2">
                        {{ col.label }}
                        <span v-if="sortKey === col.key" class="text-[#22C55E]">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                      </div>
                    </th>
                  </template>

                  <!-- Fun Stats -->
                  <template v-if="activeTab === 'fun'">
                    <th v-for="col in funCols" :key="col.key" class="p-5 text-center cursor-pointer hover:text-[#22C55E] transition-colors" @click="sortBy(col.key)">
                      <div class="flex items-center justify-center gap-2">
                        {{ col.label }}
                        <span v-if="sortKey === col.key" class="text-[#22C55E]">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                      </div>
                    </th>
                  </template>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#2A2A2A]/50">
                <tr v-for="stat in sortedStats" :key="stat.playerId" 
                    class="group hover:bg-[#22C55E]/5 transition-all duration-300">
                  <td class="p-4 sticky left-0 bg-[#111111] group-hover:bg-[#141C16] transition-colors z-10 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
                    <div class="flex items-center gap-3">
                      <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${stat.playerName}&backgroundColor=transparent`" 
                           class="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] group-hover:border-[#22C55E]/50 transition-colors object-cover" />
                      <span class="font-bold text-[#F0FDF4] uppercase tracking-wide group-hover:text-[#22C55E] transition-colors text-sm">{{ stat.playerName }}</span>
                    </div>
                  </td>
                  
                  <!-- Classic Stats -->
                  <template v-if="activeTab === 'classic'">
                    <td class="p-4 text-center text-[#F0FDF4] font-bold">{{ stat.totalKills }}</td>
                    <td class="p-4 text-center text-[#F0FDF4] font-bold">{{ stat.totalDeaths }}</td>
                    <td class="p-4 text-center text-[#F0FDF4] font-bold">{{ stat.totalAssists }}</td>
                    <td class="p-4 text-center font-title text-lg" :class="getKdaColor(stat.kda)">
                      {{ stat.kda.toFixed(2) }}
                    </td>
                    <td class="p-4 text-center text-[#A1A1AA]">{{ stat.avgKills.toFixed(1) }}</td>
                    <td class="p-4 text-center text-[#A1A1AA]">{{ stat.avgDeaths.toFixed(1) }}</td>
                    <td class="p-4 text-center text-[#A1A1AA]">{{ stat.avgAssists.toFixed(1) }}</td>
                    <td class="p-4 text-center text-[#A1A1AA] font-bold">{{ stat.killParticipation.toFixed(1) }}%</td>
                  </template>

                  <!-- Advanced Stats -->
                  <template v-if="activeTab === 'advanced'">
                    <td class="p-4 text-center text-[#F0FDF4] font-bold">{{ stat.dpm.toFixed(0) }}</td>
                    <td class="p-4 text-center text-[#A1A1AA]">{{ stat.dtpm.toFixed(0) }}</td>
                    <td class="p-4 text-center text-[#A1A1AA] font-bold">{{ stat.dmgShare.toFixed(1) }}%</td>
                    <td class="p-4 text-center text-[#EAB308] font-bold">{{ stat.gpm.toFixed(0) }}</td>
                    <td class="p-4 text-center text-[#A1A1AA] font-bold">{{ stat.goldShare.toFixed(1) }}%</td>
                    <td class="p-4 text-center text-[#A1A1AA]">{{ stat.cspm.toFixed(1) }}</td>
                    <td class="p-4 text-center text-[#A1A1AA] font-medium">{{ stat.dmgPerGold.toFixed(2) }}</td>
                    <td class="p-4 text-center text-[#A1A1AA] font-bold">{{ stat.avgVisionScore.toFixed(1) }}</td>
                  </template>

                  <!-- Fun Stats -->
                  <template v-if="activeTab === 'fun'">
                    <td class="p-4 text-center" :class="stat.firstBloodRate > 20 ? 'text-red-400 font-bold' : 'text-[#A1A1AA]'">
                      {{ stat.firstBloodRate.toFixed(1) }}%
                    </td>
                    <td class="p-4 text-center text-[#A1A1AA] font-medium">{{ formatDuration(stat.avgTimeSpentDead) }}</td>
                    <td class="p-4 text-center text-[#F0FDF4] font-bold text-xl font-title">{{ stat.largestKillingSpree }}</td>
                    <td class="p-4 text-center text-[#A1A1AA] font-medium">{{ formatDuration(stat.avgGameDuration) }}</td>
                    <td class="p-4 text-center text-[#A1A1AA]">{{ stat.pacifistScore === Infinity ? '-' : stat.pacifistScore }}</td>
                    <td class="p-4 text-center text-red-400 font-bold text-xl font-title">{{ stat.feederScore }}</td>
                    <td class="p-4 text-center text-[#A1A1AA] font-medium">{{ stat.wardDispenserScore.toFixed(2) }}</td>
                    <td class="p-4 text-center text-[#A1A1AA] font-medium">{{ stat.blindScore.toFixed(2) }}</td>
                    <td class="p-4 text-center text-[#A1A1AA] font-bold">{{ stat.survivorScore.toFixed(0) }}</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="sortedStats.length === 0" class="p-20 text-center">
            <div class="text-6xl mb-6 opacity-20">📊</div>
            <p class="text-[#A1A1AA] uppercase tracking-[0.3em] font-bold">No match data recorded yet</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { supabase } from '../lib/supabase';

const showScrollHint = ref(true);

const handleScroll = () => {
  showScrollHint.value = window.scrollY < 100;
};

onMounted(() => {
  fetchStats();
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const metricsContainer = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);

const startDrag = (e: MouseEvent) => {
  isDragging.value = true;
  if (metricsContainer.value) {
    // Temporarily disable smooth scrolling during drag for immediate response
    metricsContainer.value.classList.remove('scroll-smooth', 'snap-x', 'snap-mandatory');
    startX.value = e.pageX - metricsContainer.value.offsetLeft;
    scrollLeft.value = metricsContainer.value.scrollLeft;
  }
};

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !metricsContainer.value) return;
  e.preventDefault();
  const x = e.pageX - metricsContainer.value.offsetLeft;
  const walk = (x - startX.value) * 2; // Scroll-fast multiplier
  metricsContainer.value.scrollLeft = scrollLeft.value - walk;
};

const stopDrag = () => {
  isDragging.value = false;
  if (metricsContainer.value) {
    // Re-enable smooth scrolling and snapping
    metricsContainer.value.classList.add('scroll-smooth', 'snap-x', 'snap-mandatory');
  }
};

const onWheel = (e: WheelEvent) => {
  if (metricsContainer.value) {
    e.preventDefault();
    // Use a multiplier to make wheel scrolling faster and smoother
    metricsContainer.value.scrollBy({
      left: e.deltaY * 1.5,
      behavior: 'smooth'
    });
  }
};

const scrollToRawData = () => {
  const element = document.getElementById('raw-data-section');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

interface PlayerStats {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  
  // Classic
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  kda: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  killParticipation: number;
  
  // Advanced
  totalDamageToChampions: number;
  totalDamageTaken: number;
  totalGoldEarned: number;
  totalVisionScore: number;
  totalMinionsKilled: number;
  totalGameDurationMinutes: number;
  dpm: number;
  gpm: number;
  cspm: number;
  dtpm: number;
  dmgPerGold: number;
  avgVisionScore: number;
  dmgShare: number;
  goldShare: number;
  
  // Fun
  firstBloods: number;
  firstBloodRate: number;
  totalTimeSpentDead: number;
  avgTimeSpentDead: number;
  largestKillingSpree: number;
  totalGameDurationSeconds: number;
  avgGameDuration: number;
  pacifistScore: number;
  feederScore: number;
  wardDispenserScore: number;
  blindScore: number;
  survivorScore: number;
  totalDamageSelfMitigated: number;
  totalWardsPlaced: number;
  maxDeathsInGame: number;
  minDamageInGame: number;
}

const loading = ref(true);
const error = ref<string | null>(null);
const stats = ref<PlayerStats[]>([]);

const tabs = [
  { id: 'classic', label: 'Classique' },
  { id: 'advanced', label: 'Avancé' },
  { id: 'fun', label: 'Fun Facts' }
];
const activeTab = ref('classic');

const topMetrics = [
  // Classic
  { id: 'kda', label: 'KDA' },
  { id: 'avgKills', label: 'K Moy' },
  { id: 'avgDeaths', label: 'D Moy' },
  { id: 'avgAssists', label: 'A Moy' },
  { id: 'killParticipation', label: 'KP %' },
  { id: 'totalKills', label: 'Total Kills' },
  { id: 'totalDeaths', label: 'Total Deaths' },
  { id: 'totalAssists', label: 'Total Assists' },
  
  // Fun
  { id: 'firstBloodRate', label: 'FB %' },
  { id: 'largestKillingSpree', label: 'Série Max' },
  { id: 'avgTimeSpentDead', label: 'Temps mort' },
  { id: 'avgGameDuration', label: 'Temps Moyen' },
  { id: 'pacifistScore', label: 'Pacifiste' },
  { id: 'feederScore', label: 'Feeder' },
  { id: 'wardDispenserScore', label: 'Poseur de Wards' },
  { id: 'blindScore', label: 'L\'Aveugle' },
  { id: 'survivorScore', label: 'Survivant' },

  // Advanced
  { id: 'dpm', label: 'DPM' },
  { id: 'gpm', label: 'GPM' },
  { id: 'cspm', label: 'CS/M' },
  { id: 'dmgShare', label: 'Part Dégâts %' },
  { id: 'goldShare', label: 'Part Gold %' },
  { id: 'avgVisionScore', label: 'Vision' },
  { id: 'dtpm', label: 'Dégâts subis/M' },
  { id: 'dmgPerGold', label: 'Dégâts/Gold' }
] as const;

type TopMetricId = typeof topMetrics[number]['id'];
const activeTopMetric = ref<TopMetricId>('kda');

const activeTopMetricLabel = computed(() => {
  return topMetrics.find(m => m.id === activeTopMetric.value)?.label || '';
});

const top4 = computed(() => {
  return [...stats.value]
    .sort((a, b) => {
      const metricId = activeTopMetric.value;
      let valA = a[metricId] as number;
      let valB = b[metricId] as number;
      
      // Usually highest is top, but for deaths lower is "better". 
      // However, for "freedom", we'll just show the highest value as "Top".
      return valB - valA;
    })
    .slice(0, 4);
});

const classicCols = [
  { key: 'totalKills', label: 'Kills' },
  { key: 'totalDeaths', label: 'Deaths' },
  { key: 'totalAssists', label: 'Assists' },
  { key: 'kda', label: 'KDA' },
  { key: 'avgKills', label: 'K Moy' },
  { key: 'avgDeaths', label: 'D Moy' },
  { key: 'avgAssists', label: 'A Moy' },
  { key: 'killParticipation', label: 'KP %' }
] as const;

const advancedCols = [
  { key: 'dpm', label: 'DPM' },
  { key: 'dtpm', label: 'Dégâts subis/M' },
  { key: 'dmgShare', label: 'Part Dégâts %' },
  { key: 'gpm', label: 'GPM' },
  { key: 'goldShare', label: 'Part Gold %' },
  { key: 'cspm', label: 'CS/M' },
  { key: 'dmgPerGold', label: 'Dégâts/Gold' },
  { key: 'avgVisionScore', label: 'Vision' }
] as const;

const funCols = [
  { key: 'firstBloodRate', label: 'FB %' },
  { key: 'avgTimeSpentDead', label: 'Temps mort' },
  { key: 'largestKillingSpree', label: 'Série Max' },
  { key: 'avgGameDuration', label: 'Temps Moyen' },
  { key: 'pacifistScore', label: 'Pacifiste' },
  { key: 'feederScore', label: 'Feeder' },
  { key: 'wardDispenserScore', label: 'Poseur de Wards' },
  { key: 'blindScore', label: 'L\'Aveugle' },
  { key: 'survivorScore', label: 'Survivant' }
] as const;

const sortKey = ref<keyof PlayerStats>('totalKills');
const sortOrder = ref<'asc' | 'desc'>('desc');

const sortBy = (key: keyof PlayerStats) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'desc';
  }
};

const sortedStats = computed(() => {
  return [...stats.value].sort((a, b) => {
    let valA = a[sortKey.value];
    let valB = b[sortKey.value];
    
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder.value === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }
    
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

const formatMetricValue = (value: any) => {
  if (typeof value !== 'number') return value;
  
  const metricId = activeTopMetric.value;
  
  // Time formats
  if (['avgTimeSpentDead', 'avgGameDuration'].includes(metricId)) {
    return formatDuration(value);
  }
  
  // Percentages
  if (['firstBloodRate', 'killParticipation', 'dmgShare', 'goldShare'].includes(metricId)) {
    return value.toFixed(1) + '%';
  }
  
  // High precision decimals
  if (['cspm', 'wardDispenserScore', 'dmgPerGold', 'blindScore'].includes(metricId)) {
    return value.toFixed(2);
  }
  
  // Standard 1-decimal stats
  if (['avgKills', 'avgDeaths', 'avgAssists', 'avgVisionScore'].includes(metricId)) {
    return value.toFixed(1);
  }
  
  // Integers or rounded values
  if (['dpm', 'gpm', 'dtpm', 'largestKillingSpree', 'survivorScore', 'totalKills', 'totalDeaths', 'totalAssists', 'pacifistScore', 'feederScore'].includes(metricId)) {
    if (value === Infinity) return '-';
    return Math.round(value).toString();
  }
  
  // KDA
  if (metricId === 'kda') {
    return value.toFixed(2);
  }
  
  return value.toString();
};

const getKdaColor = (kda: number) => {
  if (kda >= 4) return 'text-[#EAB308] drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]';
  if (kda >= 3) return 'text-[#22C55E]';
  if (kda < 1.5) return 'text-red-400';
  return 'text-[#F0FDF4]';
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
};

const fetchStats = async () => {
  try {
    loading.value = true;
    error.value = null;

    const { data, error: fetchError } = await supabase
      .from('match_participants')
      .select(`
        *,
        match_history!inner(game_duration),
        players!inner(pseudo, riot_id)
      `);

    if (fetchError) throw fetchError;

    const { data: teamData, error: teamError } = await supabase
      .from('match_participants')
      .select('match_id, team_id, kills, total_damage_dealt_to_champions, gold_earned');
      
    if (teamError && teamError.code !== '42703') throw teamError;

    const teamKillsMap = new Map<string, number>();
    const teamDamageMap = new Map<string, number>();
    const teamGoldMap = new Map<string, number>();
    if (teamData) {
      for (const row of teamData) {
        if (row.match_id && row.team_id !== null) {
          const key = `${row.match_id}_${row.team_id}`;
          teamKillsMap.set(key, (teamKillsMap.get(key) || 0) + (row.kills || 0));
          teamDamageMap.set(key, (teamDamageMap.get(key) || 0) + (row.total_damage_dealt_to_champions || 0));
          teamGoldMap.set(key, (teamGoldMap.get(key) || 0) + (row.gold_earned || 0));
        }
      }
    }

    if (!data || data.length === 0) {
      stats.value = [];
      return;
    }

    const playerMap = new Map<string, PlayerStats>();

    for (const row of data) {
      const playerId = row.player_id;
      const playerName = row.players?.pseudo || row.players?.riot_id || 'Unknown';
      const gameDurationSecs = row.match_history?.game_duration || 0;
      const gameDurationMins = gameDurationSecs / 60;

      if (!playerMap.has(playerId)) {
        playerMap.set(playerId, {
          playerId,
          playerName,
          gamesPlayed: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0,
          kda: 0,
          avgKills: 0,
          avgDeaths: 0,
          avgAssists: 0,
          killParticipation: 0,
          totalDamageToChampions: 0,
          totalDamageTaken: 0,
          totalGoldEarned: 0,
          totalVisionScore: 0,
          totalMinionsKilled: 0,
          totalGameDurationMinutes: 0,
          dpm: 0,
          gpm: 0,
          cspm: 0,
          dtpm: 0,
          dmgPerGold: 0,
          avgVisionScore: 0,
          dmgShare: 0,
          goldShare: 0,
          firstBloods: 0,
          firstBloodRate: 0,
          totalTimeSpentDead: 0,
          avgTimeSpentDead: 0,
          largestKillingSpree: 0,
          totalGameDurationSeconds: 0,
          avgGameDuration: 0,
          pacifistScore: 0,
          feederScore: 0,
          wardDispenserScore: 0,
          blindScore: 0,
          survivorScore: 0,
          totalDamageSelfMitigated: 0,
          totalWardsPlaced: 0,
          maxDeathsInGame: 0,
          minDamageInGame: Infinity,
        });
      }

      const p = playerMap.get(playerId)!;
      p.gamesPlayed++;
      p.totalKills += (row.kills || 0);
      p.totalDeaths += (row.deaths || 0);
      p.totalAssists += (row.assists || 0);
      p.totalDamageToChampions += (row.total_damage_dealt_to_champions || 0);
      p.totalDamageTaken += (row.total_damage_taken || 0);
      p.totalGoldEarned += (row.gold_earned || 0);
      p.totalVisionScore += (row.vision_score || 0);
      p.totalMinionsKilled += (row.total_minions_killed || 0);
      p.totalGameDurationMinutes += gameDurationMins;
      p.totalGameDurationSeconds += gameDurationSecs;
      p.totalDamageSelfMitigated += (row.damage_self_mitigated || 0);
      p.totalWardsPlaced += (row.wards_placed || 0);
      
      if (row.match_id && row.team_id !== null) {
        const key = `${row.match_id}_${row.team_id}`;
        const teamKills = teamKillsMap.get(key) || 0;
        if (teamKills > 0) {
          p.killParticipation += ((row.kills || 0) + (row.assists || 0)) / teamKills;
        }
        
        const teamDamage = teamDamageMap.get(key) || 0;
        if (teamDamage > 0) {
          p.dmgShare += (row.total_damage_dealt_to_champions || 0) / teamDamage;
        }
        
        const teamGold = teamGoldMap.get(key) || 0;
        if (teamGold > 0) {
          p.goldShare += (row.gold_earned || 0) / teamGold;
        }
      }
      
      if (row.first_blood_kill) p.firstBloods++;
      p.totalTimeSpentDead += (row.total_time_spent_dead || 0);
      
      const spree = row.largest_killing_spree || 0;
      if (spree > p.largestKillingSpree) p.largestKillingSpree = spree;
      
      const deaths = row.deaths || 0;
      if (deaths > p.maxDeathsInGame) p.maxDeathsInGame = deaths;
      
      const dmg = row.total_damage_dealt_to_champions || 0;
      if (dmg < p.minDamageInGame) p.minDamageInGame = dmg;
    }

    const finalStats: PlayerStats[] = [];
    for (const p of playerMap.values()) {
      p.avgKills = p.totalKills / p.gamesPlayed;
      p.avgDeaths = p.totalDeaths / p.gamesPlayed;
      p.avgAssists = p.totalAssists / p.gamesPlayed;
      p.kda = (p.totalKills + p.totalAssists) / Math.max(p.totalDeaths, 1);
      p.killParticipation = (p.killParticipation / p.gamesPlayed) * 100;
      p.dmgShare = (p.dmgShare / p.gamesPlayed) * 100;
      p.goldShare = (p.goldShare / p.gamesPlayed) * 100;
      
      p.dpm = p.totalGameDurationMinutes > 0 ? p.totalDamageToChampions / p.totalGameDurationMinutes : 0;
      p.dtpm = p.totalGameDurationMinutes > 0 ? p.totalDamageTaken / p.totalGameDurationMinutes : 0;
      p.gpm = p.totalGameDurationMinutes > 0 ? p.totalGoldEarned / p.totalGameDurationMinutes : 0;
      p.cspm = p.totalGameDurationMinutes > 0 ? p.totalMinionsKilled / p.totalGameDurationMinutes : 0;
      p.dmgPerGold = p.totalGoldEarned > 0 ? p.totalDamageToChampions / p.totalGoldEarned : 0;
      p.avgVisionScore = p.totalVisionScore / p.gamesPlayed;
      
      p.firstBloodRate = (p.firstBloods / p.gamesPlayed) * 100;
      p.avgTimeSpentDead = p.totalTimeSpentDead / p.gamesPlayed;
      p.avgGameDuration = p.totalGameDurationSeconds / p.gamesPlayed;
      
      p.pacifistScore = p.minDamageInGame === Infinity ? 0 : p.minDamageInGame;
      p.feederScore = p.maxDeathsInGame;
      p.wardDispenserScore = p.totalGameDurationMinutes > 0 ? p.totalWardsPlaced / p.totalGameDurationMinutes : 0;
      p.blindScore = p.totalGameDurationMinutes > 0 ? p.totalVisionScore / p.totalGameDurationMinutes : 0;
      p.survivorScore = p.totalGameDurationMinutes > 0 ? p.totalDamageSelfMitigated / p.totalGameDurationMinutes : 0;
      
      finalStats.push(p);
    }

    stats.value = finalStats;
  } catch (err: any) {
    console.error('Error fetching stats:', err);
    error.value = 'Failed to load statistics. Please try again later.';
  } finally {
    loading.value = false;
  }
};
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

@keyframes scrollWheel {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(8px); opacity: 0; }
}

.animate-scroll-wheel {
  animation: scrollWheel 1.5s cubic-bezier(0.15, 0.41, 0.69, 0.94) infinite;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Custom scrollbar for the table */
.overflow-x-auto::-webkit-scrollbar {
  height: 10px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: rgba(11, 15, 12, 0.5);
  border-radius: 5px;
  margin: 0 10px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #2A2A2A;
  border-radius: 5px;
  border: 2px solid rgba(11, 15, 12, 0.5);
}
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #4ADE80;
}
</style>
