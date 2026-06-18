<template>
  <div class="fixed inset-0 bg-[#050505] overflow-hidden font-sans text-mcu-text">
    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4">
      <div v-if="toast" class="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4 pointer-events-none">
        <div
          class="pointer-events-auto bg-black/80 rounded-xl p-4 flex items-center gap-4 backdrop-blur-2xl border"
          :class="
            toast.type === 'success'
              ? 'border-mcu-primary/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
              : 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
          ">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            :class="toast.type === 'success' ? 'bg-mcu-primary/20 text-mcu-primary' : 'bg-red-500/20 text-red-500'">
            <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="font-title tracking-widest text-sm"
              :class="toast.type === 'success' ? 'text-mcu-primary' : 'text-red-500'">
              {{ toast.type === 'success' ? 'Succès' : 'Erreur' }}
            </p>
            <p class="text-white/90 text-sm break-words">{{ toast.message }}</p>
          </div>
          <button type="button" @click="dismissToast" class="text-white/50 hover:text-white transition-colors shrink-0 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <div
      class="absolute left-1/2 top-1/2 h-[1080px] w-[1920px] overflow-hidden flex flex-col transform-gpu origin-center"
      :style="{ transform: 'translate(-50%, -50%) scale(' + scale + ')' }"
    >
      <!-- Premium Animated Background -->
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      <!-- Dynamic Light Orbs -->
      <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-mcu-primary/20 blur-[180px] rounded-full pointer-events-none animate-pulse-slow"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[180px] rounded-full pointer-events-none animate-pulse-slow-delayed"></div>
      <div class="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow"></div>
      
      <!-- Vignette -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] pointer-events-none z-0 opacity-90"></div>

      <div class="flex-1 flex w-full h-full p-8 gap-8 z-10">
        
        <!-- Left Column (3 Teams) -->
        <div class="w-[440px] flex flex-col gap-6 min-h-0">
          <div v-for="(team, index) in leftTeams" :key="team.id" 
               class="flex-1 min-h-0 relative group bg-black/40 backdrop-blur-2xl rounded-2xl flex flex-col transition-all duration-500 ease-out border border-white/5 shadow-2xl overflow-hidden"
               :style="{'animation-delay': `${index * 150}ms`}">
            
            <!-- Team Color Top Bar -->
            <div class="absolute top-0 left-0 right-0 h-1 opacity-80" :style="{ backgroundColor: team.color, boxShadow: `0 0 10px ${team.color}` }"></div>
            
            <!-- Team Header -->
            <div class="flex justify-between items-center p-4 pb-3 bg-gradient-to-b from-white/[0.03] to-transparent border-b border-white/5">
              <div class="flex items-center gap-3 min-w-0">
                <TeamLogo
                  :name="team.name"
                  wrapper-class="w-10 h-10 rounded-xl border border-white/10 bg-black/60 flex items-center justify-center shrink-0 overflow-hidden shadow-lg"
                  initials-class="font-title text-sm uppercase text-white"
                  img-class="w-full h-full object-contain p-1"
                />
                <h2 class="text-2xl font-title uppercase tracking-[0.08em] text-white drop-shadow-md truncate max-w-[180px]" :style="{ textShadow: `0 0 12px ${team.color}80` }">{{ team.name }}</h2>
              </div>
              <div class="flex items-center gap-2" title="Joueurs volés à cette équipe">
                <div class="px-2 py-1 rounded-md bg-black/50 border border-white/10 text-sm font-bold flex items-center gap-1 shadow-inner">
                  <span :class="getLostPlayersCount(team.id) >= 2 ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'text-white/80'">{{ getLostPlayersCount(team.id) }}</span>
                  <span class="text-white/40 text-xs">/2</span>
                </div>
              </div>
            </div>
            
            <!-- Roles -->
            <div class="flex-1 min-h-0 flex flex-col gap-2 p-3 pt-2">
              <div v-for="role in roles" :key="role" 
                   class="h-11 flex-none rounded-xl flex items-center px-3 gap-3 transition-all relative overflow-hidden group/role cursor-pointer border"
                   :class="[
                     getPlayer(team, role) 
                       ? 'bg-gradient-to-r from-black/80 to-black/40 border-white/10 hover:border-white/30 hover:from-white/5 hover:to-transparent' 
                       : 'bg-black/20 border-white/5 border-dashed opacity-60',
                     selectedPlayer?.id === getPlayer(team, role)?.id && getPlayer(team, role) 
                       ? '!border-mcu-primary !from-mcu-primary/20 !to-black/40 shadow-[inset_0_0_20px_rgba(34,197,94,0.15)]' 
                       : ''
                   ]"
                   @click="selectPlayer(getPlayer(team, role))">
                
                <!-- Role Indicator Line -->
                <div v-if="getPlayer(team, role)" class="absolute left-0 top-0 bottom-0 w-1" 
                     :class="[
                       isLocked(getPlayer(team, role)?.id) ? 'bg-mcu-primary shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 
                       isStolen(getPlayer(team, role)?.id) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 
                       'bg-white/20'
                     ]">
                </div>

                <div class="w-8 h-8 flex items-center justify-center shrink-0 ml-1">
                  <img :src="getRoleIcon(role)" class="w-5 h-5 object-contain" :class="getPlayer(team, role) ? 'opacity-100 drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]' : 'opacity-30 grayscale'" />
                </div>
                
                <div class="flex-1 min-w-0 relative z-10">
                  <template v-if="getPlayer(team, role)">
                    <div class="flex items-center justify-between gap-3 min-w-0">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <img :src="getPlayer(team, role)?.avatarUrl" alt="" class="w-7 h-7 rounded-lg border border-white/20 bg-black/80 shrink-0 shadow-md" />
                        <div class="font-bold text-white/90 text-[15px] uppercase tracking-wide truncate group-hover/role:text-white transition-colors"
                             :class="{ 'line-through opacity-40': isStolen(getPlayer(team, role)?.id) }">
                          {{ getPlayer(team, role)?.name }}
                        </div>
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        <div v-if="isLocked(getPlayer(team, role)?.id)" class="text-mcu-primary drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" title="Lock">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm-1 5h8v8H8v-8z"/>
                          </svg>
                        </div>
                        <div v-if="isStolen(getPlayer(team, role)?.id)" class="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/30 uppercase tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                          Volé
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="text-white/30 font-title text-sm tracking-widest uppercase ml-1">Emplacement vide</div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Center Stage -->
        <div class="flex-1 flex flex-col relative z-20">
          
          <!-- Header Logo -->
          <div class="flex justify-center mb-6 z-50">
            <img :src="mcuLogo" alt="MCU Logo" class="h-20 opacity-100 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-[float_6s_ease-in-out_infinite]" />
          </div>

          <!-- Top Broadcast Bar -->
          <div class="h-14 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl mb-8 flex items-center justify-between px-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div class="absolute top-0 left-[-100%] w-1/2 h-[1px] bg-gradient-to-r from-transparent via-mcu-primary to-transparent group-hover:animate-[slideRight_2s_ease-in-out_infinite]"></div>
            <div class="absolute bottom-0 left-[-100%] w-1/2 h-[1px] bg-gradient-to-r from-transparent via-mcu-primary to-transparent group-hover:animate-[slideRight_2s_ease-in-out_infinite_0.5s]"></div>
            
            <div class="w-24"></div> <!-- Spacer for centering -->
            <div class="text-3xl font-title uppercase tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] flex items-center gap-4">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
              Phase de Mercato
            </div>
            <div class="w-24 flex justify-end relative z-50">
              <button @click="resetMercatoState" class="px-4 py-1.5 rounded-lg border border-white/10 bg-black/50 text-white/50 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all text-xs font-title uppercase tracking-widest cursor-pointer">
                Reset
              </button>
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="flex-1 flex items-center justify-center relative pb-12">
            
            <!-- Premium Player Card -->
            <div v-if="selectedPlayer" class="w-[600px] bg-black/80 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative transform transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_30px_100px_rgba(34,197,94,0.15)] hover:border-white/20">
              
              <!-- Card Header / Avatar Area -->
              <div class="h-[320px] bg-gradient-to-b from-black/40 to-black relative border-b border-white/10 overflow-hidden flex items-end justify-center">
                <!-- Background Team Logo Watermark -->
                <div class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <TeamLogo
                    :name="getTeamForPlayer(selectedPlayer.id)?.name || ''"
                    wrapper-class="w-96 h-96"
                    initials-class="font-title text-9xl uppercase text-white"
                    img-class="w-full h-full object-contain grayscale"
                  />
                </div>
                
                <!-- Glowing Backdrop for Avatar -->
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-mcu-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

                <!-- Big Avatar -->
                <div class="relative z-20 w-48 h-48 mb-6">
                  <img
                    :src="selectedPlayer.avatarUrl"
                    alt=""
                    class="w-full h-full object-cover scale-[1.15] drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                  />
                </div>

                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-30"></div>

                <!-- Header content -->
                <div class="absolute bottom-6 left-8 right-8 z-40 flex justify-between items-end gap-4">
                  <div class="min-w-0">
                    <div class="flex items-center gap-3 mb-1">
                      <TeamLogo
                        :name="getTeamForPlayer(selectedPlayer.id)?.name || ''"
                        wrapper-class="w-6 h-6 rounded border border-white/20 bg-black/80 flex items-center justify-center shrink-0"
                        initials-class="font-title text-[10px] uppercase text-white"
                        img-class="w-full h-full object-contain p-0.5"
                      />
                      <div class="text-mcu-primary font-bold text-sm uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">{{ getTeamForPlayer(selectedPlayer.id)?.name }}</div>
                    </div>
                    <h3 class="text-5xl font-title tracking-wider text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] truncate">{{ selectedPlayer.name }}</h3>
                  </div>

                  <div class="shrink-0 flex items-end">
                    <div
                      class="w-14 h-14 rounded-2xl bg-black/80 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                      title="Rôle"
                    >
                      <img :src="getRoleIcon(selectedPlayer.role)" class="w-8 h-8 opacity-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" alt="" />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Card Body -->
              <div class="flex-1 flex flex-col p-8 relative bg-gradient-to-b from-black to-[#0a0a0a]">
                <div class="relative z-10 flex flex-col gap-8 w-full">
                  
                  <!-- Action: Lock -->
                  <div class="flex gap-4 w-full">
                    <button 
                      @click="toggleLock(selectedPlayer.id)"
                      class="flex-1 py-5 rounded-2xl border font-title text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                      :class="isLocked(selectedPlayer.id) ? 'bg-mcu-primary/10 border-mcu-primary text-mcu-primary shadow-[0_0_30px_rgba(34,197,94,0.2)]' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'"
                    >
                      <div v-if="isLocked(selectedPlayer.id)" class="absolute inset-0 bg-gradient-to-r from-transparent via-mcu-primary/10 to-transparent animate-[slideRight_2s_ease-in-out_infinite]"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path v-if="isLocked(selectedPlayer.id)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      <span class="relative z-10">{{ isLocked(selectedPlayer.id) ? 'Joueur Verrouillé' : 'Verrouiller le Joueur' }}</span>
                    </button>
                  </div>
                  
                  <div class="flex items-center gap-4">
                    <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <div class="font-title text-white/30 tracking-widest text-sm uppercase">Action</div>
                    <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                  
                  <!-- Action: Swap -->
                  <div class="flex flex-col gap-3">
                    <h4 class="text-white/80 font-title uppercase tracking-widest text-lg">Échanger avec :</h4>
                    <div class="flex gap-3 items-stretch h-14">
                      <select v-model="swapTargetId" class="flex-1 bg-black/60 text-white text-base px-4 rounded-xl border border-white/10 focus:border-mcu-primary focus:ring-1 focus:ring-mcu-primary/50 focus:outline-none transition-all appearance-none cursor-pointer">
                        <option value="" class="text-white/50">Sélectionner une cible...</option>
                        <option v-for="p in availableSwapTargets" :key="p.id" :value="p.id" :disabled="isLocked(p.id) || isStolen(p.id) || getLostPlayersCount(getTeamForPlayer(p.id)?.id || '') >= 2" class="bg-[#111]">
                          {{ p.name }} ({{ getTeamForPlayer(p.id)?.name }})
                          {{ isLocked(p.id) ? ' - 🔒' : '' }}
                          {{ isStolen(p.id) ? ' - 🛑' : '' }}
                          {{ getLostPlayersCount(getTeamForPlayer(p.id)?.id || '') >= 2 ? ' - 🛡️' : '' }}
                        </option>
                      </select>
                      <button 
                        @click="executeSwap"
                        :disabled="!swapTargetId || isSwapping"
                        class="px-8 rounded-xl font-title text-xl uppercase tracking-widest transition-all border flex items-center justify-center min-w-[140px]"
                        :class="(!swapTargetId || isSwapping) ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed' : 'bg-mcu-primary text-black border-mcu-primary hover:bg-mcu-accent hover:border-mcu-accent shadow-[0_0_20px_rgba(34,197,94,0.4)]'"
                      >
                        {{ isSwapping ? '...' : 'Swap' }}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-else class="text-white/20 font-title text-3xl uppercase tracking-[0.2em] flex flex-col items-center gap-6 animate-pulse">
              <div class="w-24 h-24 rounded-full border-2 border-white/10 border-dashed flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              En attente de sélection
            </div>

          </div>
        </div>

        <!-- Right Column (3 Teams) -->
        <div class="w-[440px] flex flex-col gap-6 relative z-20 min-h-0">
          <div v-for="(team, index) in rightTeams" :key="team.id" 
               class="flex-1 min-h-0 relative group bg-black/40 backdrop-blur-2xl rounded-2xl flex flex-col transition-all duration-500 ease-out border border-white/5 shadow-2xl overflow-hidden"
               :style="{'animation-delay': `${index * 150}ms`}">
            
            <!-- Team Color Top Bar -->
            <div class="absolute top-0 left-0 right-0 h-1 opacity-80" :style="{ backgroundColor: team.color, boxShadow: `0 0 10px ${team.color}` }"></div>
            
            <!-- Team Header -->
            <div class="flex justify-between items-center p-4 pb-3 bg-gradient-to-b from-white/[0.03] to-transparent border-b border-white/5">
              <div class="flex items-center gap-3 min-w-0">
                <TeamLogo
                  :name="team.name"
                  wrapper-class="w-10 h-10 rounded-xl border border-white/10 bg-black/60 flex items-center justify-center shrink-0 overflow-hidden shadow-lg"
                  initials-class="font-title text-sm uppercase text-white"
                  img-class="w-full h-full object-contain p-1"
                />
                <h2 class="text-2xl font-title uppercase tracking-[0.08em] text-white drop-shadow-md truncate max-w-[180px]" :style="{ textShadow: `0 0 12px ${team.color}80` }">{{ team.name }}</h2>
              </div>
              <div class="flex items-center gap-2" title="Joueurs volés à cette équipe">
                <div class="px-2 py-1 rounded-md bg-black/50 border border-white/10 text-sm font-bold flex items-center gap-1 shadow-inner">
                  <span :class="getLostPlayersCount(team.id) >= 2 ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'text-white/80'">{{ getLostPlayersCount(team.id) }}</span>
                  <span class="text-white/40 text-xs">/2</span>
                </div>
              </div>
            </div>
            
            <!-- Roles -->
            <div class="flex-1 min-h-0 flex flex-col gap-2 p-3 pt-2">
              <div v-for="role in roles" :key="role" 
                   class="h-11 flex-none rounded-xl flex items-center px-3 gap-3 transition-all relative overflow-hidden group/role cursor-pointer border"
                   :class="[
                     getPlayer(team, role) 
                       ? 'bg-gradient-to-r from-black/80 to-black/40 border-white/10 hover:border-white/30 hover:from-white/5 hover:to-transparent' 
                       : 'bg-black/20 border-white/5 border-dashed opacity-60',
                     selectedPlayer?.id === getPlayer(team, role)?.id && getPlayer(team, role) 
                       ? '!border-mcu-primary !from-mcu-primary/20 !to-black/40 shadow-[inset_0_0_20px_rgba(34,197,94,0.15)]' 
                       : ''
                   ]"
                   @click="selectPlayer(getPlayer(team, role))">
                
                <!-- Role Indicator Line -->
                <div v-if="getPlayer(team, role)" class="absolute left-0 top-0 bottom-0 w-1" 
                     :class="[
                       isLocked(getPlayer(team, role)?.id) ? 'bg-mcu-primary shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 
                       isStolen(getPlayer(team, role)?.id) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 
                       'bg-white/20'
                     ]">
                </div>

                <div class="w-8 h-8 flex items-center justify-center shrink-0 ml-1">
                  <img :src="getRoleIcon(role)" class="w-5 h-5 object-contain" :class="getPlayer(team, role) ? 'opacity-100 drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]' : 'opacity-30 grayscale'" />
                </div>
                
                <div class="flex-1 min-w-0 relative z-10">
                  <template v-if="getPlayer(team, role)">
                    <div class="flex items-center justify-between gap-3 min-w-0">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <img :src="getPlayer(team, role)?.avatarUrl" alt="" class="w-7 h-7 rounded-lg border border-white/20 bg-black/80 shrink-0 shadow-md" />
                        <div class="font-bold text-white/90 text-[15px] uppercase tracking-wide truncate group-hover/role:text-white transition-colors"
                             :class="{ 'line-through opacity-40': isStolen(getPlayer(team, role)?.id) }">
                          {{ getPlayer(team, role)?.name }}
                        </div>
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        <div v-if="isLocked(getPlayer(team, role)?.id)" class="text-mcu-primary drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" title="Lock">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm-1 5h8v8H8v-8z"/>
                          </svg>
                        </div>
                        <div v-if="isStolen(getPlayer(team, role)?.id)" class="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/30 uppercase tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                          Volé
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="text-white/30 font-title text-sm tracking-widest uppercase ml-1">Emplacement vide</div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { dicebearPortraitUrl } from '../../lib/dicebear';
import { fetchPlayerAvatarConfigsByIds } from '../../services/playerAvatarService';
import TeamLogo from '../../components/TeamLogo.vue';

