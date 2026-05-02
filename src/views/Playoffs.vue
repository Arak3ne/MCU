<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] font-sans selection:bg-[#22C55E] selection:text-[#0B0F0C] overflow-x-hidden">
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
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4ADE80] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#22C55E] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
    </div>

    <!-- Main Content -->
    <main class="relative z-10 w-full px-6 py-12">
      <!-- Header -->
      <div class="text-center mb-16 relative">
        <div class="inline-block relative">
          <h1 class="text-5xl md:text-7xl font-title uppercase tracking-wider mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] drop-shadow-2xl">
            Playoffs
          </h1>
          <div class="absolute -inset-x-16 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/30 to-transparent -z-10"></div>
        </div>
        <p class="text-[#A1A1AA] font-medium tracking-widest uppercase text-sm mt-2">Phase de Groupes & Arbre Final</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 opacity-50">
        <div class="w-12 h-12 border-4 border-[#2A2A2A] border-t-[#22C55E] rounded-full animate-spin mb-6"></div>
        <p class="text-[#22C55E] uppercase tracking-widest text-sm font-bold animate-pulse">Chargement...</p>
      </div>

      <div v-else-if="matches.length === 0" class="text-center py-20">
        <p class="text-[#A1A1AA] uppercase tracking-widest text-sm font-bold mb-4">Aucun match de playoff actif</p>
      </div>

      <div v-else class="w-full overflow-x-auto custom-scrollbar pb-12 animate-fade-in-up">
        <div class="min-w-max mx-auto flex flex-col gap-24 px-8">
          
          <!-- GROUP STAGE -->
          <div v-if="groupARounds.length > 0 || groupBRounds.length > 0" 
               class="w-full max-w-7xl mx-auto animate-fade-in-up-delayed"
               :class="isGroupStageCompleted ? 'order-2 mt-12' : 'order-1'">
            <h3 class="text-4xl font-title mb-16 text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] uppercase tracking-[0.2em] text-center drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]">Group Stage</h3>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <!-- Group A -->
              <div v-if="groupARounds.length > 0" class="flex flex-col gap-8">
                <!-- Standings Card -->
                <div class="bg-[#111111]/80 backdrop-blur-xl border border-[#22C55E]/20 rounded-xl overflow-hidden shadow-2xl relative">
                  <div class="absolute top-0 right-0 w-48 h-48 bg-[#4ADE80] opacity-[0.03] blur-[60px] pointer-events-none"></div>
                  <div class="p-5 border-b border-[#2A2A2A] bg-gradient-to-r from-[#22C55E]/10 to-transparent">
                    <h4 class="text-xl font-title text-[#4ADE80] uppercase tracking-widest">Groupe Morue</h4>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                      <thead>
                        <tr class="text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-[#2A2A2A]">
                          <th class="px-6 py-4">Pos</th>
                          <th class="px-6 py-4">Team</th>
                          <th class="px-6 py-4 text-center">W</th>
                          <th class="px-6 py-4 text-center">L</th>
                          <th class="px-6 py-4 text-right">Pts</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-[#2A2A2A]/30">
                        <tr v-for="(team, index) in groupAStandings" :key="team.id" 
                            class="group transition-colors">
                          <td class="px-6 py-4">
                            <span class="w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold"
                                  :class="index < 2 ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30' : 'text-white/30'">
                              {{ index + 1 }}
                            </span>
                          </td>
                          <td class="px-6 py-4">
                            <span class="font-bold text-[#F0FDF4] group-hover:text-[#22C55E] transition-colors uppercase tracking-wide text-sm">{{ team.name }}</span>
                          </td>
                          <td class="px-6 py-4 text-center text-sm font-medium">{{ team.wins || 0 }}</td>
                          <td class="px-6 py-4 text-center text-sm font-medium text-white/40">{{ team.losses || 0 }}</td>
                          <td class="px-6 py-4 text-right">
                            <span class="font-title text-[#22C55E] text-lg">{{ team.points || 0 }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Group A Matches -->
                <div v-if="!isGroupStageCompleted" class="flex flex-col gap-6 mt-4">
                  <div v-for="(round, rIndex) in groupARounds" :key="'ga'+rIndex" class="flex flex-col gap-3">
                    <div class="text-[10px] font-bold text-[#4ADE80] uppercase tracking-[0.2em] px-4 py-1 bg-[#4ADE80]/10 rounded-full self-center border border-[#4ADE80]/20">
                      Round {{ round.number }}
                    </div>
                    <div class="flex flex-wrap justify-center gap-3">
                      <div v-for="match in round.matches" :key="match.id" class="match-node relative z-10 w-full sm:w-[calc(50%-0.375rem)] lg:w-full xl:w-[calc(50%-0.375rem)] flex flex-col justify-center">
                        <div class="bg-[#111111]/60 border border-[#2A2A2A] rounded-lg flex flex-col transition-all overflow-hidden shadow hover:border-[#22C55E]/40"
                             :class="[match.is_completed ? 'opacity-80' : '']">
                          
                          <div class="flex items-center justify-between p-2 border-b border-[#2A2A2A]/50"
                               :class="[getWinnerStatusClass(match, 1, 'A')]">
                            <div class="flex items-center gap-2">
                              <div class="w-1.5 h-1.5 rounded-full bg-white/10" :class="match.team1 ? 'bg-[#22C55E]' : ''"></div>
                              <span class="font-bold truncate text-sm" :class="match.team1 ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] italic'">{{ match.team1?.name || 'TBD' }}</span>
                            </div>
                            <span class="font-title text-lg ml-2" :class="getWinnerScoreClass(match, 1, 'A')">{{ match.team1_score }}</span>
                          </div>
                          
                          <div class="flex items-center justify-between p-2"
                               :class="[getWinnerStatusClass(match, 2, 'A')]">
                            <div class="flex items-center gap-2">
                              <div class="w-1.5 h-1.5 rounded-full bg-white/10" :class="match.team2 ? 'bg-[#22C55E]' : ''"></div>
                              <span class="font-bold truncate text-sm" :class="match.team2 ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] italic'">{{ match.team2?.name || 'TBD' }}</span>
                            </div>
                            <span class="font-title text-lg ml-2" :class="getWinnerScoreClass(match, 2, 'A')">{{ match.team2_score }}</span>
                          </div>

                          <!-- Action Bar if not completed -->
                          <div v-if="!match.is_completed" class="p-1.5 bg-black/40 flex justify-center border-t border-[#2A2A2A]/50">
                            <button @click="startDraftForMatch(match, round.number, groupARounds)" 
                                    class="text-[9px] font-bold uppercase tracking-widest text-[#22C55E] hover:text-[#4ADE80] transition-colors py-1 px-3 rounded-full border border-[#22C55E]/30 hover:border-[#22C55E]/60 bg-[#22C55E]/5 cursor-pointer">
                              Draft
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Group B -->
              <div v-if="groupBRounds.length > 0" class="flex flex-col gap-8">
                <!-- Standings Card -->
                <div class="bg-[#111111]/80 backdrop-blur-xl border border-[#A855F7]/20 rounded-xl overflow-hidden shadow-2xl relative">
                  <div class="absolute top-0 right-0 w-48 h-48 bg-[#C084FC] opacity-[0.03] blur-[60px] pointer-events-none"></div>
                  <div class="p-5 border-b border-[#2A2A2A] bg-gradient-to-r from-[#A855F7]/10 to-transparent">
                    <h4 class="text-xl font-title text-[#C084FC] uppercase tracking-widest">Groupe Univers</h4>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                      <thead>
                        <tr class="text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-[#2A2A2A]">
                          <th class="px-6 py-4">Pos</th>
                          <th class="px-6 py-4">Team</th>
                          <th class="px-6 py-4 text-center">W</th>
                          <th class="px-6 py-4 text-center">L</th>
                          <th class="px-6 py-4 text-right">Pts</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-[#2A2A2A]/30">
                        <tr v-for="(team, index) in groupBStandings" :key="team.id" 
                            class="group transition-colors">
                          <td class="px-6 py-4">
                            <span class="w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold"
                                  :class="index < 2 ? 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/30' : 'text-white/30'">
                              {{ index + 1 }}
                            </span>
                          </td>
                          <td class="px-6 py-4">
                            <span class="font-bold text-[#F0FDF4] group-hover:text-[#A855F7] transition-colors uppercase tracking-wide text-sm">{{ team.name }}</span>
                          </td>
                          <td class="px-6 py-4 text-center text-sm font-medium">{{ team.wins || 0 }}</td>
                          <td class="px-6 py-4 text-center text-sm font-medium text-white/40">{{ team.losses || 0 }}</td>
                          <td class="px-6 py-4 text-right">
                            <span class="font-title text-[#A855F7] text-lg">{{ team.points || 0 }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Group B Matches -->
                <div v-if="!isGroupStageCompleted" class="flex flex-col gap-6 mt-4">
                  <div v-for="(round, rIndex) in groupBRounds" :key="'gb'+rIndex" class="flex flex-col gap-3">
                    <div class="text-[10px] font-bold text-[#C084FC] uppercase tracking-[0.2em] px-4 py-1 bg-[#A855F7]/10 rounded-full self-center border border-[#A855F7]/20">
                      Round {{ round.number }}
                    </div>
                    <div class="flex flex-wrap justify-center gap-3">
                      <div v-for="match in round.matches" :key="match.id" class="match-node relative z-10 w-full sm:w-[calc(50%-0.375rem)] lg:w-full xl:w-[calc(50%-0.375rem)] flex flex-col justify-center">
                        <div class="bg-[#111111]/60 border border-[#2A2A2A] rounded-lg flex flex-col transition-all overflow-hidden shadow hover:border-[#A855F7]/40"
                             :class="[match.is_completed ? 'opacity-80' : '']">
                          
                          <div class="flex items-center justify-between p-2 border-b border-[#2A2A2A]/50"
                               :class="[getWinnerStatusClass(match, 1, 'B')]">
                            <div class="flex items-center gap-2">
                              <div class="w-1.5 h-1.5 rounded-full bg-white/10" :class="match.team1 ? 'bg-[#A855F7]' : ''"></div>
                              <span class="font-bold truncate text-sm" :class="match.team1 ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] italic'">{{ match.team1?.name || 'TBD' }}</span>
                            </div>
                            <span class="font-title text-lg ml-2" :class="getWinnerScoreClass(match, 1, 'B')">{{ match.team1_score }}</span>
                          </div>
                          
                          <div class="flex items-center justify-between p-2"
                               :class="[getWinnerStatusClass(match, 2, 'B')]">
                            <div class="flex items-center gap-2">
                              <div class="w-1.5 h-1.5 rounded-full bg-white/10" :class="match.team2 ? 'bg-[#A855F7]' : ''"></div>
                              <span class="font-bold truncate text-sm" :class="match.team2 ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] italic'">{{ match.team2?.name || 'TBD' }}</span>
                            </div>
                            <span class="font-title text-lg ml-2" :class="getWinnerScoreClass(match, 2, 'B')">{{ match.team2_score }}</span>
                          </div>

                          <!-- Action Bar if not completed -->
                          <div v-if="!match.is_completed" class="p-1.5 bg-black/40 flex justify-center border-t border-[#2A2A2A]/50">
                            <button @click="startDraftForMatch(match, round.number, groupBRounds)" 
                                    class="text-[9px] font-bold uppercase tracking-widest text-[#A855F7] hover:text-[#C084FC] transition-colors py-1 px-3 rounded-full border border-[#A855F7]/30 hover:border-[#A855F7]/60 bg-[#A855F7]/5 cursor-pointer">
                              Draft
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- KNOCKOUT STAGE -->
          <div v-if="knockoutRounds.length > 0 && isGroupStageCompleted" 
               class="bracket-section relative animate-fade-in-up-delayed order-1 mb-24 mt-8"
               style="animation-delay: 0.4s;">
            <h3 class="text-4xl font-title mb-24 text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] uppercase tracking-[0.2em] text-center drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              Championship Bracket
            </h3>
            
            <div class="flex justify-center items-stretch gap-0 relative max-w-7xl mx-auto">
              <div v-for="(round, rIndex) in knockoutRounds" :key="'ko'+rIndex" 
                   class="flex flex-col justify-around relative z-10"
                   :style="{ width: '350px' }">
                
                <!-- Round Header -->
                <div class="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div class="px-6 py-2 bg-[#111111] border border-[#22C55E]/30 rounded-full shadow-lg">
                    <span class="text-[#22C55E] text-xs font-bold uppercase tracking-[0.3em]">
                      {{ round.number === 1 ? 'Semi-Finals' : round.number === 2 ? 'Grand Final' : `Round ${round.number}` }}
                    </span>
                  </div>
                </div>
                
                <div class="flex flex-col justify-around flex-1 relative py-8">
                  <div v-for="match in round.matches" :key="match.id" 
                       class="match-wrapper relative flex items-center w-full px-8">
                    
                    <!-- Match Card -->
                    <div class="w-full relative group">
                      <!-- Connector to next round (right side) -->
                      <div v-if="Number(rIndex) < knockoutRounds.length - 1" 
                           class="absolute top-1/2 -right-8 w-8 h-[2px] bg-gradient-to-r from-[#22C55E]/40 to-transparent z-0">
                        <div class="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#22C55E]/40 blur-[2px]"></div>
                      </div>
                      
                      <!-- Connector from previous round (left side) -->
                      <div v-if="Number(rIndex) > 0" 
                           class="absolute top-1/2 -left-8 w-8 h-[2px] bg-gradient-to-l from-[#22C55E]/40 to-transparent z-0">
                        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#22C55E]/40 blur-[2px]"></div>
                      </div>

                      <div class="bg-[#111111]/80 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col shadow-2xl transition-all relative z-10 overflow-hidden"
                           :class="[
                             match.is_completed 
                               ? 'border-[#22C55E]/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]' 
                               : 'hover:border-[#22C55E]/40 group-hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] group-hover:-translate-y-1',
                             round.number === 2 ? 'scale-110 border-[#22C55E]/50 shadow-[0_0_60px_rgba(34,197,94,0.25)]' : ''
                           ]">
                        
                        <div class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
                        
                        <!-- Top Team -->
                        <div class="flex items-center justify-between p-3 border-b border-white/5 bg-gradient-to-r from-transparent to-white/[0.01] transition-all relative z-10"
                             :class="[getWinnerStatusClass(match, 1), !match.is_completed ? 'hover:bg-white/[0.03]' : '']">
                          <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center font-title text-sm transition-transform group-hover:scale-110"
                                 :class="match.team1 ? 'text-[#22C55E] border-[#22C55E]/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'text-white/5'">
                              {{ match.team1?.name?.substring(0, 1) || '?' }}
                            </div>
                            <span class="font-bold truncate uppercase tracking-[0.1em]" :class="[match.team1 ? 'text-[#F0FDF4]' : 'text-white/10 italic', round.number === 2 ? 'text-lg' : 'text-sm']">
                              {{ match.team1?.name || 'TBD' }}
                            </span>
                          </div>
                          <div class="flex flex-col items-end">
                            <span class="font-title leading-none" :class="[getWinnerScoreClass(match, 1), round.number === 2 ? 'text-4xl' : 'text-2xl']">
                              {{ match.team1_score }}
                            </span>
                          </div>
                        </div>
                        
                        <!-- Bottom Team -->
                        <div class="flex items-center justify-between p-3 bg-gradient-to-r from-transparent to-white/[0.01] transition-all relative z-10"
                             :class="[getWinnerStatusClass(match, 2), !match.is_completed ? 'hover:bg-white/[0.03]' : '']">
                          <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center font-title text-sm transition-transform group-hover:scale-110"
                                 :class="match.team2 ? 'text-[#22C55E] border-[#22C55E]/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'text-white/5'">
                              {{ match.team2?.name?.substring(0, 1) || '?' }}
                            </div>
                            <span class="font-bold truncate uppercase tracking-[0.1em]" :class="[match.team2 ? 'text-[#F0FDF4]' : 'text-white/10 italic', round.number === 2 ? 'text-lg' : 'text-sm']">
                              {{ match.team2?.name || 'TBD' }}
                            </span>
                          </div>
                          <div class="flex flex-col items-end">
                            <span class="font-title leading-none" :class="[getWinnerScoreClass(match, 2), round.number === 2 ? 'text-4xl' : 'text-2xl']">
                              {{ match.team2_score }}
                            </span>
                          </div>
                        </div>

                        <!-- Initialize Draft Button -->
                        <div v-if="!match.is_completed && match.team1 && match.team2" 
                             class="p-3 bg-black/60 flex justify-center border-t border-white/5 relative z-10">
                          <button @click="startDraftForMatch(match, round.number, knockoutRounds)" 
                                  class="w-full text-[10px] font-black uppercase tracking-[0.25em] text-[#22C55E] hover:text-black hover:bg-[#22C55E] transition-all py-2 rounded-lg border border-[#22C55E]/40 cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            Enter Draft Phase
                          </button>
                        </div>

                        <!-- Crown for winner of the Final -->
                        <div v-if="match.is_completed && round.number === 2" class="absolute -top-6 -right-6 text-5xl drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] z-20 rotate-12 animate-pulse">
                          👑
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>

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
        <div class="absolute inset-0 bg-[#0B0F0C]/90 backdrop-blur-md -z-10"></div>

        <div class="bg-[#111111] border border-[#22C55E]/30 rounded-sm p-1 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,1)] relative before:absolute before:-inset-[1px] before:bg-gradient-to-b before:from-[#22C55E]/50 before:to-[#22C55E]/10 before:-z-10 before:rounded-sm">
          <div class="bg-[#111111] p-8 h-full w-full rounded-sm relative">
            <!-- Close Button -->
            <button @click="closeDraftModal" class="absolute top-4 right-4 text-[#A1A1AA] hover:text-[#22C55E] transition-colors p-2 z-20" cursor-pointer>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 class="text-3xl font-title mb-2 text-center text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E] tracking-wider uppercase">Initialiser la Draft</h2>
            
            <div class="flex justify-center items-center gap-4 mb-8 text-sm font-bold uppercase tracking-widest">
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
                  class="w-full py-4 bg-[#1A1A1A] hover:bg-[#282d33] border border-[#2A2A2A] hover:border-[#22C55E]/50 rounded-sm font-bold transition-all flex items-center justify-center gap-2 text-[#A1A1AA] hover:text-[#F0FDF4] uppercase tracking-widest text-xs"
                 cursor-pointer>
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
            
            <div v-else class="text-center py-8">
              <p class="text-red-400 font-bold uppercase tracking-widest text-xs mb-6">{{ message || 'Erreur lors de la génération de la draft' }}</p>
              <button @click="generateDraft" class="px-8 py-3 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#22C55E]/50 hover:bg-[#282d33] rounded-sm text-[#F0FDF4] font-bold uppercase tracking-widest text-xs transition-all" cursor-pointer>
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
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #0B0F0C;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #2A2A2A;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #22C55E;
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
}

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

.animate-fade-in-up-delayed {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
  opacity: 0;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { supabase } from '../lib/supabase';
import { fetchPlayoffMatches } from '../lib/queries';
import { subscribeToTable } from '../lib/realtime';

const matches = ref<any[]>([]);
const teams = ref<any[]>([]);
const loading = ref(true);
let subscription: any = null;

// Draft related state
const showDraftModal = ref(false);
const currentMatchId = ref("");
const blueName = ref("");
const redName = ref("");
const apiKey = ref("DRAFTER-59605981-E026-439E-BAFC-3C532CF18FB1");
const drafting = ref(false);
const draftUrl = ref("");
const draftId = ref("");
const syncing = ref(false);
const message = ref("");
const linkCopied = ref(false);
const globalError = ref("");
let syncInterval: any = null;

const showError = (msg: string) => {
  globalError.value = msg;
  setTimeout(() => {
    if (globalError.value === msg) globalError.value = "";
  }, 5000);
};

const loadMatches = async () => {
  const { data: matchesData } = await fetchPlayoffMatches();
  if (matchesData) matches.value = matchesData;
  
  const { data: teamsData } = await supabase.from('teams').select('*');
  if (teamsData) teams.value = teamsData;
  
  loading.value = false;
};

onMounted(() => {
  loadMatches();
  subscription = subscribeToTable('playoff_matches', () => {
    // When a match updates, reload all matches to get full team objects populated
    loadMatches();
  });
});

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe();
  }
  if (syncInterval) {
    clearInterval(syncInterval);
  }
});

const startDraftForMatch = async (match: any, roundNumber?: number, allRounds?: any[]) => {
  if (!match.team1 || !match.team2) return;
  if (match.is_completed) {
    showError("Ce match est déjà terminé. Impossible de lancer une nouvelle draft.");
    return;
  }

  // Vérifier si les rounds précédents sont terminés
  if (roundNumber && allRounds && roundNumber > 1) {
    const previousRounds = allRounds.filter(r => r.number < roundNumber);
    const allPreviousMatchesCompleted = previousRounds.every(r => 
      r.matches.every((m: any) => m.is_completed)
    );
    
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

  currentMatchId.value = match.id;
  blueName.value = match.team1.name;
  redName.value = match.team2.name;
  showDraftModal.value = true;
  generateDraft();
};

const closeDraftModal = () => {
  showDraftModal.value = false;
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
      message.value = "Draft récupérée !";
      
      if (syncInterval) clearInterval(syncInterval);
      syncInterval = setInterval(() => {
        syncDraftPicks();
      }, 5000);
      return;
    }

    message.value = "Initialisation de la draft...";

    const draftCacheKey = `draft_${currentMatchId.value}_${blueName.value}_${redName.value}`;
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
      }, 5000);
      return;
    }
    
    const { data, error: funcError } = await supabase.functions.invoke("generate-draft", {
      body: {
        matchId: currentMatchId.value,
        blueName: blueName.value,
        redName: redName.value,
        apiKey: apiKey.value
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
      }, 5000);
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
  
  try {
    syncing.value = true;
    
    const { data, error: funcError } = await supabase.functions.invoke("sync-draft", {
      body: {
        draftId: draftId.value,
        apiKey: apiKey.value
      }
    });

    if (funcError) return;

    // The Edge Function now handles updating the database directly when status is FINISHED
    if (data?.status === "FINISHED") {
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
      message.value = "Draft terminée ! Champions désactivés.";
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

const getWinnerStatusClass = (match: any, teamNum: 1 | 2, group: 'A' | 'B' | 'KO' = 'KO') => {
  if (!match.is_completed) return '';
  const isWinner = teamNum === 1 ? match.team1_score > match.team2_score : match.team2_score > match.team1_score;
  if (!isWinner) return 'opacity-30 grayscale';
  
  if (group === 'A') return 'bg-[#4ADE80]/10 border-r-4 border-r-[#4ADE80]';
  if (group === 'B') return 'bg-[#A855F7]/10 border-r-4 border-r-[#A855F7]';
  return 'bg-[#22C55E]/10 border-r-4 border-r-[#22C55E]';
};

const getWinnerScoreClass = (match: any, teamNum: 1 | 2, group: 'A' | 'B' | 'KO' = 'KO') => {
  if (!match.is_completed) return 'text-white/20';
  const isWinner = teamNum === 1 ? match.team1_score > match.team2_score : match.team2_score > match.team1_score;
  if (!isWinner) return 'text-white/10';
  
  if (group === 'A') return 'text-[#4ADE80] drop-shadow-[0_0_10px_rgba(74,222,128,0.4)]';
  if (group === 'B') return 'text-[#A855F7] drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]';
  return 'text-[#22C55E] drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]';
};

// Group matches by stage and round
const groupedMatches = computed(() => {
  const groups: Record<string, any> = {
    group_a: { name: 'group_a', rounds: {} },
    group_b: { name: 'group_b', rounds: {} },
    knockout: { name: 'knockout', rounds: {} }
  };

  for (const m of matches.value) {
    const b = m.stage;
    if (!groups[b]) groups[b] = { name: b, rounds: {} };
    if (!groups[b].rounds[m.round]) {
      groups[b].rounds[m.round] = { number: m.round, matches: [] };
    }
    groups[b].rounds[m.round].matches.push(m);
  }

  return Object.values(groups)
    .filter(g => Object.keys(g.rounds).length > 0)
    .map(g => ({
      ...g,
      rounds: Object.values(g.rounds).sort((a: any, b: any) => a.number - b.number)
    }));
});

const knockoutRounds = computed(() => {
  const group = groupedMatches.value.find((g: any) => g.name === 'knockout');
  return group ? group.rounds : [];
});

const groupARounds = computed(() => {
  const group = groupedMatches.value.find((g: any) => g.name === 'group_a');
  return group ? group.rounds : [];
});

const groupBRounds = computed(() => {
  const group = groupedMatches.value.find((g: any) => g.name === 'group_b');
  return group ? group.rounds : [];
});

const groupAStandings = computed(() => {
  const teamStats: Record<string, any> = {};
  
  groupARounds.value.forEach((r: any) => r.matches.forEach((m: any) => {
    if (m.team1_id) {
      if (!teamStats[m.team1_id]) teamStats[m.team1_id] = { id: m.team1_id, name: m.team1?.name || 'TBD', wins: 0, losses: 0, points: 0 };
    }
    if (m.team2_id) {
      if (!teamStats[m.team2_id]) teamStats[m.team2_id] = { id: m.team2_id, name: m.team2?.name || 'TBD', wins: 0, losses: 0, points: 0 };
    }

    if (m.is_completed) {
      const s1 = Number(m.team1_score) || 0;
      const s2 = Number(m.team2_score) || 0;
      if (s1 > s2) {
        teamStats[m.team1_id].wins++;
        teamStats[m.team1_id].points += 1;
        teamStats[m.team2_id].losses++;
      } else if (s2 > s1) {
        teamStats[m.team2_id].wins++;
        teamStats[m.team2_id].points += 1;
        teamStats[m.team1_id].losses++;
      }
    }
  }));
  
  return Object.values(teamStats)
    .sort((a, b) => (b.points || 0) - (a.points || 0) || (b.wins || 0) - (a.wins || 0));
});

const groupBStandings = computed(() => {
  const teamStats: Record<string, any> = {};
  
  groupBRounds.value.forEach((r: any) => r.matches.forEach((m: any) => {
    if (m.team1_id) {
      if (!teamStats[m.team1_id]) teamStats[m.team1_id] = { id: m.team1_id, name: m.team1?.name || 'TBD', wins: 0, losses: 0, points: 0 };
    }
    if (m.team2_id) {
      if (!teamStats[m.team2_id]) teamStats[m.team2_id] = { id: m.team2_id, name: m.team2?.name || 'TBD', wins: 0, losses: 0, points: 0 };
    }

    if (m.is_completed) {
      const s1 = Number(m.team1_score) || 0;
      const s2 = Number(m.team2_score) || 0;
      if (s1 > s2) {
        teamStats[m.team1_id].wins++;
        teamStats[m.team1_id].points += 1;
        teamStats[m.team2_id].losses++;
      } else if (s2 > s1) {
        teamStats[m.team2_id].wins++;
        teamStats[m.team2_id].points += 1;
        teamStats[m.team1_id].losses++;
      }
    }
  }));
  
  return Object.values(teamStats)
    .sort((a, b) => (b.points || 0) - (a.points || 0) || (b.wins || 0) - (a.wins || 0));
});

const isGroupStageCompleted = computed(() => {
  const allGroupMatches = [
    ...groupARounds.value.flatMap((r: any) => r.matches),
    ...groupBRounds.value.flatMap((r: any) => r.matches)
  ];
  if (allGroupMatches.length === 0) return true;
  return allGroupMatches.every((m: any) => m.is_completed);
});

</script>