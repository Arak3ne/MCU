<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] font-sans selection:bg-[#22C55E] selection:text-[#0B0F0C]">
    <!-- Error Toast -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="globalError" class="fixed top-24 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-4">
        <div class="bg-[#111111] border border-red-500/50 rounded-lg p-4 shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-4 backdrop-blur-xl">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-red-500 font-bold uppercase tracking-widest text-xs">Erreur</p>
            <p class="text-[#F0FDF4] text-sm">{{ globalError }}</p>
          </div>
          <button @click="globalError = ''" class="text-[#A1A1AA] hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Background accents -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4ADE80] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#22C55E] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
    </div>

    <!-- Main Content -->
    <main class="relative z-10 max-w-5xl mx-auto px-6 py-16">
      <!-- Hero Header -->
      <div class="text-center mb-16 relative">
        <div class="inline-block relative">
          <h1 class="text-5xl md:text-7xl font-title uppercase tracking-wider mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] drop-shadow-2xl">
            Tournament Standings
          </h1>
          <div class="absolute -inset-x-16 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/30 to-transparent -z-10"></div>
        </div>
        <p class="text-[#A1A1AA] font-medium tracking-widest uppercase text-sm mt-2">Classement en direct et statistiques</p>
      </div>

      <!-- Ranking Board -->
      <div class="bg-[#0B0F0C]/60 backdrop-blur-sm border border-[#22C55E]/30 p-1 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative before:absolute before:-inset-[1px] before:bg-gradient-to-b before:from-[#22C55E]/50 before:to-[#22C55E]/10 before:-z-10 before:rounded-sm rounded-sm">
        <div class="bg-[#111111] p-6 md:p-10 rounded-sm h-full w-full">
          <!-- Table Header -->
          <div class="grid grid-cols-[auto_1fr_auto] gap-6 mb-6 px-6 py-3 border-b border-[#2A2A2A] text-[#A1A1AA] text-xs font-bold uppercase tracking-widest">
            <div class="w-16 text-center">Rang</div>
            <div>Équipe</div>
            <div class="flex gap-10 md:gap-20 text-center">
              <div class="w-20">Record</div>
              <div class="w-20">Points</div>
            </div>
          </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-32 opacity-80">
        <div class="relative w-20 h-20 mb-8">
          <div class="absolute inset-0 border-4 border-mcu-border rounded-full"></div>
          <div class="absolute inset-0 border-4 border-mcu-primary rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
          <div class="absolute inset-2 border-4 border-mcu-primary/30 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
        </div>
        <p class="text-mcu-primary uppercase tracking-widest text-sm font-bold animate-pulse drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">Chargement du classement...</p>
      </div>

      <!-- Empty standings -->
      <div
        v-else-if="teams.length === 0"
        class="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in-up"
      >
        <div class="w-16 h-16 mb-6 rounded-full border border-[#2A2A2A] flex items-center justify-center bg-[#0B0F0C]/80">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-[#A1A1AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p class="text-[#F0FDF4] font-title uppercase tracking-widest text-sm md:text-base mb-2">Aucune équipe en base</p>
        <p class="text-[#A1A1AA] text-sm max-w-md leading-relaxed">
          Le classement du tournoi s’affichera ici dès que des équipes auront été créées et que les résultats seront synchronisés.
        </p>
      </div>

      <!-- Team List -->
      <div v-else class="space-y-4 animate-fade-in-up">
            <div
              v-for="(team, index) in teams"
              :key="team.id"
              @click="selectTeam(team)"
              class="group relative grid grid-cols-[auto_1fr_auto] gap-6 items-center px-6 py-5 bg-gradient-to-r from-[#1A1A1A] to-[#111111] border border-[#2A2A2A] hover:border-[#22C55E]/60 transition-all duration-300 rounded-sm overflow-hidden cursor-pointer"
              :class="{
                'from-[#1A1A1A] via-[#22C55E]/10 to-[#111111] border-[#22C55E]/50 shadow-[0_0_20px_rgba(200,170,110,0.15)] scale-[1.02] z-10': index === 0,
                'from-[#1A1A1A] via-[#A1A1AA]/5 to-[#111111] border-[#A1A1AA]/30': index === 1,
                'from-[#1A1A1A] via-[#F59E0B]/5 to-[#111111] border-[#F59E0B]/30': index === 2
              }"
            >
              <!-- Hover effect highlight -->
              <div class="absolute inset-y-0 left-0 w-1 bg-[#22C55E] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <!-- Rank -->
              <div class="w-16 flex justify-center">
                <div class="relative flex items-center justify-center w-12 h-12">
                  <span class="absolute inset-0 rotate-45 border border-[#2A2A2A] group-hover:border-[#22C55E] transition-colors"
                        :class="{ 'border-[#22C55E] bg-[#22C55E]/10': index === 0, 'border-[#A1A1AA] bg-[#A1A1AA]/10': index === 1, 'border-[#F59E0B] bg-[#F59E0B]/10': index === 2 }"></span>
                  <span class="relative z-10 font-title text-xl"
                        :class="{ 'text-[#22C55E] drop-shadow-[0_0_5px_#22C55E]': index === 0, 'text-[#E2E8F0]': index === 1, 'text-[#F59E0B]': index === 2, 'text-[#A1A1AA]': index > 2 }">
                    {{ index + 1 }}
                  </span>
                </div>
              </div>

              <!-- Team Info -->
              <div class="flex items-center gap-6">
                <div class="relative w-14 h-14 flex items-center justify-center bg-[#0B0F0C] border border-[#2A2A2A] group-hover:border-[#22C55E]/50 transition-colors shadow-inner">
                  <span class="font-title text-lg uppercase text-[#F0FDF4] group-hover:text-[#22C55E] transition-colors tracking-wider">{{ team.name.substring(0, 2) }}</span>
                  <div v-if="index === 0" class="absolute -top-3 -right-3 text-2xl drop-shadow-[0_0_5px_rgba(200,170,110,0.8)]">👑</div>
                </div>
                <div>
                  <h3 class="text-2xl font-bold tracking-wide text-[#F0FDF4] group-hover:text-[#22C55E] transition-colors uppercase">
                    {{ team.name }}
                  </h3>
                  <p class="text-xs text-[#A1A1AA] uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" :class="(team.wins ?? 0) > 0 ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-gray-600'"></span>
                    {{ (team.wins ?? 0) > 0 || (team.losses ?? 0) > 0 ? (((team.wins ?? 0) / ((team.wins ?? 0) + (team.losses ?? 0))) * 100).toFixed(0) + '% Win Rate' : 'Aucun match joué' }}
                  </p>
                </div>
              </div>

              <!-- Stats -->
              <div class="flex gap-10 md:gap-20 items-center">
                <div class="w-20 flex justify-center items-center gap-3">
                  <span class="text-[#4ADE80] font-bold text-xl">{{ team.wins ?? 0 }}W</span>
                  <span class="text-[#2A2A2A] font-title text-xl">-</span>
                  <span class="text-[#EF4444] font-bold text-xl">{{ team.losses ?? 0 }}L</span>
                </div>
                <div class="w-20 flex justify-center">
                  <span class="font-title text-4xl text-[#22C55E] drop-shadow-[0_0_15px_rgba(200,170,110,0.4)]">{{ team.points }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Team Matches Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="selectedTeam" class="fixed inset-0 flex items-center justify-center z-50 p-4" @click.self="closeMatches">
        <!-- Backdrop -->
        <div class="absolute inset-0 -z-10 cursor-pointer bg-[#0B0F0C]/90 backdrop-blur-md" aria-hidden="true"></div>

        <div class="relative cursor-default bg-[#111111] border border-[#22C55E]/30 rounded-sm p-1 max-w-2xl w-full shadow-[0_0_50px_rgba(0,0,0,1)] before:absolute before:-inset-[1px] before:bg-gradient-to-b before:from-[#22C55E]/50 before:to-[#22C55E]/10 before:-z-10 before:rounded-sm">
          <div class="bg-[#111111] p-8 h-full w-full rounded-sm relative">
            <!-- Close Button -->
            <button @click="closeMatches" class="absolute top-4 right-4 cursor-pointer text-[#A1A1AA] hover:text-[#22C55E] transition-colors p-2 z-20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div class="text-center mb-8">
              <h2 class="text-3xl font-title mb-1 text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] tracking-wider uppercase">Prochains Matchs</h2>
              <div class="flex items-center justify-center gap-3">
                <div class="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#22C55E]/50"></div>
                <p class="text-[#22C55E] font-bold tracking-widest uppercase text-sm italic">{{ selectedTeam.name }}</p>
                <div class="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#22C55E]/50"></div>
              </div>
            </div>

              <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div
                  v-for="(match, index) in filteredMatches"
                  :key="index"
                  @click="startDraftForMatch(match, match.round, matches)"
                  class="group relative bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#22C55E]/50 rounded-sm p-6 flex items-center justify-between transition-all duration-300 cursor-pointer"
                >
                <!-- Blue Side -->
                <div class="flex-1 flex items-center justify-end gap-5">
                  <span class="text-lg md:text-xl font-bold transition-colors uppercase tracking-wide truncate text-right" 
                        :class="match.team1.id === selectedTeam.id ? 'text-[#22C55E]' : 'text-[#F0FDF4]'">
                    {{ match.team1.name }}
                  </span>
                  <div class="w-12 h-12 rounded-sm bg-[#0B0F0C] border flex items-center justify-center shadow-inner transition-colors"
                       :class="match.team1.id === selectedTeam.id ? 'border-[#22C55E]/50' : 'border-[#2A2A2A] group-hover:border-[#22C55E]/30'">
                    <span class="font-title text-sm uppercase tracking-wider transition-colors"
                          :class="match.team1.id === selectedTeam.id ? 'text-[#22C55E]' : 'text-[#A1A1AA]'">
                      {{ match.team1.name.substring(0, 2) }}
                    </span>
                  </div>
                </div>

                <!-- VS -->
                <div class="mx-6 relative flex flex-col items-center justify-center">
                  <div class="text-[10px] text-[#A1A1AA] font-title italic bg-[#0B0F0C] px-3 py-1 rounded-sm border border-[#2A2A2A] group-hover:border-[#22C55E]/40 uppercase tracking-[0.2em] transition-all">
                    VS
                  </div>
                </div>

                <!-- Red Side -->
                <div class="flex-1 flex items-center justify-start gap-5">
                  <div class="w-12 h-12 rounded-sm bg-[#0B0F0C] border flex items-center justify-center shadow-inner transition-colors"
                       :class="match.team2.id === selectedTeam.id ? 'border-[#22C55E]/50' : 'border-[#2A2A2A] group-hover:border-[#22C55E]/30'">
                    <span class="font-title text-sm uppercase tracking-wider transition-colors"
                          :class="match.team2.id === selectedTeam.id ? 'text-[#22C55E]' : 'text-[#A1A1AA]'">
                      {{ match.team2.name.substring(0, 2) }}
                    </span>
                  </div>
                  <span class="text-lg md:text-xl font-bold transition-colors uppercase tracking-wide truncate text-left"
                        :class="match.team2.id === selectedTeam.id ? 'text-[#22C55E]' : 'text-[#F0FDF4]'">
                    {{ match.team2.name }}
                  </span>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="filteredMatches.length === 0" class="py-12 text-center">
                <p class="text-[#A1A1AA] uppercase tracking-[0.2em] text-xs font-bold">Aucun match prévu</p>
              </div>
            </div>

            <!-- Footer Decorative -->
            <div class="mt-8 flex justify-center">
              <div class="w-24 h-px bg-gradient-to-r from-transparent via-[#22C55E]/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal Popup for Draft -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showDraftModal" class="fixed inset-0 flex items-center justify-center z-[60] p-4" @click.self="closeDraftModal">
        <!-- Backdrop -->
        <div class="absolute inset-0 -z-10 cursor-pointer bg-[#0B0F0C]/90 backdrop-blur-md" aria-hidden="true"></div>

        <div class="relative cursor-default bg-[#111111] border border-[#22C55E]/30 rounded-sm p-1 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,1)] before:absolute before:-inset-[1px] before:bg-gradient-to-b before:from-[#22C55E]/50 before:to-[#22C55E]/10 before:-z-10 before:rounded-sm">
          <div class="bg-[#111111] p-8 h-full w-full rounded-sm relative">
            <!-- Close Button -->
            <button @click="closeDraftModal" class="absolute top-4 right-4 cursor-pointer text-[#A1A1AA] hover:text-[#22C55E] transition-colors p-2 z-20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 class="text-3xl font-title mb-2 text-center text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] tracking-wider uppercase">Initialiser la Draft</h2>

            <div v-if="awaitingSideChoice && sidePickMatch" class="space-y-4 mb-8">
              <p class="text-[#A1A1AA] text-center text-[11px] uppercase tracking-widest leading-relaxed px-1">
                Le premier à ouvrir choisit quelle équipe sera <span class="text-sky-400 normal-case">blue side</span> sur Drafter — l’autre sera red side. Ce n’est pas l’ordre affiché sur le match.
              </p>
              <button
                type="button"
                :disabled="claimingSide"
                @click="confirmDraftBlueSide(sidePickMatch.team1.id)"
                class="w-full py-3.5 px-4 rounded-sm border border-sky-500/45 bg-sky-500/10 hover:bg-sky-500/20 text-sky-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <span class="flex items-center gap-3">
                  <span class="shrink-0 w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.75)]" aria-hidden="true" />
                  <span class="min-w-0 flex flex-col gap-0.5">
                    <span class="font-bold uppercase tracking-widest text-xs text-sky-50 truncate">{{ sidePickMatch.team1.name }}</span>
                    <span class="text-[10px] uppercase tracking-widest text-sky-300/90">Blue side</span>
                  </span>
                </span>
              </button>
              <button
                type="button"
                :disabled="claimingSide"
                @click="confirmDraftBlueSide(sidePickMatch.team2.id)"
                class="w-full py-3.5 px-4 rounded-sm border border-sky-500/45 bg-sky-500/10 hover:bg-sky-500/20 text-sky-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <span class="flex items-center gap-3">
                  <span class="shrink-0 w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.75)]" aria-hidden="true" />
                  <span class="min-w-0 flex flex-col gap-0.5">
                    <span class="font-bold uppercase tracking-widest text-xs text-sky-50 truncate">{{ sidePickMatch.team2.name }}</span>
                    <span class="text-[10px] uppercase tracking-widest text-sky-300/90">Blue side</span>
                  </span>
                </span>
              </button>
              <p v-if="claimingSide" class="text-center text-[10px] text-[#22C55E] uppercase tracking-widest animate-pulse">Enregistrement…</p>
            </div>
            
            <div v-else class="flex justify-center items-center gap-4 mb-8 text-sm font-bold uppercase tracking-widest">
              <span class="text-[#4ADE80]">{{ blueName }}</span>
              <span class="text-[#A1A1AA] text-xs italic">vs</span>
              <span class="text-[#EF4444]">{{ redName }}</span>
            </div>

            <div v-if="drafting" class="text-center py-10">
              <div class="w-16 h-16 border-4 border-[#2A2A2A] border-t-[#22C55E] rounded-full animate-spin mx-auto mb-6"></div>
              <p class="text-[#22C55E] uppercase tracking-widest text-sm font-bold animate-pulse">{{ message || 'Génération de la draft...' }}</p>
            </div>

            <div v-else-if="draftUrl" class="space-y-6">
              <p class="text-green-400 text-center font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">Draft Générée !</p>
              
              <div class="flex flex-col gap-4">
                <a
                  :href="draftUrl"
                  target="_blank"
                  class="w-full py-4 bg-gradient-to-r from-[#22C55E] to-[#14532D] hover:from-[#d9b876] hover:to-[#8a6831] text-[#0B0F0C] rounded-sm font-title text-center transition-all shadow-[0_0_15px_rgba(200,170,110,0.3)] uppercase tracking-widest text-sm border border-[#22C55E]"
                >
                  Ouvrir l'outil de Draft
                </a>
                <button
                  @click="copyDraftLink"
                  class="w-full py-4 bg-[#1A1A1A] hover:bg-[#282d33] border border-[#2A2A2A] hover:border-[#22C55E]/50 rounded-sm font-bold transition-all flex items-center justify-center gap-2 text-[#A1A1AA] hover:text-[#F0FDF4] uppercase tracking-widest text-xs cursor-pointer"
                >
                  <svg v-if="!linkCopied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span :class="linkCopied ? 'text-green-400' : ''">{{ linkCopied ? 'Copié !' : 'Copier le lien' }}</span>
                </button>
              </div>
              
              <div v-if="draftId" class="flex items-center justify-center gap-2 mt-6 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
                <span class="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                <p class="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-bold">
                  Synchronisation automatique des picks en arrière-plan...
                </p>
              </div>
            </div>
            
            <div v-else-if="!awaitingSideChoice" class="text-center py-8">
              <p class="text-red-400 font-bold uppercase tracking-widest text-xs mb-6">{{ message || 'Erreur lors de la génération de la draft' }}</p>
              <button @click="generateDraft" class="cursor-pointer px-8 py-3 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#22C55E]/50 hover:bg-[#282d33] rounded-sm text-[#F0FDF4] font-bold uppercase tracking-widest text-xs transition-all">
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

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

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #0B0F0C;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #2A2A2A;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #22C55E;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { supabase } from "../lib/supabase";
import { subscribeToTable } from "../lib/realtime";
import {
  logDraftSyncClient,
  type SyncDraftData,
} from "../lib/logDraftSyncClient";
import { fetchChampionshipMatchesHydrated } from "../lib/queries";
import { claimOrRefreshDraftBlueTeam, resolveBlueRedNames } from "../lib/draftMatchSides";
import type { Database } from "../types/supabase";

const loading = ref(true);

type Team = Database["public"]["Tables"]["teams"]["Row"];

interface Match {
  id?: string;
  team1: Team;
  team2: Team;
  is_completed?: boolean;
  round?: number;
  draft_url?: string | null;
  draft_id?: string | null;
  draft_blue_team_id?: string | null;
}

const teams = ref<Team[]>([]);
const selectedTeam = ref<Team | null>(null);
let subscription: any = null;
let playoffSubscription: any = null;

// Draft related state
const showDraftModal = ref(false);
const currentMatchId = ref("");
const blueName = ref("");
const redName = ref("");
const drafting = ref(false);
const draftUrl = ref("");
const draftId = ref("");
const syncing = ref(false);
const message = ref("");
const linkCopied = ref(false);
const globalError = ref("");
const awaitingSideChoice = ref(false);
const claimingSide = ref(false);
const sidePickMatch = ref<{ team1: Team; team2: Team } | null>(null);
let syncInterval: any = null;

const applyDraftDisplayFromMatch = (m: { team1: Team; team2: Team; draft_blue_team_id?: string | null }) => {
  const { blueName: b, redName: r } = resolveBlueRedNames({
    team1: m.team1,
    team2: m.team2,
    draft_blue_team_id: m.draft_blue_team_id,
  });
  blueName.value = b;
  redName.value = r;
};

const showError = (msg: string) => {
  globalError.value = msg;
  setTimeout(() => {
    if (globalError.value === msg) globalError.value = "";
  }, 5000);
};

const matches = ref<any[]>([]);

const loadChampionshipMatches = async () => {
  const { data } = await fetchChampionshipMatchesHydrated();
  matches.value = data ?? [];
};

const filteredMatches = computed(() => {
  if (!selectedTeam.value) return [];
  return matches.value.filter((m: any) => 
    (m.team1 && m.team1.id === selectedTeam.value!.id) || 
    (m.team2 && m.team2.id === selectedTeam.value!.id)
  );
});

const selectTeam = (team: Team) => {
  selectedTeam.value = team;
};

const closeMatches = () => {
  selectedTeam.value = null;
};

const startDraftForMatch = async (match: Match, roundNumber?: number, allMatches?: any[]) => {
  if (!match.team1 || !match.team2) return;
  if (match.is_completed) {
    showError("Ce match est déjà terminé. Impossible de lancer une nouvelle draft.");
    return;
  }

  // Vérifier si les rounds précédents sont terminés
  if (roundNumber && allMatches && roundNumber > 1) {
    const previousMatches = allMatches.filter(m => m.round < roundNumber);
    const allPreviousMatchesCompleted = previousMatches.every(m => m.is_completed);
    
    if (!allPreviousMatchesCompleted) {
      showError("Vous ne pouvez pas lancer la draft pour ce round tant que les matchs des rounds précédents ne sont pas terminés.");
      return;
    }
  }

  // Vérifier si le joueur fait partie de l'une des deux équipes
  const userStr = localStorage.getItem('mcu_user');
  if (!userStr) {
    showError("Vous devez être connecté pour lancer une draft.");
    return;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Fetch latest user data from DB to ensure team_id is up to date
    const { data: latestUser } = await supabase.from('players').select('team_id').eq('id', user.id).single();
    const currentTeamId = latestUser?.team_id || user.team_id;

    if (!currentTeamId || (currentTeamId !== match.team1.id && currentTeamId !== match.team2.id)) {
      showError("Vous ne pouvez lancer la draft que pour les matchs de votre équipe.");
      return;
    }
    
    // Update local storage with latest team_id just in case
    if (latestUser && latestUser.team_id !== user.team_id) {
      user.team_id = latestUser.team_id;
      localStorage.setItem('mcu_user', JSON.stringify(user));
    }
  } catch (e) {
    showError("Erreur d'authentification.");
    return;
  }

  currentMatchId.value = match.id || "";
  draftUrl.value = "";
  draftId.value = "";
  message.value = "";
  sidePickMatch.value = { team1: match.team1, team2: match.team2 };
  showDraftModal.value = true;

  if (match.draft_url) {
    awaitingSideChoice.value = false;
    applyDraftDisplayFromMatch(match);
    void generateDraft();
    return;
  }
  if (match.draft_blue_team_id) {
    awaitingSideChoice.value = false;
    applyDraftDisplayFromMatch(match);
    void generateDraft();
    return;
  }
  awaitingSideChoice.value = true;
  blueName.value = "";
  redName.value = "";
};

const confirmDraftBlueSide = async (blueTeamId: string) => {
  if (!currentMatchId.value || claimingSide.value) return;
  claimingSide.value = true;
  message.value = "";
  try {
    const r = await claimOrRefreshDraftBlueTeam(supabase, currentMatchId.value, blueTeamId);
    const idx = matches.value.findIndex((m: any) => m.id === currentMatchId.value);
    if (idx !== -1) {
      const cur = matches.value[idx];
      matches.value[idx] = {
        ...cur,
        draft_blue_team_id: r.draft_blue_team_id ?? cur.draft_blue_team_id,
        draft_url: r.draft_url ?? cur.draft_url,
      };
    }
    if (!r.draft_blue_team_id && !r.draft_url) {
      showError("Impossible d’enregistrer le côté bleu. Réessayez.");
      return;
    }
    if (!r.claimed && r.draft_blue_team_id && r.draft_blue_team_id !== blueTeamId) {
      showError("L’autre équipe a déjà choisi les côtés. Alignement sur leur choix.");
    }
    const fresh = matches.value.find((m: any) => m.id === currentMatchId.value);
    if (fresh?.team1 && fresh?.team2) {
      applyDraftDisplayFromMatch(fresh);
    }
    awaitingSideChoice.value = false;
    await generateDraft();
  } catch (e: unknown) {
    message.value = e instanceof Error ? e.message : "Erreur lors du choix des côtés";
  } finally {
    claimingSide.value = false;
  }
};

const closeDraftModal = () => {
  showDraftModal.value = false;
  awaitingSideChoice.value = false;
  sidePickMatch.value = null;
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};

const generateDraft = async () => {
    try {
      drafting.value = true;
      draftUrl.value = "";
      draftId.value = "";
      linkCopied.value = false;
  
      // Check if draft already exists in database
    const match = matches.value.find((m: any) => m.id === currentMatchId.value);
    if (match && match.draft_url) {
      message.value = "Draft récupérée (base de données)...";
      await new Promise(resolve => setTimeout(resolve, 500));
      
      draftUrl.value = match.draft_url;
      draftId.value = match.draft_id || "";
      if (match.team1 && match.team2) {
        applyDraftDisplayFromMatch(match);
      }
      message.value = "Draft récupérée !";
        
        if (syncInterval) clearInterval(syncInterval);
        syncInterval = setInterval(() => {
          syncDraftPicks();
        }, 4000);
        return;
      }
  
      message.value = "Initialisation de la draft...";
  
      const sideKey = match?.draft_blue_team_id ?? "unset";
      const draftCacheKey = `draft_${currentMatchId.value}_${sideKey}_${blueName.value}_${redName.value}`;
      const cachedDraft = localStorage.getItem(draftCacheKey);
  
      if (cachedDraft) {
        message.value = "Initialisation de l'interface...";
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const parsed = JSON.parse(cachedDraft);
        draftUrl.value = parsed.draftUrl;
        draftId.value = parsed.draftId || "";
        message.value = "Draft récupérée !";
        
        // Also update DB since we have it cached locally but maybe not in DB yet
        if (currentMatchId.value) {
          await supabase.from("playoff_matches").update({
            draft_url: parsed.draftUrl,
            draft_id: parsed.draftId || ""
          }).eq("id", currentMatchId.value);
        }
        
        if (syncInterval) clearInterval(syncInterval);
        syncInterval = setInterval(() => {
          syncDraftPicks();
        }, 4000);
        return;
      }
  
      const { data, error: funcError } = await supabase.functions.invoke("generate-draft", {
        body: {
          matchId: currentMatchId.value,
          blueName: blueName.value,
          redName: redName.value,
        }
      });
  
      if (funcError) {
        let errorDetail = funcError.message;
        try {
          if ((funcError as any).context && typeof (funcError as any).context.json === 'function') {
            const body = await (funcError as any).context.json();
            if (body && body.error) {
              errorDetail = body.error;
            }
          }
        } catch (e) {}
        throw new Error(`Failed to generate: ${errorDetail}`);
      }
  
      if (data?.draftUrl) {
        draftUrl.value = data.draftUrl;
        draftId.value = data.draftId || "";
        message.value = "Draft générée !";
        
        localStorage.setItem(draftCacheKey, JSON.stringify({
          draftUrl: data.draftUrl,
          draftId: data.draftId || ""
        }));
  
        // The Edge Function already updates the DB, but we can update our local state
        const matchIndex = matches.value.findIndex((m: any) => m.id === currentMatchId.value);
        if (matchIndex !== -1) {
          matches.value[matchIndex].draft_url = data.draftUrl;
          matches.value[matchIndex].draft_id = data.draftId || "";
        }
        
        if (syncInterval) clearInterval(syncInterval);
        syncInterval = setInterval(() => {
          syncDraftPicks();
        }, 4000);
      } else {
        throw new Error("Draft generated, but couldn't parse URL.");
      }
    } catch (err: any) {
      message.value = err.message || "Erreur lors de la génération de la draft";
      console.error(err);
    } finally {
      drafting.value = false;
    }
  };

const copyDraftLink = () => {
  if (draftUrl.value) {
    navigator.clipboard.writeText(draftUrl.value);
    linkCopied.value = true;
    setTimeout(() => { linkCopied.value = false }, 2000);
  }
};

const syncDraftPicks = async () => {
  if (!draftId.value || syncing.value) return;

  syncing.value = true;
  try {
    const { data, error: funcError } = await supabase.functions.invoke("sync-draft", {
      body: {
        draftId: draftId.value,
      },
    });

    logDraftSyncClient("Home", draftId.value, data as SyncDraftData | undefined, funcError ?? null);
    if (funcError) return;

    const d = data as SyncDraftData | undefined;
    if (d?.success === false) {
      if (d.code === "DRAFTER_PLAN_LIMIT") {
        message.value =
          d.hint ?? "Accès Drafter limité : passer au plan Full API pour les drafts terminées.";
      }
      return;
    }

    const finished =
      d?.status === "FINISHED" ||
      d?.status === "finished" ||
      d?.status === "COMPLETED";

    if (finished) {
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
      message.value = "Draft terminée ! Champions à jour.";
      setTimeout(() => {
        closeDraftModal();
      }, 3000);
    }
  } catch (err: any) {
    console.error("Auto-sync error:", err);
  } finally {
    syncing.value = false;
  }
};

const fetchTeams = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("points", { ascending: false })
    .order("wins", { ascending: false });

  if (data && !error) {
    teams.value = data;
  }
  loading.value = false;
};

onMounted(() => {
  fetchTeams();
  loadChampionshipMatches();

  subscription = subscribeToTable("teams", () => {
    fetchTeams();
  });

  playoffSubscription = subscribeToTable("playoff_matches", () => {
    void loadChampionshipMatches();
  });
});

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe();
  }
  if (playoffSubscription) {
    playoffSubscription.unsubscribe();
  }
  if (syncInterval) {
    clearInterval(syncInterval);
  }
});
</script>