const scale = ref(1);

const updateScale = () => {
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;
  const scaleX = winWidth / 1920;
  const scaleY = winHeight / 1080;
  scale.value = Math.min(scaleX, scaleY);
};

// Assets Import
import mcuLogo from '../../assets/mcu_logo.png';
import topIcon from '../../assets/top.png';
import jglIcon from '../../assets/jgl.png';
import midIcon from '../../assets/mid.png';
import adcIcon from '../../assets/adc.png';
import supIcon from '../../assets/support.png';

const roles = ['TOP', 'JGL', 'MID', 'ADC', 'SUP'];

const getRoleIcon = (role: string) => {
  const map: Record<string, string> = {
    'TOP': topIcon,
    'JGL': jglIcon,
    'MID': midIcon,
    'ADC': adcIcon,
    'SUP': supIcon
  };
  return map[role] || midIcon;
};

interface Player {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

interface Team {
  id: string;
  name: string;
  color: string;
  players: Player[];
}

type DbTeam = Database['public']['Tables']['teams']['Row'];
type DbPlayer = Database['public']['Tables']['players']['Row'];

type AdminToast = { message: string; type: 'success' | 'error' };
const toast = ref<AdminToast | null>(null);
let toastHideTimer: ReturnType<typeof setTimeout> | null = null;

const dismissToast = () => {
  if (toastHideTimer) {
    clearTimeout(toastHideTimer);
    toastHideTimer = null;
  }
  toast.value = null;
};

const showToast = (message: string, type: 'success' | 'error') => {
  if (toastHideTimer) {
    clearTimeout(toastHideTimer);
    toastHideTimer = null;
  }
  toast.value = { message, type };
  toastHideTimer = setTimeout(() => {
    toastHideTimer = null;
    toast.value = null;
  }, 5000);
};

const teamPalette = ['#0036FF', '#F3ED00', '#FF3366', '#FF5900', '#EE1C25', '#E4A853', '#22C55E', '#8B5CF6'];

const dbTeams = ref<DbTeam[]>([]);
const dbPlayers = ref<DbPlayer[]>([]);
const avatarUrlByPlayerId = ref<Map<string, string>>(new Map());

const allTeams = ref<Team[]>([]);
const leftTeams = computed(() => allTeams.value.slice(0, 3));
const rightTeams = computed(() => allTeams.value.slice(3, 6));

const getPlayer = (team: Team, role: string) => {
  return team.players.find(p => p.role === role);
};

const roleToOverlayRole = (raw: string | null | undefined): string => {
  const v = (raw ?? '').toLowerCase().trim();
  if (v === 'top') return 'TOP';
  if (v === 'jungle' || v === 'jgl') return 'JGL';
  if (v === 'mid') return 'MID';
  if (v === 'adc') return 'ADC';
  if (v === 'support' || v === 'sup') return 'SUP';
  return '';
};

// --- Local State for Mercato ---
const lockedPlayers = ref<Set<string>>(new Set());
const stolenPlayers = ref<Set<string>>(new Set());
const lostPlayersCount = ref<Record<string, number>>({});

const loadLocalState = () => {
  try {
    const locked = localStorage.getItem('mcu_mercato_locked');
    if (locked) lockedPlayers.value = new Set(JSON.parse(locked));
    
    const stolen = localStorage.getItem('mcu_mercato_stolen');
    if (stolen) stolenPlayers.value = new Set(JSON.parse(stolen));
    
    const lost = localStorage.getItem('mcu_mercato_lost_count');
    if (lost) lostPlayersCount.value = JSON.parse(lost);
  } catch (e) {
    console.error('Failed to load local state', e);
  }
};

const saveLocalState = () => {
  localStorage.setItem('mcu_mercato_locked', JSON.stringify(Array.from(lockedPlayers.value)));
  localStorage.setItem('mcu_mercato_stolen', JSON.stringify(Array.from(stolenPlayers.value)));
  localStorage.setItem('mcu_mercato_lost_count', JSON.stringify(lostPlayersCount.value));
};

const isLocked = (playerId?: string) => playerId ? lockedPlayers.value.has(playerId) : false;
const isStolen = (playerId?: string) => playerId ? stolenPlayers.value.has(playerId) : false;
const getLostPlayersCount = (teamId: string) => lostPlayersCount.value[teamId] || 0;

const toggleLock = (playerId: string) => {
  if (lockedPlayers.value.has(playerId)) {
    lockedPlayers.value.delete(playerId);
  } else {
    lockedPlayers.value.add(playerId);
  }
  saveLocalState();
};

const resetMercatoState = () => {
  if (confirm('Voulez-vous vraiment réinitialiser les locks, les vols et les compteurs ?')) {
    lockedPlayers.value.clear();
    stolenPlayers.value.clear();
    lostPlayersCount.value = {};
    saveLocalState();
    showToast('État du mercato réinitialisé.', 'success');
  }
};

// --- Center Panel Logic ---
const selectedPlayer = ref<Player | null>(null);
const swapTargetId = ref<string>('');
const isSwapping = ref(false);

const selectPlayer = (player: Player | undefined) => {
  if (!player) return;
  selectedPlayer.value = player;
  swapTargetId.value = '';
};

const getTeamForPlayer = (playerId: string) => {
  return allTeams.value.find(t => t.players.some(p => p.id === playerId));
};

const availableSwapTargets = computed(() => {
  if (!selectedPlayer.value) return [];
  const currentTeam = getTeamForPlayer(selectedPlayer.value.id);
  if (!currentTeam) return [];
  
  const targets: Player[] = [];
  for (const team of allTeams.value) {
    if (team.id === currentTeam.id) continue; // Not same team
    const p = getPlayer(team, selectedPlayer.value.role);
    if (p) targets.push(p);
  }
  return targets;
});

const executeSwap = async () => {
  if (!selectedPlayer.value || !swapTargetId.value) return;
  
  const p1 = selectedPlayer.value;
  const p2 = allTeams.value.flatMap(t => t.players).find(p => p.id === swapTargetId.value);
  
  if (!p2) return;
  
  const team1 = getTeamForPlayer(p1.id);
  const team2 = getTeamForPlayer(p2.id);
  
  if (!team1 || !team2) return;
  
  isSwapping.value = true;
  try {
    // Update DB
    const { error: err1 } = await supabase
      .from('players')
      .update({ team_id: team2.id })
      .eq('id', p1.id);
      
    if (err1) throw err1;
    
    const { error: err2 } = await supabase
      .from('players')
      .update({ team_id: team1.id })
      .eq('id', p2.id);
      
    if (err2) throw err2;
    
    // Mark target player as stolen
    stolenPlayers.value.add(p2.id);
    
    // Increment lost players counter for the victim team
    const currentLost = lostPlayersCount.value[team2.id] || 0;
    lostPlayersCount.value[team2.id] = currentLost + 1;
    
    saveLocalState();
    
    showToast('Échange réussi !', 'success');
    swapTargetId.value = '';
    await loadData();
  } catch (e: any) {
    showToast('Erreur lors de l\'échange : ' + e.message, 'error');
  } finally {
    isSwapping.value = false;
  }
};

// --- Data Loading ---
let playersChannel: ReturnType<typeof supabase.channel> | null = null;

const loadData = async () => {
  const [teamsRes, playersRes] = await Promise.all([
    supabase.from('teams').select('*').order('name', { ascending: true }),
    supabase.from('players').select('id,pseudo,riot_id,participation_type,primary_role,team_id').order('pseudo', { ascending: true })
  ]);
  
  if (teamsRes.error) throw teamsRes.error;
  dbTeams.value = (teamsRes.data ?? []) as DbTeam[];

  if (playersRes.error) throw playersRes.error;
  dbPlayers.value = (playersRes.data ?? []) as DbPlayer[];

  // Avatars
  try {
    const ids = dbPlayers.value.map((p) => p.id);
    const rows = await fetchPlayerAvatarConfigsByIds(ids);
    const byPid = new Map(rows.map((r) => [r.player_id, r]));
    const map = new Map<string, string>();
    for (const p of dbPlayers.value) {
      const name = p.pseudo || p.riot_id || 'Joueur';
      map.set(p.id, dicebearPortraitUrl(byPid.get(p.id), name));
    }
    avatarUrlByPlayerId.value = map;
  } catch (_e) {
    const map = new Map<string, string>();
    for (const p of dbPlayers.value) {
      const name = p.pseudo || p.riot_id || 'Joueur';
      map.set(p.id, dicebearPortraitUrl(undefined, name));
    }
    avatarUrlByPlayerId.value = map;
  }

  const playersByTeamId = new Map<string, DbPlayer[]>();
  for (const p of dbPlayers.value.filter((p) => p.participation_type?.toLowerCase() === 'joueur')) {
    const tid = p.team_id;
    if (!tid) continue;
    const arr = playersByTeamId.get(tid) ?? [];
    arr.push(p);
    playersByTeamId.set(tid, arr);
  }

  const nextTeams: Team[] = dbTeams.value.map((t, idx) => {
    const assigned = playersByTeamId.get(t.id) ?? [];
    const teamPlayers: Player[] = assigned
      .map((p) => {
        const name = p.pseudo || p.riot_id || 'Joueur';
        const role = roleToOverlayRole(p.primary_role);
        return {
          id: p.id,
          name,
          role,
          avatarUrl: avatarUrlByPlayerId.value.get(p.id) ?? dicebearPortraitUrl(undefined, name),
        };
      })
      .filter((p) => !!p.role);

    return {
      id: t.id,
      name: t.name,
      color: teamPalette[idx % teamPalette.length],
      players: teamPlayers,
    };
  });

  allTeams.value = nextTeams;
  
  // Update selected player reference if it exists
  if (selectedPlayer.value) {
    const updatedPlayer = allTeams.value.flatMap(t => t.players).find(p => p.id === selectedPlayer.value?.id);
    if (updatedPlayer) {
      selectedPlayer.value = updatedPlayer;
    } else {
      selectedPlayer.value = null;
    }
  }
};

onMounted(async () => {
  updateScale();
  window.addEventListener('resize', updateScale);
  loadLocalState();
  await loadData();
  
  playersChannel = supabase
    .channel('mercato_overlay_players')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, async () => {
      await loadData();
    })
    .subscribe();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScale);
  if (playersChannel) supabase.removeChannel(playersChannel);
  playersChannel = null;
  dismissToast();
});
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

@keyframes slideRight {
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(200%); opacity: 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.2; transform: scale(1.05); }
}

.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}

.animate-pulse-slow-delayed {
  animation: pulse-slow 8s ease-in-out infinite;
  animation-delay: 4s;
}

/* Custom Select styling to make it look premium */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.65rem auto;
}
</style>
