<template>
  <div class="h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#0B0F0C] text-[#F0FDF4]">
    <main @click="initAudio" class="w-full h-full p-4 md:p-6 flex flex-col gap-4 relative">
      <!-- Erreurs et synchronisation -->
      <section v-if="loadError" class="bg-red-500/10 border border-red-500/40 text-red-300 p-4 rounded-md shadow-lg shrink-0">
        {{ loadError }}
      </section>
      <section
        v-else-if="isAwaitingInitialSync"
        class="bg-[#22C55E]/10 border border-[#22C55E]/40 text-[#D9FBE8] p-4 rounded-md shadow-[0_0_15px_rgba(34,197,94,0.1)] flex items-center gap-3 shrink-0"
      >
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#22C55E]"></div>
        En attente de synchronisation avec la room...
      </section>

      <!-- Grille principale à 3 colonnes -->
      <section v-else class="grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] xl:grid-cols-[400px_1fr_400px] 2xl:grid-cols-[450px_1fr_450px] gap-6 flex-1 min-h-0 items-stretch">
        
        <!-- SIDEBAR GAUCHE -->
        <aside class="space-y-4 flex flex-col h-full w-full">
          <div class="bg-[#111111]/80 backdrop-blur-sm border rounded-lg p-5 flex flex-col gap-4 shadow-xl relative overflow-hidden transition-all duration-300 h-full"
               :class="currentTurn?.teamId === leftTeam.id ? 'border-blue-500 ring-1 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-[#2A2A2A]'">
            <!-- Subtil glow effet équipe -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none -mr-10 -mt-10"></div>
            
            <div class="relative z-10 space-y-1">
              <h2 class="text-2xl font-title tracking-wider drop-shadow-md text-blue-400">
                {{ leftTeam.name || 'Équipe 1' }}
              </h2>
              <p v-if="isSideDecided" class="text-xs text-[#A1A1AA] uppercase tracking-widest">
                Capitaine: <span class="text-white font-bold">{{ leftTeam.captainName }}</span>
              </p>
              <p v-else class="text-xs text-[#A1A1AA] uppercase tracking-widest">
                Attente de la sélection...
              </p>
            </div>

            <!-- Liste des Picks -->
            <div class="flex-1 mt-4 relative z-10 w-full flex flex-col min-h-0">
              <h3 class="text-[10px] uppercase tracking-widest text-[#71717A] font-bold mb-2 shrink-0">Picks</h3>
              <div class="flex-1 flex flex-col gap-2 min-h-0">
                <div v-for="slot in 5" :key="'t1-'+slot" class="flex-1 bg-[#0B0F0C] border rounded-md relative flex items-center overflow-hidden shadow-inner transition-colors"
                     :class="currentTurn?.teamId === leftTeam.id && currentTurn?.slot === slot ? 'border-transparent shadow-[0_0_15px_rgba(59,130,246,0.3)]' : currentTurn?.teamId === leftTeam.id ? 'border-blue-500/20' : 'border-[#2A2A2A]'">
                  
                  <!-- Active Slot Indicator -->
                  <div v-if="currentTurn?.teamId === leftTeam.id && currentTurn?.slot === slot" class="neon-border neon-border-blue"></div>

                  <template v-if="getPickedChampion(leftTeam, slot)">
                    <!-- Champion Picked -->
                    <div class="absolute inset-0 w-full h-full animate-lockInBlue bg-[#0B0F0C]">
                      <!-- Placeholder (already cached) -->
                      <img 
                        :src="getChampionImage(getPickedChampion(leftTeam, slot)!)" 
                        class="absolute inset-0 w-full h-full object-cover blur-md opacity-60"
                        style="transform: scale(1) translateY(5%);"
                      />
                      <!-- Main Splash -->
                      <img 
                        :src="getChampionSplash(getPickedChampion(leftTeam, slot)!)" 
                        class="absolute inset-0 w-full h-full object-cover"
                        style="transform: scale(1) translateY(5%);"
                      />
                      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent mix-blend-overlay"></div>
                      
                      <!-- Bottom Gradient & Champion Name -->
                      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
                      <div class="absolute bottom-1.5 left-2.5 sm:bottom-2 sm:left-3 pointer-events-none z-10">
                        <span class="text-white font-title text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                          {{ getPickedChampion(leftTeam, slot)!.name }}
                        </span>
                      </div>

                      <div class="absolute inset-0 border border-blue-500/30 rounded-md animate-borderFlashBlue pointer-events-none z-20"></div>
                    </div>
                  </template>
                  <template v-else-if="currentTurn?.teamId === leftTeam.id && currentTurn?.slot === slot && canCurrentUserPick && selectedChampion">
                    <!-- Champion Preview (Intent) -->
                    <div class="absolute inset-0 w-full h-full opacity-80 saturate-50 transition-all duration-75 bg-[#0B0F0C]">
                      <!-- Placeholder -->
                      <img 
                        :src="getChampionImage(selectedChampion)" 
                        class="absolute inset-0 w-full h-full object-cover blur-md opacity-60"
                        style="transform: scale(1) translateY(5%);"
                      />
                      <!-- Main Splash -->
                      <img 
                        :src="getChampionSplash(selectedChampion)" 
                        class="absolute inset-0 w-full h-full object-cover"
                        style="transform: scale(1) translateY(5%);"
                      />
                      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent mix-blend-overlay"></div>
                      
                      <!-- Bottom Gradient & Champion Name -->
                      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
                      <div class="absolute bottom-1.5 left-2.5 sm:bottom-2 sm:left-3 pointer-events-none z-10">
                        <span class="text-white/80 font-title text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                          {{ selectedChampion.name }}
                        </span>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- ZONE CENTRALE -->
        <section class="space-y-6 flex flex-col h-full min-h-0">
          

          <!-- Phases de configuration (Side, First Pick) -->
          <div v-if="isSideFlowPhase" class="bg-[#111111]/80 backdrop-blur-sm border border-[#22C55E]/30 rounded-lg p-6 shadow-[0_0_20px_rgba(34,197,94,0.05)] space-y-6 text-center relative">
            <button
              @click="copyDraftLink"
              class="absolute top-4 right-4 text-[#A1A1AA] hover:text-[#22C55E] transition-colors px-3 py-2 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold bg-[#0B0F0C] border border-[#2A2A2A] hover:border-[#22C55E]/50 rounded-md shadow-md"
            >
              <svg v-if="!linkCopied" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span :class="linkCopied ? 'text-[#22C55E]' : ''">{{ linkCopied ? 'Copié !' : 'Copier lien draft' }}</span>
            </button>
            <h2 class="text-lg font-title uppercase tracking-widest text-[#22C55E]">Configuration Initiale</h2>
            
            <div v-if="state.phase === 'choose_side_team'" class="space-y-5">
              <p class="text-sm text-[#A1A1AA] max-w-md mx-auto">
                Qui a le choix du side ?
              </p>
              <div class="flex flex-wrap justify-center gap-4">
                <button
                  :disabled="!isCurrentUserCaptain"
                  @click="onVoteSideTeam(state.team1Id)"
                  class="px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest transition-all shadow-lg min-w-[150px]"
                  :class="state.sideTeamVotes[currentUser?.id ?? ''] === state.team1Id ? 'bg-white text-[#111111] shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-[#111111] border border-[#2A2A2A] text-[#F0FDF4] hover:border-white/50'"
                >
                  {{ state.team1Name }}
                </button>
                <button
                  :disabled="!isCurrentUserCaptain"
                  @click="onVoteSideTeam(state.team2Id)"
                  class="px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest transition-all shadow-lg min-w-[150px]"
                  :class="state.sideTeamVotes[currentUser?.id ?? ''] === state.team2Id ? 'bg-white text-[#111111] shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-[#111111] border border-[#2A2A2A] text-[#F0FDF4] hover:border-white/50'"
                >
                  {{ state.team2Name }}
                </button>
              </div>
              <div class="bg-[#0B0F0C] border border-[#2A2A2A] rounded-md p-3 text-xs text-[#A1A1AA] flex justify-center gap-6">
                <span><strong class="text-white">{{ captainTeam1Name }}</strong> : {{ votedTeamName(state.captainTeam1PlayerId) }}</span>
                <span><strong class="text-white">{{ captainTeam2Name }}</strong> : {{ votedTeamName(state.captainTeam2PlayerId) }}</span>
              </div>
            </div>

            <div v-else-if="state.phase === 'choose_side_color'" class="space-y-5">
              <p class="text-sm text-white max-w-md mx-auto">
                <strong class="text-[#22C55E] text-base">{{ sideChooserCaptainName }}</strong>, choisissez votre side.
              </p>
              <div class="flex justify-center gap-4">
                <button
                  :disabled="!isCurrentUserSideChooserCaptain"
                  @click="onChooseSide('blue')"
                  class="px-6 py-3 border border-blue-500/50 rounded-md text-sm font-bold uppercase tracking-widest text-blue-400 hover:bg-blue-500/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all shadow-lg"
                >
                  Side Bleu
                </button>
                <button
                  :disabled="!isCurrentUserSideChooserCaptain"
                  @click="onChooseSide('red')"
                  class="px-6 py-3 border border-red-500/50 rounded-md text-sm font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all shadow-lg"
                >
                  Side Rouge
                </button>
              </div>
            </div>

            <div v-else-if="state.phase === 'choose_first_pick'" class="space-y-5">
              <p class="text-sm text-white max-w-md mx-auto">
                <strong class="text-[#22C55E] text-base">{{ secondCaptainName }}</strong>, souhaitez-vous le First Pick ?
              </p>
              <div class="flex justify-center gap-4">
                <button
                  :disabled="!isCurrentUserSecondCaptain"
                  @click="onSecondCaptainFirstPick(true)"
                  class="px-6 py-3 border border-[#22C55E]/50 bg-[#22C55E]/5 rounded-md text-sm font-bold uppercase tracking-widest text-[#22C55E] hover:bg-[#22C55E]/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all shadow-lg"
                >
                  Prendre First Pick
                </button>
                <button
                  :disabled="!isCurrentUserSecondCaptain"
                  @click="onSecondCaptainFirstPick(false)"
                  class="px-6 py-3 border border-[#2A2A2A] bg-[#111111] rounded-md text-sm font-bold uppercase tracking-widest text-[#A1A1AA] hover:text-white hover:border-[#A1A1AA] transition-all shadow-lg"
                >
                  Laisser First Pick
                </button>
              </div>
            </div>
          </div>

          <!-- Phase de Draft (Grille Champions) -->
          <div v-if="!isSideFlowPhase" class="bg-[#111111]/80 backdrop-blur-sm border border-[#2A2A2A] rounded-lg p-5 shadow-xl flex-1 flex flex-col space-y-4 min-h-0">
            <!-- Filtres et validation -->
            <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4 shrink-0">
              <div class="flex items-center gap-3 w-full sm:w-auto">
                <div class="relative w-full sm:w-56">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A1A1AA]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Rechercher..."
                    class="w-full bg-[#0B0F0C] border border-[#2A2A2A] focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/50 outline-none pl-9 pr-3 py-2 rounded-md text-sm transition-all"
                  />
                </div>
                
                <!-- Role Tabs -->
                <div class="flex gap-1 overflow-x-auto w-full sm:w-auto bg-[#0B0F0C] border border-[#2A2A2A] p-1 rounded-md">
                  <button
                    v-for="role in roles"
                    :key="role.id"
                    @click="toggleRole(role.id)"
                    :class="[
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer border',
                      selectedRole === role.id
                        ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                        : 'bg-transparent text-[#A1A1AA] border-transparent hover:text-[#F0FDF4] hover:bg-[#111111]'
                    ]"
                    :title="role.name"
                  >
                    <img :src="role.icon" :alt="role.name" class="w-4 h-4 object-contain pointer-events-none drop-shadow-md" :class="{'brightness-0 invert opacity-60': selectedRole !== role.id}" />
                    <span class="hidden md:inline pointer-events-none">{{ role.name }}</span>
                  </button>
                </div>
              </div>
            </div>
            
            <p v-if="actionError" class="text-xs text-red-400 text-center font-bold">{{ actionError }}</p>

            <!-- Grille -->
            <div class="overflow-y-auto pr-2 scrollbar-hidden flex-1 min-h-0">
              <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3">
                <button
                  v-for="champ in filteredChampions"
                  :key="champ.id"
                  :disabled="isChampionDisabled(champ.id, champ.is_available)"
                  @click="onChampionClick(champ.id, champ.name)"
                  class="relative overflow-hidden rounded-md border transition-all duration-200 group aspect-square bg-[#0B0F0C]"
                  :class="championClass(champ.id, champ.is_available, selectedChampionId === champ.id)"
                >
                  <img
                    :src="getChampionImage(champ)"
                    :alt="champ.name"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <!-- Overlay gradient -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  
                  <div class="absolute inset-x-0 bottom-0 p-1.5 text-center">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-white drop-shadow-md truncate block">
                      {{ champ.name }}
                    </span>
                  </div>
                  
                  <!-- Overlay de sélection -->
                  <div v-if="selectedChampionId === champ.id" class="absolute inset-0 border-2 border-[#22C55E] shadow-[inset_0_0_15px_rgba(34,197,94,0.5)]"></div>
                </button>
              </div>
            </div>
          </div>

          <!-- BARRE D'ACTION UNIFIÉE (BOTTOM) -->
          <div class="mt-auto shrink-0 flex flex-col items-center z-20">
            <!-- Affichage du timer et contrôles -->
            <div class="mb-4 flex items-center justify-center gap-4 h-12">
              <div v-if="pickRemainingSec > 0" class="inline-flex items-center gap-2 px-6 py-2 bg-[#0B0F0C] border border-[#2A2A2A] rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <span class="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_10px_#22C55E]"></span>
                <span class="text-2xl font-bold text-[#F0FDF4]">{{ pickRemainingSec }}s</span>
              </div>
              <div v-else-if="state.phase === 'wait_before_pick_phase_2'" class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div class="inline-flex items-center gap-2 px-6 py-2 bg-[#0B0F0C] border border-[#22C55E]/50 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.2)] text-[#22C55E]">
                  <span class="text-sm font-bold uppercase tracking-widest">Reprise dans</span>
                  <span class="text-2xl font-bold">{{ waitRemainingSec }}s</span>
                </div>
                <button
                  v-if="isCurrentUserCaptain"
                  @click="onToggleSkipWaitVote"
                  class="inline-flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
                  :class="hasVotedToSkipWait ? 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-[#111111] border-[#2A2A2A] text-[#A1A1AA] hover:text-white hover:border-[#A1A1AA]'"
                >
                  <span>Passer l'attente ({{ skipWaitVotesCount }}/2)</span>
                </button>
              </div>

              <!-- Audio Controls -->
              <button
                @click.stop="toggleMute"
                class="bg-[#111111]/80 backdrop-blur-sm border border-[#2A2A2A] hover:border-[#22C55E]/50 text-[#A1A1AA] hover:text-[#22C55E] p-2.5 rounded-full shadow-lg transition-all"
                title="Activer/Désactiver le son"
              >
                <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>

            <!-- LOBBY -->
            <button
              v-if="state.phase === 'lobby'"
              @click="onToggleReady"
              :disabled="!isCurrentUserCaptain"
              class="w-full max-w-lg py-4 rounded-md text-lg font-bold tracking-[0.2em] uppercase transition-all shadow-xl"
              :class="!isCurrentUserCaptain 
                ? 'bg-[#111111] border border-[#2A2A2A] text-[#A1A1AA] cursor-not-allowed'
                : isCurrentUserTeamReady
                  ? 'border-2 border-[#22C55E] text-[#22C55E] bg-[#22C55E]/10 hover:bg-[#22C55E]/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                  : 'bg-[#22C55E] text-[#0B0F0C] hover:bg-[#4ADE80] shadow-[0_0_30px_rgba(34,197,94,0.4)]'"
            >
              <template v-if="!isCurrentUserCaptain">
                En attente des capitaines...
              </template>
              <template v-else-if="isCurrentUserTeamReady">
                Not Ready
              </template>
              <template v-else>
                Ready
              </template>
            </button>

            <!-- DRAFT PHASE (Picks) -->
            <button
              v-else-if="state.phase === 'pick_phase_1' || state.phase === 'pick_phase_2'"
              @click="onConfirmChampion"
              :disabled="!canCurrentUserPick || !canConfirmSelectedChampion"
              class="w-full max-w-lg py-4 rounded-md text-lg font-bold tracking-[0.2em] uppercase transition-all shadow-xl relative overflow-hidden border"
              :class="!canCurrentUserPick
                ? 'bg-[#111111] border-transparent text-[#A1A1AA] cursor-not-allowed'
                : canConfirmSelectedChampion
                  ? 'bg-[#22C55E] border-transparent text-[#0B0F0C] hover:bg-[#4ADE80] shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                  : 'bg-[#0B0F0C] border-[#2A2A2A] text-[#71717A] cursor-not-allowed'"
            >
              <template v-if="!canCurrentUserPick">
                <div class="flex items-center justify-center gap-3 relative z-10">
                  <span>L'adversaire choisit</span>
                </div>
                <div class="neon-border neon-border-gray"></div>
              </template>
              <template v-else-if="!canConfirmSelectedChampion">
                Sélectionnez un champion
              </template>
              <template v-else>
                pick
              </template>
            </button>

            <!-- FIN -->
            <div
              v-else-if="state.phase === 'completed'"
              class="w-full max-w-lg py-4 rounded-md text-lg font-bold tracking-[0.2em] uppercase bg-[#111111] border border-[#22C55E] text-[#22C55E] text-center shadow-[0_0_30px_rgba(34,197,94,0.2)]"
            >
              Draft terminée
            </div>
          </div>
        </section>

        <!-- SIDEBAR DROITE -->
        <aside class="space-y-4 flex flex-col h-full w-full">
          <div class="bg-[#111111]/80 backdrop-blur-sm border rounded-lg p-5 flex flex-col gap-4 shadow-xl relative overflow-hidden transition-all duration-300 h-full"
               :class="currentTurn?.teamId === rightTeam.id ? 'border-red-500 ring-1 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-[#2A2A2A]'">
            <!-- Subtil glow effet équipe -->
            <div class="absolute top-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none -ml-10 -mt-10"></div>
            
            <div class="relative z-10 space-y-1 text-right">
              <h2 class="text-2xl font-title tracking-wider drop-shadow-md text-red-400">
                {{ rightTeam.name || 'Équipe 2' }}
              </h2>
              <p v-if="isSideDecided" class="text-xs text-[#A1A1AA] uppercase tracking-widest">
                Capitaine: <span class="text-white font-bold">{{ rightTeam.captainName }}</span>
              </p>
              <p v-else class="text-xs text-[#A1A1AA] uppercase tracking-widest">
                Attente de la sélection...
              </p>
            </div>

            <!-- Liste des Picks -->
            <div class="flex-1 mt-4 relative z-10 w-full flex flex-col min-h-0">
              <h3 class="text-[10px] uppercase tracking-widest text-[#71717A] font-bold mb-2 text-right shrink-0">Picks</h3>
              <div class="flex-1 flex flex-col gap-2 min-h-0">
                <div v-for="slot in 5" :key="'t2-'+slot" class="flex-1 bg-[#0B0F0C] border rounded-md relative flex items-center justify-end overflow-hidden shadow-inner transition-colors"
                     :class="currentTurn?.teamId === rightTeam.id && currentTurn?.slot === slot ? 'border-transparent shadow-[0_0_15px_rgba(239,68,68,0.3)]' : currentTurn?.teamId === rightTeam.id ? 'border-red-500/20' : 'border-[#2A2A2A]'">
                  
                  <!-- Active Slot Indicator -->
                  <div v-if="currentTurn?.teamId === rightTeam.id && currentTurn?.slot === slot" class="neon-border neon-border-red"></div>

                  <template v-if="getPickedChampion(rightTeam, slot)">
                    <!-- Champion Picked -->
                    <div class="absolute inset-0 w-full h-full animate-lockInRed bg-[#0B0F0C]">
                      <!-- Placeholder -->
                      <img 
                        :src="getChampionImage(getPickedChampion(rightTeam, slot)!)" 
                        class="absolute inset-0 w-full h-full object-cover blur-md opacity-60"
                        style="transform: scale(1) translateY(5%);"
                      />
                      <!-- Main Splash -->
                      <img 
                        :src="getChampionSplash(getPickedChampion(rightTeam, slot)!)" 
                        class="absolute inset-0 w-full h-full object-cover"
                        style="transform: scale(1) translateY(5%);"
                      />
                      <div class="absolute inset-0 bg-gradient-to-l from-red-600/20 to-transparent mix-blend-overlay"></div>
                      
                      <!-- Bottom Gradient & Champion Name -->
                      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
                      <div class="absolute bottom-1.5 left-2.5 sm:bottom-2 sm:left-3 pointer-events-none z-10">
                        <span class="text-white font-title text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                          {{ getPickedChampion(rightTeam, slot)!.name }}
                        </span>
                      </div>

                      <div class="absolute inset-0 border border-red-500/30 rounded-md animate-borderFlashRed pointer-events-none z-20"></div>
                    </div>
                  </template>
                  <template v-else-if="currentTurn?.teamId === rightTeam.id && currentTurn?.slot === slot && canCurrentUserPick && selectedChampion">
                    <!-- Champion Preview (Intent) -->
                    <div class="absolute inset-0 w-full h-full opacity-80 saturate-50 transition-all duration-75 bg-[#0B0F0C]">
                      <!-- Placeholder -->
                      <img 
                        :src="getChampionImage(selectedChampion)" 
                        class="absolute inset-0 w-full h-full object-cover blur-md opacity-60"
                        style="transform: scale(1) translateY(5%);"
                      />
                      <!-- Main Splash -->
                      <img 
                        :src="getChampionSplash(selectedChampion)" 
                        class="absolute inset-0 w-full h-full object-cover"
                        style="transform: scale(1) translateY(5%);"
                      />
                      <div class="absolute inset-0 bg-gradient-to-l from-red-600/10 to-transparent mix-blend-overlay"></div>
                      
                      <!-- Bottom Gradient & Champion Name -->
                      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
                      <div class="absolute bottom-1.5 left-2.5 sm:bottom-2 sm:left-3 pointer-events-none z-10">
                        <span class="text-white/80 font-title text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                          {{ selectedChampion.name }}
                        </span>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "../lib/supabase";
import { getChampions, getPlayers } from "../lib/queries";
import {
  createInitialDraftState,
  enterWaitPhase,
  getCurrentTurn,
  lockChampionPick,
  maybeAutoSkipTurn,
  maybeExitWaitPhase,
  setSecondCaptainFirstPickDecision,
  setSideColor,
  setSideTeamVote,
  toggleReady,
  toggleSkipWaitVote,
} from "../lib/draftEngine";
import { useRealtimeDraftSession } from "../composables/useRealtimeDraftSession";
import { useDraftAudio } from "../composables/useDraftAudio";
import type { DraftSessionState } from "../types/draft";
import type { Database } from "../types/supabase";

import topIcon from "../assets/top.png";
import jglIcon from "../assets/jgl.png";
import midIcon from "../assets/mid.png";
import adcIcon from "../assets/adc.png";
import supportIcon from "../assets/support.png";

type Champion = Database["public"]["Tables"]["champions"]["Row"];
type Player = Database["public"]["Tables"]["players"]["Row"];

const route = useRoute();
const loadError = ref("");
const actionError = ref("");
const linkCopied = ref(false);
const champions = ref<Champion[]>([]);

const copyDraftLink = () => {
  navigator.clipboard.writeText(window.location.href);
  linkCopied.value = true;
  setTimeout(() => {
    linkCopied.value = false;
  }, 2000);
};
const players = ref<Player[]>([]);
const searchQuery = ref("");
const selectedRole = ref("");
const selectedChampionId = ref<string | null>(null);
const selectedChampionName = ref<string | null>(null);
const nowMs = ref(Date.now());
let timerInterval: ReturnType<typeof setInterval> | null = null;

const userRaw = localStorage.getItem("mcu_user");
const currentUser = userRaw ? (JSON.parse(userRaw) as { id: string; pseudo: string; team_id: string | null }) : null;

const sessionId = route.params.sessionId as string;
const isInitializing = ref(true);
const draftStateStorageKey = `draft_room_state_${sessionId}`;

if (!sessionId) {
  loadError.value = "URL de draft invalide.";
}

const baseInitialState: DraftSessionState = createInitialDraftState({
  sessionId,
  createdByPlayerId: currentUser?.id ?? "anonymous",
  team1Id: "",
  team2Id: "",
  team1Name: "Équipe 1",
  team2Name: "Équipe 2",
  sideChooserTeamId: "",
  firstPickTeamId: "",
  captainTeam1PlayerId: "",
  captainTeam2PlayerId: "",
});

const hydrateStateFromStorage = (base: DraftSessionState): DraftSessionState => {
  try {
    const raw = localStorage.getItem(draftStateStorageKey);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as DraftSessionState;
    if (!parsed || parsed.sessionId !== base.sessionId) return base;
    if (!Array.isArray(parsed.turnOrder) || !Array.isArray(parsed.picks)) return base;
    return {
      ...parsed,
      selectedSide: parsed.selectedSide ?? null,
      sideTeamVotes: parsed.sideTeamVotes ?? {},
      pickTurnStartedAt: parsed.pickTurnStartedAt ?? null,
      pickTurnDurationSec: parsed.pickTurnDurationSec ?? 30,
      hasCompletedMidDraftPause: parsed.hasCompletedMidDraftPause ?? false,
    };
  } catch {
    return base;
  }
};

const initialState = hydrateStateFromStorage(baseInitialState);

const { state, init, dispose, broadcastState, activeDriverId } = useRealtimeDraftSession(initialState, currentUser);

const {
  isMuted,
  initAudio,
  playLockSound,
  playTickSound,
  playYourTurnSound,
  playClickSound,
  startConfigMusic,
  startBackgroundMusic,
  stopAllMusic,
  playDraftEndSound,
  toggleMute
} = useDraftAudio();

const isAwaitingInitialSync = computed(() => {
  if (isInitializing.value) return true;
  return (
    !state.value.team1Id ||
    !state.value.team2Id ||
    !state.value.captainTeam1PlayerId ||
    !state.value.captainTeam2PlayerId
  );
});
const isSideFlowPhase = computed(() =>
  ["choose_side_team", "choose_side_color", "choose_first_pick"].includes(state.value.phase),
);

const isSideDecided = computed(() => {
  return state.value.phase !== "lobby" && 
         state.value.phase !== "choose_side_team" && 
         state.value.phase !== "choose_side_color";
});

const blueTeamId = computed(() => {
  if (!isSideDecided.value) return state.value.team1Id;
  if (state.value.sideChooserTeamId === state.value.team1Id) {
    return state.value.selectedSide === 'blue' ? state.value.team1Id : state.value.team2Id;
  } else {
    return state.value.selectedSide === 'blue' ? state.value.team2Id : state.value.team1Id;
  }
});

const redTeamId = computed(() => {
  return blueTeamId.value === state.value.team1Id ? state.value.team2Id : state.value.team1Id;
});

const leftTeam = computed(() => {
  const tId = blueTeamId.value;
  const isTeam1 = tId === state.value.team1Id;
  return {
    id: tId,
    name: isTeam1 ? state.value.team1Name : state.value.team2Name,
    captainName: isTeam1 ? captainTeam1Name.value : captainTeam2Name.value,
    picks: isTeam1 ? team1Picks.value : team2Picks.value,
    colorClass: isSideDecided.value ? 'blue' : 'neutral'
  };
});

const rightTeam = computed(() => {
  const tId = redTeamId.value;
  const isTeam1 = tId === state.value.team1Id;
  return {
    id: tId,
    name: isTeam1 ? state.value.team1Name : state.value.team2Name,
    captainName: isTeam1 ? captainTeam1Name.value : captainTeam2Name.value,
    picks: isTeam1 ? team1Picks.value : team2Picks.value,
    colorClass: isSideDecided.value ? 'red' : 'neutral'
  };
});

const roleAliases: Record<string, string> = {
  top: "top",
  toplane: "top",
  jungle: "jungle",
  jgl: "jungle",
  mid: "mid",
  middle: "mid",
  adc: "adc",
  bot: "adc",
  support: "support",
  supp: "support",
};

const roles = [
  { id: "top", name: "Top", icon: topIcon },
  { id: "jungle", name: "Jgl", icon: jglIcon },
  { id: "mid", name: "Mid", icon: midIcon },
  { id: "adc", name: "ADC", icon: adcIcon },
  { id: "support", name: "Supp", icon: supportIcon },
];

const toggleRole = (roleId: string) => {
  selectedRole.value = selectedRole.value === roleId ? "" : roleId;
};

const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase());
const pickedChampionIds = computed(() => new Set(state.value.picks.map((p) => p.championId)));
const currentTurn = computed(() => getCurrentTurn(state.value));

const isCurrentUserCaptain = computed(() => {
  if (!currentUser?.id) return false;
  // Fallback sur le state local en premier car il est la source de vérité pour les IDs de capitaines de la draft actuelle
  if (
    currentUser.id === state.value.captainTeam1PlayerId ||
    currentUser.id === state.value.captainTeam2PlayerId
  ) {
    return true;
  }
  
  // Vérification via les joueurs chargés en fallback
  const p = players.value.find(pl => pl.id === currentUser.id);
  if (p && (p as any).is_capitaine) return true;
  
  return false;
});

const currentUserCaptainTeamId = computed<string | null>(() => {
  if (!currentUser?.id) return null;
  
  if (currentUser.id === state.value.captainTeam1PlayerId) return state.value.team1Id;
  if (currentUser.id === state.value.captainTeam2PlayerId) return state.value.team2Id;

  // Vérification explicite
  const p = players.value.find(pl => pl.id === currentUser.id);
  if (p && (p as any).is_capitaine && p.team_id) {
    if (p.team_id === state.value.team1Id) return state.value.team1Id;
    if (p.team_id === state.value.team2Id) return state.value.team2Id;
  }
  
  return null;
});
const sideChooserCaptainId = computed(() =>
  state.value.sideChooserTeamId === state.value.team1Id
    ? state.value.captainTeam1PlayerId
    : state.value.captainTeam2PlayerId,
);
const secondCaptainId = computed(() =>
  state.value.sideChooserTeamId === state.value.team1Id
    ? state.value.captainTeam2PlayerId
    : state.value.captainTeam1PlayerId,
);
const isCurrentUserSideChooserCaptain = computed(
  () => !!currentUser?.id && currentUser.id === sideChooserCaptainId.value,
);
const isCurrentUserSecondCaptain = computed(
  () => !!currentUser?.id && currentUser.id === secondCaptainId.value,
);

const isCurrentUserTeamReady = computed(() => {
  if (!currentUserCaptainTeamId.value) return false;
  return state.value.readyTeamIds.includes(currentUserCaptainTeamId.value);
});

const canCurrentUserPick = computed(() => {
  if (!isCurrentUserCaptain.value || !currentUserCaptainTeamId.value || !currentTurn.value) return false;
  const inPickPhase = state.value.phase === "pick_phase_1" || state.value.phase === "pick_phase_2";
  return inPickPhase && currentTurn.value.teamId === currentUserCaptainTeamId.value;
});
const canConfirmSelectedChampion = computed(() => {
  if (!selectedChampionId.value || !canCurrentUserPick.value) return false;
  const champ = champions.value.find((c) => c.id === selectedChampionId.value);
  if (!champ) return false;
  return !isChampionDisabled(champ.id, champ.is_available);
});

const selectedChampion = computed(() => {
  if (!selectedChampionId.value) return null;
  return champions.value.find((c) => c.id === selectedChampionId.value) || null;
});

const getPickedChampion = (team: any, slot: number) => {
  const pick = team.picks.find((p: any) => p.slot === slot);
  if (!pick) return null;
  return champions.value.find(c => c.id === pick.championId) || null;
};

const team1Picks = computed(() => state.value.picks.filter((p) => p.teamId === state.value.team1Id));
const team2Picks = computed(() => state.value.picks.filter((p) => p.teamId === state.value.team2Id));

const waitRemainingSec = computed(() => {
  if (state.value.phase !== "wait_before_pick_phase_2" || !state.value.waitPhaseStartedAt) return 0;
  const elapsed = Math.floor((nowMs.value - state.value.waitPhaseStartedAt) / 1000);
  return Math.max(0, state.value.waitPhaseDurationSec - elapsed);
});
const pickRemainingSec = computed(() => {
  const inPickPhase = state.value.phase === "pick_phase_1" || state.value.phase === "pick_phase_2";
  if (!inPickPhase || !state.value.pickTurnStartedAt) return 0;
  const elapsed = Math.floor((nowMs.value - state.value.pickTurnStartedAt) / 1000);
  return Math.max(0, state.value.pickTurnDurationSec - elapsed);
});

const captainTeam1Name = computed(() => {
  const p = players.value.find((pl) => pl.id === state.value.captainTeam1PlayerId);
  return p?.pseudo ?? "Inconnu";
});
const captainTeam2Name = computed(() => {
  const p = players.value.find((pl) => pl.id === state.value.captainTeam2PlayerId);
  return p?.pseudo ?? "Inconnu";
});
const sideChooserCaptainName = computed(() => {
  const p = players.value.find((pl) => pl.id === sideChooserCaptainId.value);
  return p?.pseudo ?? "Capitaine";
});
const secondCaptainName = computed(() => {
  const p = players.value.find((pl) => pl.id === secondCaptainId.value);
  return p?.pseudo ?? "Capitaine";
});

const filteredChampions = computed(() => {
  return champions.value.filter((champ) => {
    if (normalizedSearch.value && !champ.name.toLowerCase().includes(normalizedSearch.value)) return false;
    if (!selectedRole.value) return true;
    const roles = (champ.roles ?? []).map((r) => roleAliases[String(r).toLowerCase()] ?? String(r).toLowerCase());
    return roles.includes(selectedRole.value);
  });
});

const isChampionDisabled = (championId: string, isAvailable: boolean | null) => {
  if (!isAvailable) return true;
  if (pickedChampionIds.value.has(championId)) return true;
  return false;
};

const championClass = (championId: string, isAvailable: boolean | null, isSelected: boolean) => {
  const disabled = isChampionDisabled(championId, isAvailable);
  if (disabled) {
    return "border-[#3F3F46] opacity-40 grayscale cursor-not-allowed";
  }
  if (isSelected) {
    return "border-[#22C55E] ring-1 ring-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.4)]";
  }
  if (canCurrentUserPick.value) {
    return "border-[#2A2A2A] hover:border-[#22C55E] hover:-translate-y-1";
  }
  return "border-[#2A2A2A] opacity-70 cursor-not-allowed";
};

const onToggleReady = async () => {
  actionError.value = "";
  if (!currentUserCaptainTeamId.value || !isCurrentUserCaptain.value || state.value.phase !== "lobby") return;
  const next = toggleReady(state.value, currentUserCaptainTeamId.value);
  await broadcastState(next);
};

const onToggleSkipWaitVote = async () => {
  if (!currentUser?.id || !isCurrentUserCaptain.value) return;
  const next = toggleSkipWaitVote(state.value, currentUser.id);
  if (next.version !== state.value.version) {
    await broadcastState(next);
  }
};

const hasVotedToSkipWait = computed(() => {
  if (!currentUser?.id) return false;
  return !!state.value.skipWaitVotes?.[currentUser.id];
});

const skipWaitVotesCount = computed(() => {
  return Object.values(state.value.skipWaitVotes || {}).filter(Boolean).length;
});

const votedTeamName = (captainId: string) => {
  const teamId = state.value.sideTeamVotes[captainId];
  if (!teamId) return "En attente";
  return teamId === state.value.team1Id ? state.value.team1Name : state.value.team2Name;
};

const onVoteSideTeam = async (teamId: string) => {
  if (!currentUser?.id || !isCurrentUserCaptain.value) return;
  const next = setSideTeamVote(state.value, currentUser.id, teamId);
  if (next.version !== state.value.version) {
    await broadcastState(next);
  }
};

const onChooseSide = async (side: "blue" | "red") => {
  if (!currentUser?.id) return;
  const next = setSideColor(state.value, currentUser.id, side);
  if (next.version !== state.value.version) {
    await broadcastState(next);
  }
};

const onSecondCaptainFirstPick = async (wantsFirstPick: boolean) => {
  if (!currentUser?.id) return;
  const next = setSecondCaptainFirstPickDecision(state.value, currentUser.id, wantsFirstPick);
  if (next.version !== state.value.version) {
    await broadcastState(next);
  }
};

const onChampionClick = async (championId: string, championName: string) => {
  actionError.value = "";
  if (!canCurrentUserPick.value) {
    return;
  }
  const champ = champions.value.find((c) => c.id === championId);
  if (!champ || isChampionDisabled(championId, champ.is_available)) return;
  
  if (selectedChampionId.value !== championId) {
    playClickSound();
  }
  
  selectedChampionId.value = championId;
  selectedChampionName.value = championName;
};

const onConfirmChampion = async () => {
  actionError.value = "";
  if (!selectedChampionId.value || !selectedChampionName.value) return;
  if (!canCurrentUserPick.value || !currentUserCaptainTeamId.value || !currentUser?.id) {
    return;
  }

  const champ = champions.value.find((c) => c.id === selectedChampionId.value);
  if (!champ || isChampionDisabled(selectedChampionId.value, champ.is_available)) {
    actionError.value = "Ce champion n'est plus disponible.";
    selectedChampionId.value = null;
    selectedChampionName.value = null;
    return;
  }
  const current = state.value;
  const withPick = lockChampionPick(current, {
    championId: selectedChampionId.value,
    championName: selectedChampionName.value,
    teamId: currentUserCaptainTeamId.value,
    lockedByPlayerId: currentUser.id,
  });

  if (withPick.version === current.version) return;
  
  playLockSound();
  
  const withWait = enterWaitPhase(withPick);

  selectedChampionId.value = null;
  selectedChampionName.value = null;
  await broadcastState(withWait);
};

const normalizeChampionAssetId = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");

const getChampionImage = (champ: Champion) => {
  if (champ.image_url) return champ.image_url;
  const key = (champ as any).ddragon_key as string | undefined;
  const assetId = normalizeChampionAssetId(key || champ.name);
  return `https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion/${assetId}.png`;
};

const getChampionSplash = (champ: Champion) => {
  if ((champ as any).splash_url) {
    // Convert existing splash URLs to centered if possible
    const url = (champ as any).splash_url as string;
    if (url.includes('/splash/')) {
      return url.replace('/splash/', '/centered/');
    }
    return url;
  }
  if (champ.image_url) return champ.image_url;
  const key = (champ as any).ddragon_key as string | undefined;
  
  // Utilisation de l'API CommunityDragon pour les splash arts centrés de haute qualité
  // (Format utilisé par Drafter)
  const champNameLower = (key || champ.name).toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/${champNameLower}/skins/base/images/${champNameLower}_splash_centered_0.jpg`;
};

const loadData = async () => {
  const [championRes, playerRes] = await Promise.all([getChampions(), getPlayers()]);

  if (championRes.data) {
    champions.value = championRes.data;
  }
  if (playerRes.data) {
    players.value = playerRes.data;
  }
};

onMounted(async () => {
  if (loadError.value) return;

  try {
    const { data: match, error } = await supabase
      .from('playoff_matches')
      .select('team1_id, team2_id')
      .eq('id', sessionId)
      .single();

    if (error || !match) {
      loadError.value = "Match introuvable.";
    } else if (match.team1_id && match.team2_id) {
      const { data: teams } = await supabase.from('teams').select('id, name').in('id', [match.team1_id, match.team2_id]);
      const { data: players } = await supabase.from('players').select('id, team_id, is_capitaine').in('team_id', [match.team1_id, match.team2_id]);
      
      const t1 = teams?.find((t: any) => t.id === match.team1_id);
      const t2 = teams?.find((t: any) => t.id === match.team2_id);
      
      const t1Players = players?.filter((p: any) => p.team_id === match.team1_id) || [];
      const t2Players = players?.filter((p: any) => p.team_id === match.team2_id) || [];
      
      const captain1 = t1Players.find((p: any) => p.is_capitaine)?.id || t1Players[0]?.id || "";
      const captain2 = t2Players.find((p: any) => p.is_capitaine)?.id || t2Players[0]?.id || "";

      if (t1 && t2) {
        // Force l'actualisation des noms depuis la base de données (utile si en cache)
        state.value.team1Name = t1.name;
        state.value.team2Name = t2.name;

        // Mise à jour si c'est la première init, ou si les capitaines dans le state ne correspondent pas à la DB
        if (!state.value.team1Id || state.value.captainTeam1PlayerId !== captain1 || state.value.captainTeam2PlayerId !== captain2) {
          const freshState = createInitialDraftState({
            sessionId,
            createdByPlayerId: currentUser?.id ?? "anonymous",
            team1Id: t1.id,
            team2Id: t2.id,
            team1Name: t1.name,
            team2Name: t2.name,
            sideChooserTeamId: t1.id,
            firstPickTeamId: t1.id,
            captainTeam1PlayerId: captain1,
            captainTeam2PlayerId: captain2,
          });
          
          state.value = {
            ...state.value,
            team1Id: freshState.team1Id,
            team2Id: freshState.team2Id,
            team1Name: freshState.team1Name,
            team2Name: freshState.team2Name,
            sideChooserTeamId: state.value.sideChooserTeamId || freshState.sideChooserTeamId,
            firstPickTeamId: state.value.firstPickTeamId || freshState.firstPickTeamId,
            captainTeam1PlayerId: freshState.captainTeam1PlayerId,
            captainTeam2PlayerId: freshState.captainTeam2PlayerId,
          };
        }
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    isInitializing.value = false;
  }

  void init();
  void loadData();
  
  timerInterval = setInterval(() => {
    nowMs.value = Date.now();
    if (!currentUser?.id) return;

    if (canCurrentUserPick.value && pickRemainingSec.value === 0 && selectedChampionId.value && canConfirmSelectedChampion.value) {
      void onConfirmChampion();
      return;
    }

    const isDriver = currentUser.id === activeDriverId.value;
    if (!isDriver) return;
    const afterWait = maybeExitWaitPhase(state.value, nowMs.value);
    if (afterWait.version !== state.value.version) {
      void broadcastState(afterWait);
      return;
    }
    const afterTimeout = maybeAutoSkipTurn(state.value, nowMs.value);
    if (afterTimeout.version !== state.value.version) {
      const withWait = enterWaitPhase(afterTimeout);
      void broadcastState(withWait);
    }
  }, 1000);
});

watch(
  () => state.value.phase,
  async (newPhase, oldPhase) => {
    // Gestion de la musique
    if (["lobby", "choose_side_team", "choose_side_color", "choose_first_pick"].includes(newPhase)) {
      startConfigMusic();
    } else if (newPhase === "pick_phase_1" || newPhase === "pick_phase_2") {
      startBackgroundMusic();
    } else if (newPhase === "completed" && oldPhase !== "completed") {
      playDraftEndSound();
    }

    if (newPhase === "completed" && oldPhase !== "completed") {
      if (currentUser?.id && currentUser.id === activeDriverId.value) {
        const pickedIds = state.value.picks
          .map((p) => p.championId)
          .filter((id) => !id.startsWith("__empty_pick__"));

        if (pickedIds.length > 0) {
          // Update playoff_matches.draft_picks
          await supabase
            .from("playoff_matches")
            .update({ draft_picks: pickedIds })
            .eq("id", sessionId);
            
          // Note: On ne désactive plus les champions ici.
          // Cela se fera via le panel admin quand tout le round sera validé.
        }
      }
    }
  }
);

watch(
  () => state.value.version,
  () => {
    try {
      localStorage.setItem(draftStateStorageKey, JSON.stringify(state.value));
    } catch {
      // Ignore storage write errors
    }
    if (!selectedChampionId.value) return;
    const champ = champions.value.find((c) => c.id === selectedChampionId.value);
    if (!champ || isChampionDisabled(selectedChampionId.value, champ.is_available)) {
      selectedChampionId.value = null;
      selectedChampionName.value = null;
    }
  },
);

watch(pickRemainingSec, (newVal, oldVal) => {
  if (newVal <= 10 && newVal > 0 && newVal !== oldVal) {
    playTickSound();
  }
});

watch(
  () => currentTurn.value,
  (newTurn, oldTurn) => {
    if (!newTurn) return;
    if (
      newTurn.teamId === currentUserCaptainTeamId.value &&
      (!oldTurn || oldTurn.teamId !== newTurn.teamId || oldTurn.slot !== newTurn.slot)
    ) {
      playYourTurnSound();
    }
  }
);

onUnmounted(() => {
  stopAllMusic();
  if (timerInterval) clearInterval(timerInterval);
  void dispose();
});
</script>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

@keyframes lockInBlue {
  0% { filter: brightness(2) contrast(1.5); transform: scale(1.15); }
  50% { filter: brightness(1.5) contrast(1.2); transform: scale(1.05); }
  100% { filter: brightness(1); transform: scale(1); }
}

@keyframes lockInRed {
  0% { filter: brightness(2) contrast(1.5); transform: scale(1.15); }
  50% { filter: brightness(1.5) contrast(1.2); transform: scale(1.05); }
  100% { filter: brightness(1); transform: scale(1); }
}

@keyframes borderFlashBlue {
  0% { box-shadow: inset 0 0 0 2px rgba(59,130,246,1), 0 0 30px rgba(59,130,246,0.8); }
  100% { box-shadow: inset 0 0 0 1px rgba(59,130,246,0.3), 0 0 0px rgba(59,130,246,0); }
}

@keyframes borderFlashRed {
  0% { box-shadow: inset 0 0 0 2px rgba(239,68,68,1), 0 0 30px rgba(239,68,68,0.8); }
  100% { box-shadow: inset 0 0 0 1px rgba(239,68,68,0.3), 0 0 0px rgba(239,68,68,0); }
}

.animate-lockInBlue {
  animation: lockInBlue 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.animate-lockInRed {
  animation: lockInRed 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.animate-borderFlashBlue {
  animation: borderFlashBlue 0.8s ease-out forwards;
}

.animate-borderFlashRed {
  animation: borderFlashRed 0.8s ease-out forwards;
}

.neon-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 20;
  padding: 2px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  overflow: hidden;
}

.neon-border::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300%;
  height: 300%;
  transform: translate(-50%, -50%);
  animation: spin 3s linear infinite;
}

.neon-border-blue::before {
  background: conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(59, 130, 246, 0.3) 90%, #3b82f6 100%);
}

.neon-border-red::before {
  background: conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(239, 68, 68, 0.3) 90%, #ef4444 100%);
}

.neon-border-gray::before {
  background: conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(161, 161, 170, 0.3) 90%, #a1a1aa 100%);
}

@keyframes spin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
</style>
