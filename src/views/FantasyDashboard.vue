<template>
  <div class="relative min-h-[calc(100vh-3.5rem)] text-[#F0FDF4]">
    <div class="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div class="absolute top-[-18%] left-[-10%] w-[46%] h-[46%] bg-[#4ADE80] opacity-[0.04] blur-[100px] rounded-full"></div>
      <div class="absolute bottom-[-18%] right-[-10%] w-[46%] h-[46%] bg-[#22C55E] opacity-[0.04] blur-[100px] rounded-full"></div>
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.07] mix-blend-overlay"></div>
    </div>
    <div class="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in-up">
    <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-title uppercase tracking-widest text-white mb-2 flex items-center gap-3 drop-shadow-[0_0_20px_rgba(34,197,94,0.2)]">
          <span>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-mcu-primary via-emerald-300 to-teal-200 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse normal-case">Morue-verse</span> 
            <span v-if="!team?.isLocked" class="text-white/90">Draft</span>
            <span v-else class="text-white/90">Dashboard</span>
          </span>
          <button @click="showRules = true" class="p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer" title="Voir les règles">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </h1>
        <p class="text-white/50 text-sm tracking-wide" v-if="!team?.isLocked">Draft tes joueurs pour le tournoi et gère ton équipe Morue-verse.</p>
        <p class="text-white/50 text-sm tracking-wide" v-else>Suis les performances de ton équipe en direct.</p>
      </div>
      
      <div class="flex items-center gap-3 w-full xl:w-auto">
        <!-- Day Toggle -->
        <div class="flex bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-1 shrink-0 shadow-inner relative">
          <div 
            class="absolute inset-y-1 w-[calc(50%-4px)] bg-gradient-to-r from-mcu-primary to-emerald-400 rounded-full transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
            :class="tournamentDay === 1 ? 'translate-x-0 left-1' : 'translate-x-full left-1'"
          ></div>
          <button
            @click="setDay(1)"
            class="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all relative z-10 w-20 sm:w-24 cursor-pointer"
            :class="tournamentDay === 1 ? 'text-white drop-shadow-md' : 'text-white/50 hover:text-white'"
          >
            Jour 1
          </button>
          <button
            @click="setDay(2)"
            class="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all relative z-10 w-20 sm:w-24 cursor-pointer"
            :class="tournamentDay === 2 ? 'text-white drop-shadow-md' : 'text-white/50 hover:text-white'"
          >
            Jour 2
          </button>
        </div>

        <div v-if="!team?.isLocked" class="relative w-full sm:w-56 group">
          <div class="absolute inset-0 bg-mcu-primary/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <div class="relative flex items-center">
            <svg class="absolute left-3 w-4 h-4 text-white/40 group-focus-within:text-mcu-primary transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Rechercher..."
              class="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-mcu-primary/50 focus:ring-1 focus:ring-mcu-primary/50 transition-all shadow-inner placeholder:text-white/30"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-40 opacity-90">
      <div class="relative w-24 h-24 mb-10">
        <div class="absolute inset-0 border-4 border-white/5 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-mcu-primary rounded-full border-t-transparent animate-spin shadow-[0_0_20px_rgba(34,197,94,0.5)]"></div>
        <div class="absolute inset-3 border-4 border-emerald-400/30 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
        <div class="absolute inset-0 bg-mcu-primary/10 rounded-full blur-xl animate-pulse"></div>
      </div>
      <p class="text-mcu-primary uppercase tracking-widest text-sm font-bold animate-pulse drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">Chargement des joueurs...</p>
    </div>

    <!-- Main Layout (Draft Mode) -->
    <div v-else-if="!team?.isLocked" class="flex flex-col lg:flex-row gap-8 items-start">
      
      <!-- Left Column: Players Board (Flex 1) -->
      <div class="flex-1 w-full order-2 lg:order-1 space-y-6">
        
        <!-- Filters -->
        <div class="bg-[#111111]/75 backdrop-blur-2xl border border-[#2A2A2A] rounded-2xl p-3 md:p-4 flex flex-col xl:flex-row gap-4 items-start xl:items-center shadow-[0_8px_32px_rgba(0,0,0,0.55)] overflow-visible hover:border-[#22C55E]/20 transition-colors">
          <!-- Roles + View Toggle -->
          <div class="flex items-center gap-3 w-full xl:w-auto overflow-visible">
            <div class="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar flex-1 py-1">
              <button 
                v-for="role in roles" 
                :key="role.value"
                @click="toggleRoleFilter(role.value)"
                class="px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 border shrink-0 cursor-pointer active:scale-95"
                :class="selectedRole === role.value ? 'bg-mcu-primary/20 border-mcu-primary/50 text-mcu-primary shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20'"
              >
                <img :src="role.icon" class="w-3.5 h-3.5" :class="selectedRole === role.value ? 'invert-[.5] sepia-[1] hue-rotate-[90deg] saturate-[5]' : 'grayscale opacity-50'" />
                <span class="hidden sm:inline">{{ role.label }}</span>
                <span class="sm:hidden">{{ role.label.substring(0, 3) }}</span>
              </button>
              <button 
                v-if="selectedRole"
                @click="selectedRole = null"
                class="px-2 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 shrink-0 cursor-pointer"
                title="Reset"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <!-- View Toggle (Always visible here) -->
            <div class="shrink-0 flex items-center pl-2 border-l border-white/10">
              <div class="inline-flex rounded-xl border border-white/10 bg-black/40 p-0.5 gap-0.5">
                <button
                  type="button"
                  title="Vue cartes"
                  @click="setPlayerView('cards')"
                  class="rounded-lg p-1.5 transition-all duration-300 cursor-pointer"
                  :class="playerView === 'cards' ? 'bg-mcu-primary/20 text-mcu-primary shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'text-white/40 hover:text-white hover:bg-white/5'"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button
                  type="button"
                  title="Vue tableau"
                  @click="setPlayerView('table')"
                  class="rounded-lg p-1.5 transition-all duration-300 cursor-pointer"
                  :class="playerView === 'table' ? 'bg-mcu-primary/20 text-mcu-primary shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'text-white/40 hover:text-white hover:bg-white/5'"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" stroke-width="2" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9h18M3 14h18M9 4v16" /></svg>
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex-1 w-full xl:w-auto flex flex-col sm:flex-row gap-3">
            <div class="relative group flex-1">
              <div class="absolute inset-0 bg-mcu-primary/10 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <select v-model="selectedRank" class="relative w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-mcu-primary/50 focus:ring-1 focus:ring-mcu-primary/50 transition-all appearance-none cursor-pointer shadow-inner">
                <option :value="null">Tous les rangs</option>
                <option v-for="rank in ranks" :key="rank" :value="rank">{{ rank }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-white/40 group-focus-within:text-mcu-primary transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            
            <div class="relative group flex-1">
              <div class="absolute inset-0 bg-mcu-primary/10 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <select v-model="sortBy" class="relative w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-mcu-primary/50 focus:ring-1 focus:ring-mcu-primary/50 transition-all appearance-none cursor-pointer shadow-inner">
                <option value="rank">Trier: Rang</option>
                <option value="role">Trier: Rôle</option>
                <option value="name">Trier: A-Z</option>
                <option value="price">Trier: Prix</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-white/40 group-focus-within:text-mcu-primary transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Players Grid -->
        <TransitionGroup 
          name="list" 
          tag="div" 
          v-if="filteredPlayers.length > 0 && playerView === 'cards'" 
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
        >
          <div 
            v-for="player in filteredPlayers" 
            :key="player.id"
            class="relative bg-gradient-to-br from-[#1A1A1A] to-[#111111] backdrop-blur-xl rounded-2xl border border-[#2A2A2A] overflow-hidden transition-all duration-500 group shadow-[0_10px_32px_rgba(0,0,0,0.55)] hover:shadow-[0_16px_44px_rgba(34,197,94,0.12)] hover:-translate-y-1"
            :class="[
              isPlayerSelected(player.id) ? 'ring-2 ring-mcu-primary ring-offset-2 ring-offset-[#0B0F0C] opacity-90' : 'hover:border-mcu-primary/45',
              getTierGlow(player.fantasy.rank)
            ]"
          >
            <!-- Full-card splash background -->
            <img
              v-if="getDraftCardSplashUrl(player)"
              :src="getDraftCardSplashUrl(player)"
              class="absolute inset-0 w-full h-full object-cover object-top opacity-40 scale-[1.05] transition-all duration-700 group-hover:scale-[1.1] group-hover:opacity-60"
              alt=""
            />
            <div class="absolute inset-0 bg-gradient-to-b from-black/15 via-[#111111]/70 to-[#0B0F0C] transition-opacity duration-500 group-hover:opacity-90"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-[#0B0F0C] via-transparent to-transparent opacity-90"></div>

            <!-- Card Header (Avatar + Info) -->
            <div class="relative h-24 overflow-hidden">
              <div class="absolute bottom-3 left-4 right-4 z-20 flex justify-between items-end">
                <div>
                  <h3 class="text-xl font-title tracking-wider text-white drop-shadow-lg">{{ player.pseudo }}</h3>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 border backdrop-blur-sm shadow-inner" :class="getTierColor(player.fantasy.rank)">
                      {{ player.rank }}
                    </span>
                  </div>
                </div>
                
                <div class="flex gap-1.5">
                  <div class="w-7 h-7 rounded-full bg-black/60 border border-white/10 flex items-center justify-center backdrop-blur-md hover:border-mcu-primary/50 hover:bg-mcu-primary/20 transition-all duration-300 shadow-lg" title="Rôle Principal">
                    <img :src="getRoleIcon(player.primary_role)" class="w-4 h-4 invert-[.5] sepia-[1] hue-rotate-[90deg] saturate-[5]" />
                  </div>
                  <div v-if="player.secondary_role" class="w-7 h-7 rounded-full bg-black/60 border border-white/10 flex items-center justify-center backdrop-blur-md hover:border-mcu-primary/50 hover:bg-mcu-primary/20 transition-all duration-300 shadow-lg" title="Rôle Secondaire">
                    <img :src="getRoleIcon(player.secondary_role)" class="w-4 h-4 invert-[.5] sepia-[1] hue-rotate-[190deg] saturate-[5]" />
                  </div>
                </div>
              </div>
              
              <!-- Fantasy Price Badge -->
              <div class="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-xl px-2.5 py-1 rounded-full border border-white/10 font-title text-mcu-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.4)] flex items-center gap-1 group-hover:scale-105 transition-transform duration-300 shadow-lg text-sm">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {{ getDisplayPrice(player.fantasy) }}
                <span v-if="getPriceChange(player.fantasy) > 0" class="text-[9px] text-red-400 ml-0.5 font-sans">(+{{ getPriceChange(player.fantasy) }})</span>
                <span v-else-if="getPriceChange(player.fantasy) < 0" class="text-[9px] text-mcu-primary ml-0.5 font-sans">({{ getPriceChange(player.fantasy) }})</span>
              </div>
            </div>

            <!-- Card Body -->
            <div class="relative p-3 space-y-3 bg-gradient-to-t from-[#111111] via-[#0B0F0C]/95 to-transparent">
              <div class="flex justify-between items-center text-[10px]">
                <div class="flex gap-1.5">
                  <span class="bg-black/40 px-2 py-1 rounded border border-white/5 text-white/80 shadow-inner"><span class="text-white/40 text-[8px] uppercase mr-1">Style</span>{{ player.playstyle }}</span>
                  <span class="bg-black/40 px-2 py-1 rounded border border-white/5 text-white/80 shadow-inner"><span class="text-white/40 text-[8px] uppercase mr-1">Mindset</span>{{ player.mindset }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex gap-1.5">
                  <div 
                    v-for="champ in player.champion_pool" 
                    :key="champ"
                    class="w-6 h-6 rounded-full overflow-hidden border border-white/20 relative group/champ shadow-[0_4px_10px_rgba(0,0,0,0.6)] hover:scale-110 hover:border-mcu-primary/50 hover:shadow-[0_0_10px_rgba(34,197,94,0.4)] transition-all duration-300 hover:z-10 cursor-default"
                  >
                    <img :src="getChampionSquare(champ)" class="w-full h-full object-cover" :title="champ" />
                    <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/champ:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px] pointer-events-none">
                      <span class="text-[7px] font-bold text-white truncate px-0.5">{{ champ.substring(0, 3) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Fantasy Actions -->
                <div class="relative z-20 shrink-0">
                  <button
                    v-if="isPlayerSelected(player.id)"
                    @click="removePlayer(player.id)"
                    class="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/60 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_20px_rgba(239,68,68,0.25)] cursor-pointer"
                  >
                    Retirer
                  </button>
                  <button
                    v-else
                    @click="addPlayer(player.fantasy)"
                    :disabled="team?.isLocked || selectedPlayers.length >= 5 || !player.fantasy.fantasyEnabled"
                    class="px-3 py-1.5 bg-white/5 hover:bg-mcu-primary text-white border border-white/10 hover:border-mcu-primary rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] backdrop-blur-md cursor-pointer disabled:cursor-not-allowed"
                  >
                    {{ !player.fantasy.fantasyEnabled ? 'Non Éligible' : 'Draft' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Players Table -->
        <div v-else-if="filteredPlayers.length > 0 && playerView === 'table'" class="rounded-[1.5rem] border border-[#2A2A2A] bg-gradient-to-b from-[#1A1A1A]/92 to-[#0B0F0C]/88 backdrop-blur-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.55)]">
          <div class="overflow-x-auto">
            <table class="min-w-[960px] w-full text-left text-sm">
              <thead class="sticky top-0 z-10 bg-[#0B0F0C]/90 backdrop-blur-md border-b border-[#2A2A2A]">
                <tr class="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  <th class="px-6 py-4 whitespace-nowrap">Pseudo</th>
                  <th class="px-6 py-4 whitespace-nowrap">Rang</th>
                  <th class="px-6 py-4 whitespace-nowrap">Rôle P.</th>
                  <th class="px-6 py-4 whitespace-nowrap">Rôle S.</th>
                  <th class="px-6 py-4 min-w-[150px]">Champion pool</th>
                  <th class="px-6 py-4 whitespace-nowrap">Prix (pts)</th>
                  <th class="px-6 py-4 whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <TransitionGroup name="list" tag="tbody" class="divide-y divide-white/5">
                <tr
                  v-for="player in filteredPlayers"
                  :key="player.id"
                  class="hover:bg-white/5 transition-all duration-300 group"
                  :class="isPlayerSelected(player.id) ? 'bg-mcu-primary/10' : ''"
                >
                  <td class="px-6 py-4 font-title tracking-wider text-white whitespace-nowrap group-hover:text-mcu-primary transition-colors text-lg">
                    {{ player.pseudo }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-xs font-bold px-3 py-1 rounded-md bg-black/60 border shadow-inner" :class="getTierColor(player.fantasy.rank)">
                      {{ player.rank }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-white/90 whitespace-nowrap uppercase text-xs font-bold flex items-center gap-2">
                    <img :src="getRoleIcon(player.primary_role)" class="w-4 h-4 invert-[.5] sepia-[1] hue-rotate-[90deg] saturate-[5]" />
                    {{ player.primary_role }}
                  </td>
                  <td class="px-6 py-4 text-white/50 whitespace-nowrap uppercase text-xs font-bold flex items-center gap-2">
                    <img v-if="player.secondary_role" :src="getRoleIcon(player.secondary_role)" class="w-4 h-4 invert-[.5] sepia-[1] hue-rotate-[190deg] saturate-[5]" />
                    {{ player.secondary_role || '—' }}
                  </td>
                  <td class="px-6 py-4">
                    <div v-if="player.champion_pool?.length" class="flex flex-wrap items-center gap-2">
                      <div
                        v-for="champ in player.champion_pool"
                        :key="champ"
                        class="w-8 h-8 shrink-0 rounded-full overflow-hidden border border-white/20 shadow-md hover:scale-110 transition-transform"
                        :title="champ"
                      >
                        <img :src="getChampionSquare(champ)" class="w-full h-full object-cover" :alt="champ" />
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 font-title text-mcu-primary text-lg drop-shadow-md">
                    {{ getDisplayPrice(player.fantasy) }}
                    <span v-if="getPriceChange(player.fantasy) > 0" class="text-xs text-red-400 ml-1 font-sans">(+{{ getPriceChange(player.fantasy) }})</span>
                    <span v-else-if="getPriceChange(player.fantasy) < 0" class="text-xs text-mcu-primary ml-1 font-sans">({{ getPriceChange(player.fantasy) }})</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button
                      v-if="isPlayerSelected(player.id)"
                      @click="removePlayer(player.id)"
                      class="px-5 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all cursor-pointer"
                    >
                      Retirer
                    </button>
                    <button
                      v-else
                      @click="addPlayer(player.fantasy)"
                      :disabled="team?.isLocked || selectedPlayers.length >= 5 || !player.fantasy.fantasyEnabled"
                      class="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider hover:border-mcu-primary hover:text-white hover:bg-mcu-primary/20 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Draft
                    </button>
                  </td>
                </tr>
              </TransitionGroup>
            </table>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-32 bg-[#111111]/40 backdrop-blur-xl rounded-[2rem] border border-dashed border-[#2A2A2A]/70 transition-all hover:border-mcu-primary/35 hover:bg-[#1A1A1A]/50 group shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div class="relative w-24 h-24 mx-auto mb-8">
            <div class="absolute inset-0 bg-mcu-primary/10 rounded-full blur-2xl group-hover:bg-mcu-primary/20 transition-colors duration-500"></div>
            <svg class="relative z-10 w-24 h-24 text-white/20 group-hover:text-mcu-primary/70 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-3xl font-title tracking-wider text-white mb-3 group-hover:text-mcu-primary transition-colors duration-500 drop-shadow-md">Aucun joueur trouvé</h3>
          <p class="text-white/50 text-base tracking-wide">Modifiez vos filtres pour voir plus de résultats.</p>
        </div>

      </div>

      <!-- Right Column (Sidebar): Fantasy Dashboard (Fixed width on large screens) -->
      <div class="w-full lg:w-[360px] shrink-0 order-1 lg:order-2">
        <div class="sticky top-8 space-y-6">
          
          <div class="bg-gradient-to-br from-[#1A1A1A] to-[#0B0F0C] backdrop-blur-xl border border-[#22C55E]/25 rounded-3xl p-5 shadow-[0_20px_56px_rgba(0,0,0,0.65)] relative overflow-hidden">
            <!-- Subtle background glow -->
            <div class="absolute -top-40 -right-40 w-80 h-80 bg-mcu-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="flex justify-between items-start gap-3 mb-5 relative z-10">
              <div class="flex items-start gap-2 min-w-0 flex-1">
                <svg class="w-5 h-5 text-mcu-primary shrink-0 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <input
                  v-model="teamName"
                  type="text"
                  maxlength="64"
                  autocomplete="off"
                  placeholder="Mon équipe"
                  aria-label="Nom de l'équipe"
                  class="w-full min-w-0 bg-transparent border-0 border-b-2 border-white/15 pb-1.5 text-lg sm:text-xl font-title uppercase tracking-widest text-white placeholder:text-white/25 focus:border-mcu-primary/80 focus:outline-none focus:ring-0 transition-colors drop-shadow-[0_0_12px_rgba(0,0,0,0.4)]"
                />
              </div>
              <div class="px-3 py-1 rounded-xl bg-black/60 border border-white/10 text-xs font-bold font-title shadow-inner shrink-0">
                <span :class="budgetRemaining >= 0 ? 'text-mcu-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]'">{{ budgetRemaining }}</span>
                <span class="text-white/40"> / {{ maxBudget }}</span>
              </div>
            </div>

            <!-- Budget Progress Bar -->
            <div class="mb-6 relative z-10">
              <div class="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                  class="h-full transition-all duration-700 ease-out relative"
                  :class="budgetRemaining >= 0 ? 'bg-gradient-to-r from-mcu-primary/60 to-mcu-primary shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-gradient-to-r from-red-500/60 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]'"
                  :style="{ width: `${Math.min(100, Math.max(0, ((maxBudget - budgetRemaining) / maxBudget) * 100))}%` }"
                >
                  <div class="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>

            <div v-if="tournamentDay === 2 && !team?.isLocked" class="bg-white/5 border border-white/10 rounded-xl p-3 mb-5 flex flex-col gap-2">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-mcu-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <p class="text-[11px] text-white/65">
                    Transferts gratuits: <strong class="text-white">{{ Math.max(0, 2 - transfersMade) }} / 2</strong>
                  </p>
                </div>
                <div v-if="penaltyPoints > 0" class="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  -{{ penaltyPoints }} pts
                </div>
              </div>
              <p v-if="penaltyPoints > 0" class="text-[10px] text-red-400/80 italic">
                Pénalité pour transferts supplémentaires (-20 pts par transfert).
              </p>
            </div>

            <div v-if="team?.isLocked" class="bg-white/5 border border-white/10 rounded-xl p-3 mb-5 flex flex-col gap-2">
              <div class="flex items-start gap-2">
                <svg class="w-4 h-4 text-mcu-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p class="text-[11px] text-white/65">
                  L'équipe est verrouillée. Les matchs ont commencé.
                </p>
              </div>
              <button 
                @click="replayAnimation"
                class="w-full py-1.5 bg-mcu-primary/15 hover:bg-mcu-primary/25 border border-mcu-primary/35 rounded-lg text-[10px] font-bold text-mcu-primary uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Voir les Résultats
              </button>
            </div>

            <TransitionGroup name="list" tag="div" class="space-y-2.5 relative z-10">
              <div v-for="roleObj in roles" :key="roleObj.value" class="relative bg-black/30 border rounded-xl overflow-hidden h-[60px] transition-all duration-300 group/slot" :class="[
                getPlayerByRole(roleObj.value) ? 'border-[#2A2A2A] bg-gradient-to-r from-[#1A1A1A]/85 to-[#111111]/85 shadow-lg hover:border-mcu-primary/40' : 'border-white/5 border-dashed hover:border-white/20 hover:bg-white/5',
                getPlayerByRole(roleObj.value) && captainId === getPlayerByRole(roleObj.value)?.id ? 'ring-2 ring-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : ''
              ]">
                <div v-if="getPlayerByRole(roleObj.value)" class="flex items-center h-full relative z-10">
                  <!-- Background Splash -->
                  <div class="absolute inset-0 opacity-20 mix-blend-luminosity pointer-events-none transition-opacity duration-300 group-hover/slot:opacity-40">
                    <img v-if="getRosterCardSplashUrl(getPlayerByRole(roleObj.value)!.id)" :src="getRosterCardSplashUrl(getPlayerByRole(roleObj.value)!.id)" class="w-full h-full object-cover object-top" />
                    <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
                  </div>

                  <!-- Role Icon -->
                  <div class="w-10 h-full flex items-center justify-center bg-black/40 border-r border-white/10 shrink-0 relative z-10 backdrop-blur-sm">
                    <img :src="roleObj.icon" class="w-4 h-4 invert-[.5] sepia-[1] hue-rotate-[90deg] saturate-[5]" />
                  </div>

                  <!-- Info -->
                  <div class="flex-1 px-3 min-w-0 flex flex-col justify-center relative z-10">
                    <div class="flex items-center gap-1.5">
                      <span class="font-bold text-white text-sm tracking-wide truncate drop-shadow-md">{{ getPlayerByRole(roleObj.value)!.pseudo }}</span>
                      <span v-if="captainId === getPlayerByRole(roleObj.value)!.id" class="shrink-0 px-1 py-0.5 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded text-[8px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.2)]">CAP</span>
                    </div>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="text-[9px] font-title px-1.5 py-0.5 rounded bg-black/60 border backdrop-blur-sm" :class="getTierColor(getPlayerByRole(roleObj.value)!.rank)">{{ getPlayerByRole(roleObj.value)!.rank }}</span>
                      <span class="text-[9px] text-white/50 uppercase tracking-wider truncate">{{ getPlayerByRole(roleObj.value)!.roles.join('/') }}</span>
                    </div>
                  </div>

                  <!-- Price (Default view) -->
                  <div class="px-3 font-title text-mcu-primary text-base drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] group-hover/slot:opacity-0 transition-opacity duration-200 relative z-10">
                    {{ getDisplayPrice(getPlayerByRole(roleObj.value)!) }}
                  </div>

                  <!-- Actions (Hover view) -->
                  <div class="flex items-center gap-1.5 px-2 opacity-0 group-hover/slot:opacity-100 transition-opacity duration-200 bg-gradient-to-l from-[#111111] via-[#111111]/92 to-transparent h-full absolute right-0 z-20">
                    <button 
                      v-if="!(team?.isLocked)"
                      @click="setCaptain(getPlayerByRole(roleObj.value)!.id)"
                      class="p-1.5 rounded-lg bg-black/60 hover:bg-yellow-500/20 text-white/50 hover:text-yellow-500 border border-white/10 hover:border-yellow-500/50 transition-all backdrop-blur-sm cursor-pointer shadow-lg"
                      :class="captainId === getPlayerByRole(roleObj.value)!.id ? 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10' : ''"
                      title="Définir Capitaine (x1.5 pts)"
                    >
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                    <button 
                      v-if="!(team?.isLocked)"
                      @click="removePlayer(getPlayerByRole(roleObj.value)!.id)"
                      class="p-1.5 rounded-lg bg-black/60 hover:bg-red-500/20 text-white/50 hover:text-red-500 border border-white/10 hover:border-red-500/50 transition-all backdrop-blur-sm cursor-pointer shadow-lg"
                      title="Retirer"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div v-else class="flex items-center justify-center h-full text-white/20 text-[10px] font-bold uppercase tracking-widest relative z-10 gap-2 group-hover/slot:text-white/40 transition-colors">
                  <img :src="roleObj.icon" class="w-4 h-4 grayscale opacity-20 group-hover/slot:opacity-40 transition-opacity" />
                  {{ roleObj.label }}
                </div>
              </div>
            </TransitionGroup>

            <div v-if="validationErrors.length > 0 && selectedPlayers.length > 0" class="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 relative z-10">
              <h4 class="text-red-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Problèmes :</h4>
              <ul class="text-[10px] text-red-300/80 space-y-1 list-disc pl-3">
                <li v-for="(err, idx) in validationErrors" :key="idx">{{ err }}</li>
              </ul>
            </div>

            <div class="mt-6 pt-5 border-t border-white/10 relative">
              <!-- Glow behind button -->
              <div v-if="isValid && !isSaving" class="absolute inset-0 top-5 bg-mcu-primary/20 blur-xl rounded-full z-0"></div>
              
              <button
                v-if="!(team?.isLocked)"
                @click="handleSave"
                :disabled="!isValid || isSaving"
                class="relative z-10 w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
                :class="isValid ? 'bg-mcu-primary text-white hover:bg-mcu-accent hover:scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.7)]' : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'"
              >
                <span v-if="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <svg v-if="!isSaving && isValid" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ isSaving ? 'Sauvegarde...' : 'Valider l\'équipe' }}
              </button>
              
              <!-- Success Message Animation -->
              <Transition name="fade">
                <div v-if="saveSuccess" class="absolute -top-10 left-0 right-0 flex justify-center">
                  <div class="bg-mcu-primary/20 border border-mcu-primary text-mcu-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    Équipe validée
                  </div>
                </div>
              </Transition>
              
              <div v-if="error" class="mt-3 text-[10px] text-red-400 text-center bg-red-500/10 py-1.5 rounded-lg border border-red-500/20">{{ error }}</div>
            </div>
            
          </div>
        </div>
      </div>
      
    </div>

    <!-- Locked Dashboard Layout -->
    <div v-else class="flex flex-col gap-6 animate-fade-in-up w-full max-w-6xl mx-auto">
      <!-- Header / Total Points -->
      <div class="bg-gradient-to-br from-[#1A1A1A] to-[#0B0F0C] backdrop-blur-xl border border-[#22C55E]/25 rounded-3xl p-6 shadow-[0_20px_56px_rgba(0,0,0,0.65)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-mcu-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="relative z-10 text-center md:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/85 text-[10px] font-bold uppercase tracking-widest mb-3 shadow-inner">
            <svg class="w-3.5 h-3.5 text-mcu-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Équipe Verrouillée
          </div>
          <h2 class="sr-only">Équipe Morue-verse jour {{ tournamentDay }}</h2>
          <div class="w-full max-w-4xl mt-1">
            <div class="flex flex-wrap items-end gap-x-2 gap-y-2 md:gap-x-3">
              <input
                id="fantasy-team-name-locked"
                v-model="teamName"
                type="text"
                maxlength="64"
                autocomplete="off"
                aria-label="Nom de l'équipe"
                placeholder="MON ÉQUIPE"
                class="flex-1 min-w-[8rem] max-w-full bg-transparent border-0 border-b-2 border-white/25 pb-1 md:pb-1.5 text-2xl sm:text-3xl md:text-4xl font-title uppercase tracking-widest text-white placeholder:text-white/30 focus:border-mcu-primary focus:outline-none focus:ring-0 transition-colors drop-shadow-lg leading-tight"
                @keydown.enter.prevent="flushSaveTeamName"
                @blur="flushSaveTeamName"
              />
              <span class="hidden sm:inline text-2xl sm:text-3xl md:text-4xl font-title uppercase tracking-widest text-white/35 pb-1 md:pb-1.5 select-none">—</span>
              <span class="text-2xl sm:text-3xl md:text-4xl font-title uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-mcu-primary to-emerald-300 pb-1 md:pb-1.5 shrink-0 leading-tight">Jour {{ tournamentDay }}</span>
            </div>
            <p v-if="isSavingName" class="mt-2 text-[11px] text-white/50 font-bold uppercase tracking-wider">Enregistrement…</p>
            <p v-else-if="nameSaveSuccess" class="mt-2 text-[11px] text-mcu-primary font-bold uppercase tracking-wider">Nom enregistré</p>
            <p v-if="error && team?.isLocked" class="mt-2 text-[11px] text-red-400">{{ error }}</p>
          </div>
          
          <!-- Leaderboard Info -->
          <div class="mt-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div v-if="userRank" class="flex items-center gap-3 bg-[#111111]/50 border border-[#2A2A2A] rounded-xl px-4 py-2 shadow-inner">
              <div class="flex items-center justify-center w-10 h-10 rounded-full font-title text-xl"
                   :class="userRank === 1 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 
                           userRank === 2 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/50 shadow-[0_0_20px_rgba(209,213,219,0.3)]' : 
                           userRank === 3 ? 'bg-orange-600/20 text-orange-500 border border-orange-600/50 shadow-[0_0_20px_rgba(234,88,12,0.3)]' : 
                           'bg-white/5 text-white border border-white/20'">
                #{{ userRank }}
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] uppercase tracking-widest text-white/50 font-bold">Classement</span>
                <span class="text-sm font-bold text-white">sur {{ totalParticipants }} participants</span>
              </div>
            </div>
            
            <router-link to="/fantasy-leaderboard" class="group flex items-center gap-2 px-4 py-3 bg-[#111111]/40 hover:bg-mcu-primary/15 border border-[#2A2A2A] hover:border-mcu-primary/50 rounded-xl text-xs font-bold text-white uppercase tracking-widest transition-all cursor-pointer h-full shadow-lg">
              <svg class="w-4 h-4 text-mcu-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Voir le Leaderboard
            </router-link>
          </div>
        </div>

        <div class="relative z-10 flex flex-col items-center bg-[#111111]/55 border border-[#2A2A2A] rounded-2xl p-5 min-w-[200px] shadow-inner">
          <span class="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Total Points</span>
          <div class="text-5xl font-title flex items-center gap-2"
               :class="(team?.totalPoints || 0) > 0
                 ? 'text-mcu-primary drop-shadow-[0_0_20px_rgba(34,197,94,0.45)]'
                 : (team?.totalPoints || 0) < 0
                   ? 'text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.35)]'
                   : 'text-white/75'">
            {{ team?.totalPoints?.toFixed(2) || '0.00' }}
            <svg v-if="(team?.totalPoints || 0) > 0" class="w-8 h-8 text-mcu-primary animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            <svg v-else-if="(team?.totalPoints || 0) < 0" class="w-8 h-8 text-red-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
          </div>
          <button 
            @click="replayAnimation"
            class="mt-4 px-4 py-1.5 bg-white/5 hover:bg-mcu-primary/20 border border-white/10 hover:border-mcu-primary/50 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Dernier Match
          </button>
        </div>
      </div>

      <!-- Players Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div 
          v-for="roleObj in roles" 
          :key="roleObj.value"
          class="relative bg-gradient-to-br from-[#1A1A1A] to-[#111111] backdrop-blur-xl rounded-2xl border border-[#2A2A2A] overflow-hidden transition-all duration-500 group shadow-[0_14px_44px_rgba(0,0,0,0.55)]"
          :class="[
            getPlayerByRole(roleObj.value) ? 'border-[#2A2A2A] hover:border-mcu-primary/45 hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(34,197,94,0.14)]' : 'border-white/10 border-dashed opacity-50',
            getPlayerByRole(roleObj.value) && captainId === getPlayerByRole(roleObj.value)?.id ? 'ring-2 ring-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : ''
          ]"
        >
          <template v-if="getPlayerByRole(roleObj.value)">
            <!-- Background Splash -->
            <img
              v-if="getRosterCardSplashUrl(getPlayerByRole(roleObj.value)!.id)"
              :src="getRosterCardSplashUrl(getPlayerByRole(roleObj.value)!.id)"
              class="absolute inset-0 w-full h-full object-cover object-top opacity-30 scale-[1.05] transition-transform duration-700 group-hover:scale-[1.1]"
              alt=""
            />
            <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-[#111111]/82 to-[#0B0F0C]/95"></div>
            
            <div class="relative p-4 h-full flex flex-col">
              <!-- Card Header (Avatar + Info) -->
              <div class="flex justify-between items-start mb-4">
                <div class="w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-lg">
                  <img :src="roleObj.icon" class="w-5 h-5 invert-[.5] sepia-[1] hue-rotate-[90deg] saturate-[5]" />
                </div>
                
                <div class="flex flex-col items-end">
                  <div class="text-xl font-title flex items-center gap-1.5"
                       :class="(playerScores[getPlayerByRole(roleObj.value)!.id] || 0) > 0
                         ? 'text-mcu-primary drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                         : (playerScores[getPlayerByRole(roleObj.value)!.id] || 0) < 0
                           ? 'text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.3)]'
                           : 'text-white/70'">
                    {{ (playerScores[getPlayerByRole(roleObj.value)!.id] || 0).toFixed(2) }} pts
                    <svg v-if="(playerScores[getPlayerByRole(roleObj.value)!.id] || 0) > 0" class="w-4 h-4 text-mcu-primary animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    <svg v-else-if="(playerScores[getPlayerByRole(roleObj.value)!.id] || 0) < 0" class="w-4 h-4 text-red-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                  </div>
                  <div v-if="captainId === getPlayerByRole(roleObj.value)!.id" class="px-2 py-0.5 mt-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded text-[9px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center gap-1">
                    <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    Capitaine (x1.5)
                  </div>
                  <div v-if="playerStats[getPlayerByRole(roleObj.value)!.id]" class="px-2 py-0.5 mt-1 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                       :class="playerStats[getPlayerByRole(roleObj.value)!.id].wins > 0 ? 'bg-mcu-primary/15 text-mcu-primary border border-mcu-primary/35 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'">
                    <span v-if="playerStats[getPlayerByRole(roleObj.value)!.id].wins > 0">Victoire</span>
                    <span v-else>Défaite</span>
                  </div>
                </div>
              </div>

                <!-- Player Info -->
              <div class="mt-auto">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="text-lg font-title tracking-wider text-white drop-shadow-lg">{{ getPlayerByRole(roleObj.value)!.pseudo }}</h3>
                  <div v-if="playerStats[getPlayerByRole(roleObj.value)!.id]" class="flex items-center gap-1">
                    <div class="w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]" title="Champion joué">
                      <img :src="getChampionSquareById(playerStats[getPlayerByRole(roleObj.value)!.id].championIds[0])" class="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 border backdrop-blur-sm shadow-inner" :class="getTierColor(getPlayerByRole(roleObj.value)!.rank)">
                    {{ getPlayerByRole(roleObj.value)!.rank }}
                  </span>
                  <span class="text-[10px] text-white/50 font-bold">Prix: {{ getDisplayPrice(getPlayerByRole(roleObj.value)!) }} pts</span>
                </div>

                  <!-- Match Stats if available -->
                <div v-if="playerStats[getPlayerByRole(roleObj.value)!.id]" class="bg-[#111111]/55 border border-[#2A2A2A] rounded-xl p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 shadow-inner">
                  <div class="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white/5 group/stat hover:bg-white/10 transition-colors" title="Kills / Deaths / Assists">
                    <span class="text-[8px] uppercase text-white/40 font-bold mb-0.5">K/D/A</span>
                    <span class="text-xs text-white font-title group-hover/stat:text-mcu-primary transition-colors">
                      {{ playerStats[getPlayerByRole(roleObj.value)!.id].kills }}/{{ playerStats[getPlayerByRole(roleObj.value)!.id].deaths }}/{{ playerStats[getPlayerByRole(roleObj.value)!.id].assists }}
                    </span>
                  </div>
                  <div class="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white/5 group/stat hover:bg-white/10 transition-colors" title="Ratio KDA">
                    <span class="text-[8px] uppercase text-white/40 font-bold mb-0.5">Ratio</span>
                    <span class="text-xs font-title transition-colors" :class="parseFloat(playerStats[getPlayerByRole(roleObj.value)!.id].kda) >= 3 ? 'text-mcu-primary group-hover/stat:text-emerald-300' : 'text-white group-hover/stat:text-gray-300'">
                      {{ playerStats[getPlayerByRole(roleObj.value)!.id].kda }}
                    </span>
                  </div>
                  <div class="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white/5 group/stat hover:bg-white/10 transition-colors" title="Score de Vision">
                    <span class="text-[8px] uppercase text-white/40 font-bold mb-0.5">Vision</span>
                    <span class="text-xs text-white font-title group-hover/stat:text-mcu-primary transition-colors">
                      {{ playerStats[getPlayerByRole(roleObj.value)!.id].vision_score }}
                    </span>
                  </div>
                  <div class="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white/5 relative overflow-hidden group/renta transition-all hover:scale-105" title="Points gagnés par rapport au prix d'achat">
                    <div class="absolute inset-0 opacity-10 transition-opacity group-hover/renta:opacity-20"
                         :class="((playerScores[getPlayerByRole(roleObj.value)!.id] || 0) / getDisplayPrice(getPlayerByRole(roleObj.value)!)) >= 1 ? 'bg-mcu-primary' : 'bg-red-500'"></div>
                    <span class="text-[8px] uppercase text-white/40 font-bold mb-0.5 relative z-10">Rentabilité</span>
                    <div class="flex items-center gap-0.5 relative z-10">
                      <span class="text-xs font-title transition-colors" :class="((playerScores[getPlayerByRole(roleObj.value)!.id] || 0) / getDisplayPrice(getPlayerByRole(roleObj.value)!)) >= 1 ? 'text-mcu-primary group-hover/renta:text-emerald-300' : 'text-red-400 group-hover/renta:text-red-300'">
                        {{ ((playerScores[getPlayerByRole(roleObj.value)!.id] || 0) / getDisplayPrice(getPlayerByRole(roleObj.value)!)).toFixed(2) }}x
                      </span>
                      <svg v-if="((playerScores[getPlayerByRole(roleObj.value)!.id] || 0) / getDisplayPrice(getPlayerByRole(roleObj.value)!)) >= 1" class="w-2.5 h-2.5 text-mcu-primary group-hover/renta:text-emerald-300 transition-colors group-hover/renta:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      <svg v-else class="w-2.5 h-2.5 text-red-400 group-hover/renta:text-red-300 transition-colors group-hover/renta:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    </div>
                  </div>
                </div>
                <div v-else class="bg-[#111111]/40 border border-[#2A2A2A] rounded-xl p-3 text-center flex flex-col items-center justify-center gap-2 shadow-inner">
                  <div class="w-6 h-6 border-2 border-mcu-primary/30 border-t-mcu-primary rounded-full animate-spin"></div>
                  <span class="text-[10px] text-white/40 font-bold uppercase tracking-widest">En attente des résultats...</span>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <img :src="roleObj.icon" class="w-10 h-10 grayscale opacity-20 mb-3" />
              <span class="text-xs font-bold uppercase tracking-widest text-white/30">Aucun joueur</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- Rules Modal -->
  <Transition name="fade">
    <div v-if="showRules" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="showRules = false"></div>
      <div class="relative bg-gradient-to-b from-[#1A1A1A] to-[#0B0F0C] backdrop-blur-2xl border border-[#22C55E]/25 rounded-[2rem] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_24px_70px_rgba(0,0,0,0.75)] overflow-hidden animate-scale-in">
      <div class="flex justify-between items-center p-8 border-b border-[#2A2A2A] bg-black/25">
        <h2 class="text-3xl font-title uppercase tracking-widest text-white flex items-center gap-4 drop-shadow-lg">
          <svg class="w-8 h-8 text-mcu-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Règles <span class="text-transparent bg-clip-text bg-gradient-to-r from-mcu-primary to-emerald-300 normal-case">Morue-verse</span>
        </h2>
        <button @click="showRules = false" class="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="p-8 overflow-y-auto custom-scrollbar space-y-10">
        <!-- Roster Section -->
        <section>
          <h3 class="text-xl font-bold text-white mb-5 uppercase tracking-widest flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-mcu-primary shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
            Composition de l'équipe
          </h3>
          <ul class="space-y-4 text-base text-white/70">
            <li class="flex items-start gap-4">
              <svg class="w-6 h-6 text-mcu-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <span>Ton équipe doit comporter <strong>exactement 5 joueurs</strong> (1 par rôle : Top, Jungle, Mid, ADC, Support).</span>
            </li>
            <li class="flex items-start gap-4">
              <svg class="w-6 h-6 text-mcu-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <span>Tu disposes d'un <strong>budget maximum de 100 points</strong>. Chaque joueur a un coût basé sur son rang (S: 30, A: 25, B: 20, C: 15, D: 10).</span>
            </li>
            <li class="flex items-start gap-4">
              <svg class="w-6 h-6 text-mcu-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <span>Tu dois obligatoirement choisir <strong>un Capitaine</strong>. Le score de ce joueur comptera <strong>x1.5</strong>.</span>
            </li>
            <li class="flex items-start gap-4">
              <svg class="w-6 h-6 text-mcu-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <span>Restriction de rangs : Maximum <strong>1 joueur de rang S</strong>, et un maximum de <strong>3 joueurs de rang S ou A</strong> au total.</span>
            </li>
            <li class="flex items-start gap-4">
              <svg class="w-6 h-6 text-mcu-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <span>Tu peux créer <strong>2 équipes différentes</strong> (une pour le Jour 1, une pour le Jour 2).</span>
            </li>
          </ul>
        </section>

        <!-- Day 2 Mercato Section -->
        <section>
          <h3 class="text-xl font-bold text-white mb-5 uppercase tracking-widest flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
            Mercato Jour 2
          </h3>
          <ul class="space-y-4 text-base text-white/70">
            <li class="flex items-start gap-4">
              <svg class="w-6 h-6 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              <span>Les prix des joueurs évoluent pour le Jour 2 en fonction de leurs performances du Jour 1. Le top 20% prend <strong>+5 pts</strong>, le flop 20% perd <strong>-5 pts</strong>.</span>
            </li>
            <li class="flex items-start gap-4">
              <svg class="w-6 h-6 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Ton budget pour le Jour 2 est dynamique : il est composé de ton <strong>budget non dépensé du Jour 1</strong> + <strong>la valeur actuelle de ton équipe</strong>.</span>
            </li>
            <li class="flex items-start gap-4">
              <svg class="w-6 h-6 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              <span>Tu as droit à <strong>2 transferts gratuits</strong> pour le Jour 2. Chaque transfert supplémentaire te coûtera une <strong>pénalité de 20 points</strong> sur ton score final du Jour 2.</span>
            </li>
          </ul>
        </section>

        <!-- Points Section -->
        <section>
          <h3 class="text-xl font-bold text-white mb-5 uppercase tracking-widest flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]"></span>
            Barème de points
          </h3>
          <div class="bg-[#111111]/60 border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-inner">
            <table class="w-full text-left text-base">
              <thead class="bg-white/5 border-b border-white/10 text-white/50">
                <tr>
                  <th class="px-6 py-4 font-bold uppercase text-xs tracking-widest">Action</th>
                  <th class="px-6 py-4 font-bold uppercase text-xs tracking-widest text-right">Points</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-white/90">
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4">Victoire</td><td class="px-6 py-4 text-right text-mcu-primary font-bold text-lg">+5 pts</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4">Défaite</td><td class="px-6 py-4 text-right text-red-400 font-bold text-lg">-2 pts</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4">Kill</td><td class="px-6 py-4 text-right text-mcu-primary font-bold text-lg">+3 pts</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4">Assist</td><td class="px-6 py-4 text-right text-mcu-primary font-bold text-lg">+2 pts</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4">Mort</td><td class="px-6 py-4 text-right text-red-400 font-bold text-lg">-1 pt</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4">Sbires (CS)</td><td class="px-6 py-4 text-right text-mcu-primary font-bold text-lg">+0.02 pts</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4">First Blood (par le joueur)</td><td class="px-6 py-4 text-right text-mcu-primary font-bold text-lg">+2 pts</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4">Score de Vision</td><td class="px-6 py-4 text-right text-mcu-primary font-bold text-lg">+0.1 pts</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4">Dégâts aux Champions</td><td class="px-6 py-4 text-right text-mcu-primary font-bold text-lg">+0.001 pts</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4">Or gagné</td><td class="px-6 py-4 text-right text-mcu-primary font-bold text-lg">+0.001 pts</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4">Temps passé mort (par seconde)</td><td class="px-6 py-4 text-right text-red-400 font-bold text-lg">-0.02 pts</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4 text-red-400 font-bold">Malus "Inter" (10+ morts)</td><td class="px-6 py-4 text-right text-red-400 font-bold text-lg">-10 pts</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4 text-red-400 font-bold">Malus "Agent 007" (0 K, 0 A, >0 D)</td><td class="px-6 py-4 text-right text-red-400 font-bold text-lg">-5 pts</td></tr>
                <tr class="hover:bg-white/5 transition-colors"><td class="px-6 py-4 text-mcu-primary font-bold">Bonus "Carry" (10+ kills)</td><td class="px-6 py-4 text-right text-mcu-primary font-bold text-lg">+3 pts</td></tr>
              </tbody>
            </table>
          </div>
          <p class="text-sm text-white/40 mt-4 italic">* Le barème est appliqué sur chaque match joué par le joueur. Si le joueur ne joue pas, il marque 0 point.</p>
        </section>

        <!-- Lock Section -->
        <section>
          <h3 class="text-xl font-bold text-white mb-5 uppercase tracking-widest flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-mcu-primary shadow-[0_0_10px_rgba(34,197,94,0.55)]"></span>
            Verrouillage
          </h3>
          <p class="text-base text-white/70 leading-relaxed">
            Dès que le premier match de la journée commence, <strong>l'équipe Morue-verse est verrouillée</strong>. Tu ne pourras plus la modifier pour cette journée. Assure-toi d'avoir sauvegardé ta composition finale avant le début du tournoi !
          </p>
        </section>
      </div>
      
      <div class="p-8 border-t border-[#2A2A2A] bg-black/25 flex justify-end">
        <button @click="showRules = false" class="px-8 py-3 bg-mcu-primary hover:bg-mcu-accent text-white font-bold rounded-xl uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] cursor-pointer">
          J'ai compris
        </button>
      </div>
    </div>
  </div>
  </Transition>
  <!-- Score Reveal Modal -->
  <FantasyScoreReveal
    v-if="team"
    v-model:show="showScoreReveal"
    :team="team"
    :player-scores="playerScores"
    :old-total="oldTotalScore"
    :new-total="newTotalScore"
    :get-full-player="getFullPlayer"
    :get-champion-splash="getChampionSplash"
    :get-champion-splash-by-id="getChampionSplashById"
    :get-role-icon="getRoleIcon"
    :get-champion-square-by-id="getChampionSquareById"
  />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { getPlayers, getChampions } from '../lib/queries';
import { useFantasyTeam } from '../composables/useFantasyTeam';
import { mapDbPlayerToFantasy } from '../utils/fantasyMapper';
import type { Database } from '../types/supabase';
import type { FantasyPlayer } from '../types/fantasy';
import FantasyScoreReveal from '../components/FantasyScoreReveal.vue';
import { fantasyService } from '../services/fantasyService';

import topIcon from '../assets/top.png';
import jglIcon from '../assets/jgl.png';
import midIcon from '../assets/mid.png';
import adcIcon from '../assets/adc.png';
import supIcon from '../assets/support.png';

type DbPlayer = Database['public']['Tables']['players']['Row'];
type EnrichedPlayer = DbPlayer & { fantasy: FantasyPlayer };

const players = ref<EnrichedPlayer[]>([]);
const champions = ref<any[]>([]);
const loading = ref(true);

// Fantasy State
const currentUserId = ref<string | null>(null);
const tournamentDay = ref<1 | 2>(1);
const saveSuccess = ref(false);
const showRules = ref(false);

const showScoreReveal = ref(false);
const playerScores = ref<Record<string, number>>({});
const playerStats = ref<Record<string, any>>({});
const oldTotalScore = ref(0);
const newTotalScore = ref(0);
const userRank = ref<number | null>(null);
const totalParticipants = ref<number>(0);

const {
  team,
  selectedPlayers,
  captainId,
  teamName,
  isSaving,
  isSavingName,
  error,
  validationErrors,
  isValid,
  budgetRemaining,
  maxBudget,
  transfersMade,
  penaltyPoints,
  loadTeam,
  hydratePlayers,
  addPlayer,
  removePlayer,
  setCaptain,
  saveTeam,
  saveTeamName
} = useFantasyTeam(currentUserId, tournamentDay);

const nameSaveSuccess = ref(false);

let teamNameSaveDebounce: ReturnType<typeof setTimeout> | null = null;
const NAME_SAVE_DEBOUNCE_MS = 550;

const normalizedTeamNameForCompare = (raw: string) => {
  const uid = currentUserId.value;
  const trimmed = raw.trim().slice(0, 64);
  if (trimmed.length > 0) return trimmed;
  return uid ? `Team ${uid.substring(0, 5)}` : '';
};

const pulseNameSaveSuccess = () => {
  nameSaveSuccess.value = true;
  setTimeout(() => {
    nameSaveSuccess.value = false;
  }, 2200);
};

const saveLockedTeamNameIfChanged = async () => {
  if (!team.value?.isLocked || !team.value?.id) return;
  const next = normalizedTeamNameForCompare(teamName.value);
  if (next === team.value.name) return;
  const ok = await saveTeamName();
  if (ok) pulseNameSaveSuccess();
};

const scheduleLockedTeamNameSave = () => {
  if (!team.value?.isLocked || !team.value?.id) return;
  if (teamNameSaveDebounce) clearTimeout(teamNameSaveDebounce);
  teamNameSaveDebounce = setTimeout(() => {
    teamNameSaveDebounce = null;
    void saveLockedTeamNameIfChanged();
  }, NAME_SAVE_DEBOUNCE_MS);
};

const flushSaveTeamName = () => {
  if (teamNameSaveDebounce) {
    clearTimeout(teamNameSaveDebounce);
    teamNameSaveDebounce = null;
  }
  void saveLockedTeamNameIfChanged();
};

watch(teamName, () => {
  scheduleLockedTeamNameSave();
});

onUnmounted(() => {
  if (teamNameSaveDebounce) clearTimeout(teamNameSaveDebounce);
});

// Filters
const searchQuery = ref('');
const selectedRole = ref<string | null>(null);
const selectedRank = ref<string | null>(null);
const sortBy = ref('rank');

type PlayerViewMode = 'cards' | 'table';
const PLAYERS_VIEW_STORAGE_KEY = 'mcu_players_view';

const readStoredPlayerView = (): PlayerViewMode => {
  const raw = localStorage.getItem(PLAYERS_VIEW_STORAGE_KEY);
  if (!raw) return 'cards';
  return raw === 'table' ? 'table' : 'cards';
};

const playerView = ref<PlayerViewMode>(readStoredPlayerView());

const setPlayerView = (mode: PlayerViewMode) => {
  playerView.value = mode;
  localStorage.setItem(PLAYERS_VIEW_STORAGE_KEY, mode);
};

const roles = [
  { label: 'Top', value: 'top', icon: topIcon },
  { label: 'Jungle', value: 'jungle', icon: jglIcon },
  { label: 'Mid', value: 'mid', icon: midIcon },
  { label: 'ADC', value: 'adc', icon: adcIcon },
  { label: 'Support', value: 'support', icon: supIcon },
];

const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];

// Rank weights for sorting
const rankWeights: Record<string, number> = {
  'Iron': 1, 'Bronze': 2, 'Silver': 3, 'Gold': 4, 'Platinum': 5, 
  'Emerald': 6, 'Diamond': 7, 'Master': 8, 'Grandmaster': 9, 'Challenger': 10
};

// Role weights for sorting
const roleWeights: Record<string, number> = {
  'top': 1, 'jungle': 2, 'mid': 3, 'adc': 4, 'support': 5
};

onMounted(async () => {
  loading.value = true;
  
  // Get current user
  const userStr = localStorage.getItem('mcu_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      currentUserId.value = user.id;
    } catch (e) {}
  }
  
  const [playersRes, championsRes] = await Promise.all([
    getPlayers(),
    getChampions()
  ]);
  
  if (playersRes.data) {
    players.value = playersRes.data.map(p => ({
      ...p,
      fantasy: mapDbPlayerToFantasy(p)
    }));
  }
  
  if (championsRes.data) {
    champions.value = championsRes.data;
  }
  
  if (currentUserId.value) {
    await initDay();
  }
  
  loading.value = false;
});

const setDay = async (day: 1 | 2) => {
  if (tournamentDay.value === day) return;
  tournamentDay.value = day;
  saveSuccess.value = false;
};

const initDay = async () => {
  await loadTeam();
  if (players.value.length > 0) {
    hydratePlayers(players.value.map(p => p.fantasy));
  }
  
  if (team.value && team.value.isLocked) {
    try {
      const [scores, stats, leaderboard] = await Promise.all([
        fantasyService.getPlayerScores(tournamentDay.value),
        fantasyService.getPlayerMatchStats(team.value.playerIds),
        fantasyService.getLeaderboard(tournamentDay.value)
      ]);
      playerScores.value = scores;
      playerStats.value = stats;
      
      totalParticipants.value = leaderboard.length;
      const userIndex = leaderboard.findIndex(entry => entry.userId === currentUserId.value);
      userRank.value = userIndex !== -1 ? userIndex + 1 : null;
      
      const storageKey = `mcu_fantasy_last_score_${currentUserId.value}_day_${tournamentDay.value}`;
      const lastSeenScore = parseFloat(localStorage.getItem(storageKey) || '0');
      const currentTotal = team.value.totalPoints || 0;
      
      if (currentTotal > lastSeenScore) {
        oldTotalScore.value = lastSeenScore;
        newTotalScore.value = currentTotal;
        showScoreReveal.value = true;
        localStorage.setItem(storageKey, currentTotal.toString());
      }
    } catch (err) {
      console.error('Failed to load player scores for animation', err);
    }
  }
};

const replayAnimation = async () => {
  if (!team.value) return;
  try {
    const [scores, stats] = await Promise.all([
      fantasyService.getPlayerScores(tournamentDay.value),
      fantasyService.getPlayerMatchStats(team.value.playerIds)
    ]);
    playerScores.value = scores;
    playerStats.value = stats;
    oldTotalScore.value = 0;
    newTotalScore.value = team.value.totalPoints || 0;
    showScoreReveal.value = true;
  } catch (err) {
    console.error('Failed to load player scores for animation', err);
  }
};

watch(tournamentDay, () => {
  if (!loading.value && currentUserId.value) {
    initDay();
  }
});

const handleSave = async () => {
  const success = await saveTeam();
  if (success) {
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  }
};

const isPlayerSelected = (playerId: string) => {
  return selectedPlayers.value.some(p => p.id === playerId);
};

const toggleRoleFilter = (role: string) => {
  if (selectedRole.value === role) {
    selectedRole.value = null;
  } else {
    selectedRole.value = role;
  }
};

const getRoleIcon = (roleName: string) => {
  const role = roles.find(r => r.value === roleName);
  return role ? role.icon : '';
};

const getChampionSquare = (name: string) => {
  const champ = champions.value.find(c => c.name === name);
  return champ?.image_url || '';
};

const getChampionSquareById = (id: number | string) => {
  const champ = champions.value.find(c => c.id == id);
  return champ?.image_url || '';
};

const getChampionSplash = (name: string) => {
  const champ = champions.value.find(c => c.name === name);
  return champ?.splash_url || champ?.image_url || '';
};

const getChampionSplashById = (id: number | string) => {
  const champ = champions.value.find(c => c.id == id);
  return champ?.splash_url || champ?.image_url || '';
};

const getRosterCardSplashUrl = (playerId: string) => {
  const stats = playerStats.value[playerId];
  const playedId = stats?.championIds?.[0];
  if (playedId != null) {
    const byMatch = getChampionSplashById(playedId);
    if (byMatch) return byMatch;
  }
  const p = players.value.find(pl => pl.id === playerId);
  if (p?.champion_signature) {
    const u = getChampionSplash(p.champion_signature);
    if (u) return u;
  }
  const poolFirst = p?.champion_pool?.[0];
  if (poolFirst) return getChampionSplash(poolFirst) || '';
  return '';
};

const getDraftCardSplashUrl = (player: EnrichedPlayer) => {
  if (player.champion_signature) {
    const u = getChampionSplash(player.champion_signature);
    if (u) return u;
  }
  const first = player.champion_pool?.[0];
  if (first) return getChampionSplash(first) || '';
  return '';
};

const getTierColor = (tier: string) => {
  switch(tier) {
    case 'S': return 'text-yellow-400 border-yellow-500/40 shadow-[0_0_10px_rgba(250,204,21,0.2)]';
    case 'A': return 'text-purple-400 border-purple-500/40 shadow-[0_0_10px_rgba(192,132,252,0.2)]';
    case 'B': return 'text-teal-400 border-teal-500/40 shadow-[0_0_10px_rgba(45,212,191,0.2)]';
    case 'C': return 'text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]';
    case 'D': return 'text-gray-400 border-gray-500/40 shadow-[0_0_10px_rgba(156,163,175,0.2)]';
    default: return 'text-white/50 border-white/10';
  }
};

const getTierGlow = (tier: string) => {
  switch(tier) {
    case 'S': return 'hover:shadow-[0_20px_70px_rgba(250,204,21,0.2)] hover:border-yellow-500/50';
    case 'A': return 'hover:shadow-[0_20px_70px_rgba(192,132,252,0.2)] hover:border-purple-500/50';
    case 'B': return 'hover:shadow-[0_20px_70px_rgba(45,212,191,0.2)] hover:border-teal-500/50';
    case 'C': return 'hover:shadow-[0_20px_70px_rgba(52,211,153,0.2)] hover:border-emerald-500/50';
    case 'D': return 'hover:shadow-[0_20px_70px_rgba(156,163,175,0.2)] hover:border-gray-500/50';
    default: return 'hover:shadow-[0_20px_70px_rgba(34,197,94,0.2)] hover:border-mcu-primary/50';
  }
};

const getDisplayPrice = (player: FantasyPlayer) => {
  return tournamentDay.value === 2 ? (player.priceDay2 ?? player.price) : player.price;
};

const getPriceChange = (player: FantasyPlayer) => {
  if (tournamentDay.value !== 2 || player.priceDay2 === undefined) return 0;
  return player.priceDay2 - player.price;
};

const getFullPlayer = (id: string) => {
  return players.value.find(p => p.id === id);
};

const getPlayerByRole = (roleValue: string) => {
  return selectedPlayers.value.find(p => p.roles[0]?.toLowerCase() === roleValue.toLowerCase());
};

const filteredPlayers = computed(() => {
  let result = [...players.value];
  
  // Apply Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => p.pseudo.toLowerCase().includes(query));
  }
  
  // Apply Role Filter
  if (selectedRole.value) {
    // Priority role filtering: only match primary role
    result = result.filter(p => p.primary_role === selectedRole.value);
  }
  
  // Apply Rank Filter
  if (selectedRank.value) {
    result = result.filter(p => p.rank === selectedRank.value);
  }
  
  // Apply Sorting
  result.sort((a, b) => {
    if (sortBy.value === 'rank') {
      const weightA = rankWeights[a.rank] || 0;
      const weightB = rankWeights[b.rank] || 0;
      if (weightA !== weightB) return weightB - weightA; // Descending
      return a.pseudo.localeCompare(b.pseudo);
    } 
    else if (sortBy.value === 'role') {
      const weightA = roleWeights[a.primary_role] || 99;
      const weightB = roleWeights[b.primary_role] || 99;
      if (weightA !== weightB) return weightA - weightB; // Ascending (Top -> Sup)
      
      const secWeightA = roleWeights[a.secondary_role] || 99;
      const secWeightB = roleWeights[b.secondary_role] || 99;
      if (secWeightA !== secWeightB) return secWeightA - secWeightB;
      
      return rankWeights[b.rank] - rankWeights[a.rank]; // Rank as final tiebreaker
    }
    else if (sortBy.value === 'price') {
      return getDisplayPrice(b.fantasy) - getDisplayPrice(a.fantasy); // Descending
    }
    else if (sortBy.value === 'name') {
      return a.pseudo.localeCompare(b.pseudo);
    }
    return 0;
  });
  
  return result;
});
</script>

<style scoped>
/* Vue Transition Group animations */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.list-leave-active {
  /* Removed absolute positioning to prevent grid layout breaking */
  z-index: -1;
}

/* Custom shimmer animation for progress bar */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Fade in up for initial load */
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

/* Simple fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
