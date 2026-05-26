<template>
  <div class="fixed inset-0 bg-mcu-bg overflow-hidden">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4">
      <div v-if="toast" class="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4 pointer-events-none">
        <div
          class="pointer-events-auto bg-[#111111] rounded-lg p-4 flex items-center gap-4 backdrop-blur-xl border"
          :class="
            toast.type === 'success'
              ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(34,197,94,0.35)]'
              : 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
          ">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            :class="toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'">
            <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="font-bold uppercase tracking-widest text-xs"
              :class="toast.type === 'success' ? 'text-emerald-500' : 'text-red-500'">
              {{ toast.type === 'success' ? 'Succès' : 'Erreur' }}
            </p>
            <p class="text-[#F0FDF4] text-sm break-words">{{ toast.message }}</p>
          </div>
          <button type="button" @click="dismissToast" class="text-[#A1A1AA] hover:text-white transition-colors shrink-0 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <div
      class="absolute left-1/2 top-1/2 h-[1080px] w-[1920px] bg-mcu-bg text-mcu-text font-sans overflow-hidden flex flex-col selection:bg-mcu-primary selection:text-mcu-bg transform-gpu origin-center"
      :style="{ transform: 'translate(-50%, -50%) scale(' + scale + ')' }"
    >
      <!-- Animated Background Elements -->
    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
    
    <div class="absolute top-[-30%] left-[10%] w-[55%] h-[60%] bg-mcu-primary opacity-[0.03] blur-[220px] rounded-full pointer-events-none animate-pulse-slow"></div>
    <div class="absolute bottom-[-30%] right-[-10%] w-[65%] h-[65%] bg-mcu-primary opacity-[0.02] blur-[220px] rounded-full pointer-events-none animate-pulse-slow-delayed"></div>
    
    <!-- Vignette -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0B0F0C_100%)] pointer-events-none z-0 opacity-80"></div>

    <div class="flex-1 flex w-full h-full p-6 gap-6 z-10">
      
      <!-- Left Column (3 Teams) -->
      <div class="w-[380px] flex flex-col gap-5 min-h-0">
        <div v-for="(team, index) in leftTeams" :key="team.id" 
             class="flex-1 min-h-0 relative group bg-mcu-surface-light/40 backdrop-blur-xl rounded-2xl p-4 flex flex-col transition-all duration-500 ease-out border"
             :class="[
               state === 'sold' && soldToTeam?.id === team.id ? 'border-mcu-primary shadow-[0_0_40px_rgba(34,197,94,0.25)] z-30' : 'border-mcu-border/50 shadow-[0_0_18px_rgba(0,0,0,0.5)]'
             ]"
             :style="{'animation-delay': `${index * 150}ms`}">
          
          <!-- Team Header -->
          <div class="flex justify-between items-center mb-3 pb-3 border-b border-mcu-border/60">
            <div class="flex items-center gap-3 min-w-0">
              <TeamLogo
                :name="team.name"
                wrapper-class="w-9 h-9 rounded-lg border border-mcu-border/60 bg-mcu-bg/80 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_12px_rgba(0,0,0,0.4)]"
                initials-class="font-title text-xs uppercase text-mcu-text"
                img-class="w-full h-full object-contain p-0.5"
              />
              <div
                v-if="!hasTeamLogo(team.name)"
                class="w-2 h-2 rounded-full border border-mcu-bg shadow-[0_0_10px_currentColor] shrink-0"
                :style="{ backgroundColor: team.color, color: team.color }"
              />
              <h2 class="text-2xl font-title uppercase tracking-[0.1em] text-mcu-text drop-shadow-md truncate max-w-[170px]" :style="{ textShadow: `0 0 8px ${team.color}66` }">{{ team.name }}</h2>
            </div>
            <div class="text-2xl font-title tracking-wider bg-mcu-surface px-3 py-1 rounded-lg border shadow-inner flex items-center gap-2 shrink-0"
                 :class="team.budget > 0 ? 'border-mcu-primary/30 text-mcu-text shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]' : 'border-red-500/30 text-red-400'">
              <span>{{ team.budget }}</span>
              <img :src="mcuCoinsIcon" alt="" class="w-5 h-5 opacity-90 drop-shadow-[0_0_10px_rgba(34,197,94,0.35)]" />
            </div>
          </div>
          
          <!-- Roles -->
          <div class="flex-1 min-h-0 flex flex-col gap-2">
            <div v-for="role in roles" :key="role" 
                 class="h-10 flex-none bg-mcu-surface/60 rounded-xl border flex items-center px-3 gap-3 transition-all relative overflow-hidden group/role"
                 :class="getPlayer(team, role) ? 'border-mcu-border hover:border-mcu-primary/50 hover:bg-mcu-surface-light' : 'border-transparent bg-mcu-bg/30 opacity-70'">
              
              <div v-if="getPlayer(team, role) && state === 'sold' && soldToTeam?.id === team.id && soldRole === role" 
                   class="absolute inset-0 bg-mcu-primary/10 animate-pulse"></div>

              <div class="w-9 h-9 flex items-center justify-center shrink-0">
                <img :src="getRoleIcon(role)" class="w-6 h-6 object-contain" :class="getPlayer(team, role) ? 'opacity-90' : 'opacity-25 grayscale'" />
              </div>
              <div class="flex-1 min-w-0 relative z-10">
                <template v-if="getPlayer(team, role)">
                  <div class="flex items-center justify-between gap-3 min-w-0">
                    <div class="flex items-center gap-2 min-w-0">
                      <img :src="getPlayer(team, role)?.avatarUrl" alt="" class="w-6 h-6 rounded-md border border-mcu-border/70 bg-mcu-bg/60 shrink-0" />
                      <div class="font-bold text-mcu-text text-base uppercase tracking-wide truncate group-hover/role:text-mcu-primary transition-colors">
                        {{ getPlayer(team, role)?.name }}
                      </div>
                    </div>
                    <div class="text-xs text-mcu-primary font-mono font-bold tracking-wider flex items-center gap-1 shrink-0">
                      <span>{{ getPlayer(team, role)?.price }}</span>
                      <img :src="mcuCoinsIcon" alt="" class="w-3.5 h-3.5 opacity-90" />
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="text-mcu-text-muted italic text-sm tracking-wide">Emplacement vide</div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Center Column -->
      <div class="flex-1 flex flex-col relative z-20">
        
        <!-- Header Logo -->
        <div class="flex justify-center mb-4 z-50">
          <img :src="mcuLogo" alt="MCU Logo" class="h-16 opacity-90 drop-shadow-[0_0_12px_rgba(34,197,94,0.35)] animate-[pulse_6s_ease-in-out_infinite]" />
        </div>

        <!-- Top Bar -->
        <div class="h-16 bg-mcu-surface/80 backdrop-blur-2xl border border-mcu-primary/40 rounded-2xl mb-5 flex items-center justify-between px-6 shadow-[0_0_26px_rgba(34,197,94,0.12)] relative overflow-hidden group">
          <div class="absolute top-0 left-[-100%] w-1/2 h-[2px] bg-gradient-to-r from-transparent via-mcu-primary to-transparent group-hover:animate-[slideRight_2s_ease-in-out_infinite]"></div>
          
          <div class="text-3xl font-title uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-mcu-text to-mcu-text-muted drop-shadow-sm">
            Phase d'enchères
          </div>
          
          <div class="flex items-center gap-8">
            <button
              type="button"
              class="px-3 py-1.5 rounded-xl border border-white/10 bg-black/20 text-white/70 hover:text-white/90 hover:bg-black/30 transition-colors text-xs font-extrabold uppercase tracking-[0.2em]"
              @click="showRecapModal = true"
              title="Afficher le récap"
            >
              Récap
            </button>
            <div class="flex items-center gap-3 bg-mcu-bg px-4 py-1.5 rounded-xl border border-mcu-border shadow-inner">
              <div class="text-mcu-text-muted text-xs uppercase tracking-widest font-bold">Joueurs restants</div>
              <div class="text-2xl font-title text-mcu-text">{{ remainingPlayersCount }}</div>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 flex items-center justify-center relative pt-16">
          <Teleport to="body">
            <AnimatedModal
              v-model:show="showRecapModal"
              title="Récapitulatif des enchères"
              :close-on-backdrop="true"
              :show-close="true"
            >
              <div class="grid grid-cols-2 gap-8">
                <!-- Top Transferts -->
                <div class="bg-mcu-bg/70 backdrop-blur-sm rounded-3xl border border-mcu-border p-6 flex flex-col relative overflow-hidden">
                  <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent opacity-80"></div>
                  <h3 class="text-2xl font-title tracking-widest uppercase mb-6 text-mcu-text flex items-center gap-3 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    <span class="text-[#F59E0B] text-3xl drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">★</span> Top Transferts
                  </h3>
                  <div class="flex flex-col gap-3 flex-1">
                    <div
                      v-for="(t, i) in biggestTransfers"
                      :key="'top_modal_' + i"
                      class="flex items-center justify-between bg-mcu-surface/45 p-4 rounded-2xl border border-mcu-border hover:border-[#F59E0B]/50 transition-all hover:bg-mcu-surface shadow-sm"
                    >
                      <div class="flex items-center gap-4 min-w-0">
                        <div class="text-2xl font-title text-[#F59E0B]/50 w-7">{{ i + 1 }}</div>
                        <div class="min-w-0">
                          <div class="font-bold text-xl text-mcu-text uppercase tracking-wide truncate">{{ t.player }}</div>
                          <div class="text-xs text-mcu-text-muted tracking-wider uppercase mt-0.5 truncate">{{ t.team }}</div>
                        </div>
                      </div>
                      <div class="text-2xl font-title tracking-widest text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded-lg border border-[#F59E0B]/20 flex items-center gap-2 shrink-0">
                        <span>{{ t.price }}</span>
                        <img :src="mcuCoinsIcon" alt="" class="w-5 h-5 opacity-90" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Worst Transferts -->
                <div class="bg-mcu-bg/70 backdrop-blur-sm rounded-3xl border border-mcu-border p-6 flex flex-col relative overflow-hidden">
                  <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80"></div>
                  <h3 class="text-2xl font-title tracking-widest uppercase mb-6 text-mcu-text flex items-center gap-3 drop-shadow-[0_0_10px_rgba(239,68,68,0.25)]">
                    <span class="text-red-500 text-3xl drop-shadow-[0_0_15px_rgba(239,68,68,0.45)]">↓</span> Petits gros
                  </h3>
                  <div class="flex flex-col gap-3 flex-1">
                    <div
                      v-for="(t, i) in smallestTransfers"
                      :key="'worst_modal_' + i"
                      class="flex items-center justify-between bg-mcu-surface/40 p-4 rounded-2xl border border-mcu-border hover:border-red-500/40 transition-all hover:bg-mcu-surface shadow-sm"
                    >
                      <div class="flex items-center gap-4 min-w-0">
                        <div class="text-2xl font-title text-mcu-text-muted/60 w-7">{{ i + 1 }}</div>
                        <div class="min-w-0">
                          <div class="font-bold text-xl text-mcu-text uppercase tracking-wide truncate">{{ t.player }}</div>
                          <div class="text-xs text-mcu-text-muted tracking-wider uppercase mt-0.5 truncate">{{ t.team }}</div>
                        </div>
                      </div>
                      <div class="text-2xl font-title tracking-widest text-red-300 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/25 flex items-center gap-2 shrink-0">
                        <span>{{ t.price }}</span>
                        <img :src="mcuCoinsIcon" alt="" class="w-5 h-5 opacity-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedModal>
          </Teleport>

          <!-- Admin Controls -->
          <div class="absolute top-0 right-0 flex flex-col gap-2 opacity-60 hover:opacity-100 transition-opacity z-50">
            <div class="flex gap-2 items-end bg-black/60 border border-white/10 rounded-lg px-2 py-2">
              <div class="flex flex-col gap-1">
                <div class="text-[10px] font-bold uppercase tracking-widest text-white/60 px-1">Joueur en cours</div>
                <div class="flex items-center gap-2 relative">
                  <input
                    v-model="currentPlayerInput"
                    class="w-[340px] bg-black/30 text-white text-xs px-2 py-1 rounded border border-white/10"
                    placeholder="Tape un pseudo…"
                    @input="handleCurrentPlayerInput"
                    @focus="showPlayerSuggestions = true"
                    @blur="hidePlayerSuggestionsSoon"
                  />

                  <div
                    v-if="showPlayerSuggestions && currentPlayerSuggestions.length"
                    class="absolute left-0 top-[calc(100%+6px)] w-[340px] max-h-64 overflow-auto bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.7)] z-50"
                  >
                    <button
                      v-for="p in currentPlayerSuggestions"
                      :key="p.id"
                      type="button"
                      class="w-full text-left px-3 py-2 text-xs text-white/90 hover:bg-white/10 flex items-center justify-between gap-3"
                      @mousedown.prevent="selectCurrentPlayer(p.id)"
                    >
                      <span class="truncate">
                        <span class="font-bold">{{ p.name }}</span>
                        <span class="text-white/50"> ({{ p.role }})</span>
                      </span>
                      <span class="text-[10px] text-white/40 font-mono shrink-0">{{ p.id.slice(0, 6) }}</span>
                    </button>
                  </div>
                </div>
              </div>
              <select v-model="sellTeamId" class="bg-black/30 text-white text-xs px-2 py-1 rounded border border-white/10 max-w-[220px]">
                <option value="">Équipe…</option>
                <option v-for="t in allTeams" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
              <input v-model.number="sellPrice" type="number" min="0" step="1000" class="w-[120px] bg-black/30 text-white text-xs px-2 py-1 rounded border border-white/10" placeholder="Prix" />
              <button
                @click="sell"
                :disabled="!canSell"
                class="px-3 py-1.5 rounded text-xs font-bold uppercase cursor-pointer border"
                :class="selling ? 'bg-mcu-primary/10 text-mcu-primary/50 border-mcu-primary/20 cursor-not-allowed' : 'bg-mcu-primary/20 text-mcu-primary border-mcu-primary/40 hover:bg-mcu-primary/30'"
              >
                Sell
              </button>
            </div>
          </div>

          <!-- Center States with Unified Transition -->
          <Transition
            mode="out-in"
            enter-active-class="transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
            enter-from-class="opacity-0 scale-[0.97] blur-[6px]"
            enter-to-class="opacity-100 scale-100 blur-0"
            leave-active-class="transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            leave-from-class="opacity-100 scale-100 blur-0"
            leave-to-class="opacity-0 scale-[1.03] blur-[6px]"
          >
            <!-- Bidding State -->
            <div v-if="state === 'bidding'" key="bidding" class="absolute w-[560px] aspect-[4/5] bg-mcu-surface rounded-3xl border-2 border-mcu-border shadow-[0_20px_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative before:absolute before:-inset-[1px] before:bg-gradient-to-br before:from-mcu-border before:to-transparent before:-z-10 group bidding-card">
              <div class="h-[60%] bg-mcu-bg relative border-b-2 border-mcu-border overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-mcu-surface/30 to-mcu-bg/95"></div>

                <!-- Big centered avatar -->
                <div class="absolute top-11 left-1/2 -translate-x-1/2 z-20">
                  <div class="w-36 h-36 rounded-3xl overflow-hidden border-0 bg-transparent shadow-none">
                    <img
                      v-if="currentPlayer?.avatarUrl"
                      :src="currentPlayer.avatarUrl"
                      alt=""
                      class="w-full h-full object-cover scale-[1.08]"
                    />
                  </div>
                </div>

                <!-- Header content -->
                <div class="absolute bottom-4 left-6 right-6 z-20 flex justify-between items-end gap-4">
                  <div class="min-w-0">
                    <h3 class="text-4xl font-title tracking-wider text-white drop-shadow-md truncate">{{ currentPlayer?.name ?? '—' }}</h3>
                    <div class="flex items-center gap-3 mt-3 flex-wrap">
                      <div
                        v-if="currentPlayerMeta?.rank"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/55 text-white border border-white/10 backdrop-blur-sm shadow-[inset_0_0_12px_rgba(0,0,0,0.35)]"
                        :title="currentPlayerMeta.rank"
                      >
                        <img :src="getRankIconUrl(currentPlayerMeta.rank)" class="w-6 h-6 drop-shadow-[0_0_10px_rgba(34,197,94,0.55)]" :alt="currentPlayerMeta.rank" />
                        <div class="leading-tight">
                          <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/60">ELO</div>
                          <div class="text-base font-title tracking-wider text-white">{{ currentPlayerMeta.rank }}</div>
                        </div>
                      </div>
                      <div
                        v-if="currentPlayerMeta?.tier"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/55 border border-white/10 backdrop-blur-sm shadow-[inset_0_0_12px_rgba(0,0,0,0.35)]"
                        :class="getFantasyTierBadgeClass(currentPlayerMeta.tier)"
                        :title="`Tier ${currentPlayerMeta.tier}`"
                      >
                        <div class="leading-tight">
                          <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] opacity-75">TIER</div>
                          <div class="text-base font-title tracking-wider">Tier {{ currentPlayerMeta.tier }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Champion pool (replaces avatar + role icons) -->
                  <div class="shrink-0 flex items-end">
                    <div v-if="currentPlayerMeta?.championPool?.length" class="flex gap-1.5 items-center justify-end flex-nowrap max-w-[260px] overflow-hidden">
                      <div
                        v-for="champ in currentPlayerMeta.championPool"
                        :key="champ"
                        class="w-10 h-10 rounded-full overflow-hidden border border-mcu-border/80 shadow-[0_10px_28px_rgba(0,0,0,0.65)] bg-black/30 shrink-0"
                        :title="champ"
                      >
                        <img :src="getChampionSquare(champ)" class="w-full h-full object-cover" :alt="champ" />
                      </div>
                    </div>
                    <div
                      v-else
                      class="w-12 h-12 rounded-xl bg-black/60 border border-mcu-border flex items-center justify-center backdrop-blur-sm"
                      title="Rôle"
                    >
                      <img :src="getRoleIcon(currentPlayer?.role ?? 'MID')" class="w-6 h-6 opacity-90" alt="" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-1 flex flex-col items-center justify-center p-8 text-center relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <div class="absolute inset-0 bg-gradient-to-t from-mcu-bg via-mcu-surface/90 to-mcu-surface/50"></div>
                <div class="relative z-10 flex flex-col items-center">
                  <div class="inline-flex items-center gap-3 px-6 py-2 bg-mcu-bg/80 rounded-full border border-mcu-primary/30 shadow-[inset_0_0_15px_rgba(34,197,94,0.1)]">
                    <span class="relative flex h-3 w-3">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-mcu-primary opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-mcu-primary shadow-[0_0_8px_#22C55E]"></span>
                    </span>
                    <p class="text-mcu-primary text-base font-title tracking-[0.2em] uppercase mt-1">Enchère en cours</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sold State -->
            <div v-else-if="state === 'sold'" key="sold" class="absolute w-[600px] aspect-[4/5] bg-mcu-bg rounded-3xl border-2 border-mcu-primary/60 shadow-[0_30px_120px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative">
              <div class="absolute inset-0 bg-gradient-to-b from-mcu-primary/12 to-transparent z-0"></div>

              <!-- SOLD badge (big, on top) -->
              <div class="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-50">
                <div
                  class="animate-stamp px-8 py-3 rounded-2xl bg-mcu-bg/75 backdrop-blur border border-mcu-text/25 text-mcu-text font-title uppercase tracking-[0.28em] shadow-[0_18px_60px_rgba(0,0,0,0.55)] text-5xl"
                >
                  SOLD
                </div>
              </div>

              <div class="h-[55%] relative border-b-2 border-mcu-primary/50 bg-mcu-surface overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-mcu-surface/40 to-mcu-bg/92"></div>

                <!-- Big centered avatar -->
                <div class="absolute top-11 left-1/2 -translate-x-1/2 z-20">
                  <div class="w-36 h-36 rounded-3xl overflow-hidden border-0 bg-transparent shadow-none">
                    <img
                      v-if="lastSold?.player.avatarUrl"
                      :src="lastSold.player.avatarUrl"
                      alt=""
                      class="w-full h-full object-cover scale-[1.08]"
                    />
                  </div>
                </div>

                <div class="absolute bottom-4 left-6 right-6 z-20 flex justify-between items-end gap-4">
                  <div class="min-w-0">
                    <h3 class="text-4xl font-title tracking-wider text-white drop-shadow-md truncate">{{ lastSold?.player.name ?? '—' }}</h3>
                    <div class="flex items-center gap-3 mt-3 flex-wrap">
                      <div
                        v-if="soldMeta?.rank"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/55 text-white border border-white/10 backdrop-blur-sm shadow-[inset_0_0_12px_rgba(0,0,0,0.35)]"
                        :title="soldMeta.rank"
                      >
                        <img :src="getRankIconUrl(soldMeta.rank)" class="w-6 h-6 drop-shadow-[0_0_10px_rgba(34,197,94,0.55)]" :alt="soldMeta.rank" />
                        <div class="leading-tight">
                          <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/60">ELO</div>
                          <div class="text-base font-title tracking-wider text-white">{{ soldMeta.rank }}</div>
                        </div>
                      </div>
                      <div
                        v-if="soldMeta?.tier"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/55 border border-white/10 backdrop-blur-sm shadow-[inset_0_0_12px_rgba(0,0,0,0.35)]"
                        :class="getFantasyTierBadgeClass(soldMeta.tier)"
                        :title="`Tier ${soldMeta.tier}`"
                      >
                        <div class="leading-tight">
                          <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] opacity-75">TIER</div>
                          <div class="text-base font-title tracking-wider">Tier {{ soldMeta.tier }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Champion pool (replaces avatar + role icons) -->
                  <div class="shrink-0 flex items-end">
                      <div v-if="soldMeta?.championPool?.length" class="flex gap-1.5 items-center justify-end flex-nowrap max-w-[260px] overflow-hidden">
                      <div
                        v-for="champ in soldMeta.championPool"
                        :key="champ"
                          class="w-10 h-10 rounded-full overflow-hidden border border-mcu-border/80 shadow-[0_10px_28px_rgba(0,0,0,0.65)] bg-black/30 shrink-0"
                        :title="champ"
                      >
                        <img :src="getChampionSquare(champ)" class="w-full h-full object-cover" :alt="champ" />
                      </div>
                    </div>
                    <div
                      v-else
                      class="w-12 h-12 rounded-xl bg-black/60 border border-mcu-border flex items-center justify-center backdrop-blur-sm"
                      title="Rôle"
                    >
                      <img :src="getRoleIcon(soldRole)" class="w-6 h-6 opacity-90" alt="" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex-1 flex flex-col items-center justify-center p-8 text-center relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-10">
                <div class="absolute inset-0 bg-gradient-to-t from-mcu-bg via-mcu-surface/90 to-mcu-bg/80"></div>
                
                <div class="relative z-10 flex flex-col items-center w-full">
                  <h1 class="text-6xl font-title uppercase tracking-wider mb-2 text-mcu-text drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {{ lastSold?.player.name ?? '—' }}
                  </h1>
                  
                  <div class="flex items-center gap-2 mb-6 bg-mcu-primary/10 px-4 py-1.5 rounded-lg border border-mcu-primary/40 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <img :src="getRoleIcon(soldRole)" class="w-5 h-5" />
                    <span class="text-xl text-mcu-primary font-title tracking-[0.2em] mt-1">{{ soldRole }}</span>
                  </div>
                  
                  <div class="text-[90px] leading-none font-title text-mcu-primary drop-shadow-[0_0_30px_rgba(34,197,94,0.8)] mb-6 flex items-center gap-4">
                    <span>{{ lastSold?.price ?? soldPrice }}</span>
                    <img :src="mcuCoinsIcon" alt="" class="w-20 h-20 opacity-95 drop-shadow-[0_0_24px_rgba(34,197,94,0.5)] -mt-1" />
                  </div>
                  
                  <div class="w-full px-6 py-4 bg-mcu-bg border border-mcu-border rounded-xl relative overflow-hidden group/winner">
                    <div class="absolute inset-0 opacity-50" :style="{ background: `linear-gradient(to right, ${soldTeamColor}1A, transparent, ${soldTeamColor}1A)` }"></div>
                    <div class="absolute bottom-0 left-0 w-full h-[2px]" :style="{ backgroundColor: soldTeamColor, boxShadow: `0 0 10px ${soldTeamColor}` }"></div>
                    <span class="text-xs uppercase tracking-[0.2em] text-mcu-text-muted mb-1 block">Remporté par</span>
                    <div class="flex justify-center items-center gap-3">
                      <div class="w-5 h-5 rounded-full border border-white/20 shadow-[0_0_15px_currentColor]" :style="{ backgroundColor: soldTeamColor, color: soldTeamColor }"></div>
                      <span class="text-3xl font-title tracking-wider text-mcu-text mt-1" :style="{ textShadow: `0 0 10px ${soldTeamColor}80` }">{{ lastSold?.teamName ?? soldTeamName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </Transition>
        </div>
      </div>

      <!-- Right Column (3 Teams) -->
      <div class="w-[380px] flex flex-col gap-5 relative z-20 min-h-0">
        <div v-for="(team, index) in rightTeams" :key="team.id" 
             class="flex-1 min-h-0 relative group bg-mcu-surface-light/40 backdrop-blur-xl rounded-2xl p-4 flex flex-col transition-all duration-500 ease-out border"
             :class="[
               state === 'sold' && soldToTeam?.id === team.id ? 'border-mcu-primary shadow-[0_0_40px_rgba(34,197,94,0.25)] z-30' : 'border-mcu-border/50 shadow-[0_0_18px_rgba(0,0,0,0.5)]'
             ]"
             :style="{'animation-delay': `${index * 150}ms`}">
          
          <!-- Team Header -->
          <div class="flex justify-between items-center mb-3 pb-3 border-b border-mcu-border/60">
            <div class="flex items-center gap-3 min-w-0">
              <TeamLogo
                :name="team.name"
                wrapper-class="w-9 h-9 rounded-lg border border-mcu-border/60 bg-mcu-bg/80 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_12px_rgba(0,0,0,0.4)]"
                initials-class="font-title text-xs uppercase text-mcu-text"
                img-class="w-full h-full object-contain p-0.5"
              />
              <div
                v-if="!hasTeamLogo(team.name)"
                class="w-2 h-2 rounded-full border border-mcu-bg shadow-[0_0_10px_currentColor] shrink-0"
                :style="{ backgroundColor: team.color, color: team.color }"
              />
              <h2 class="text-2xl font-title uppercase tracking-[0.1em] text-mcu-text drop-shadow-md truncate max-w-[170px]" :style="{ textShadow: `0 0 8px ${team.color}66` }">{{ team.name }}</h2>
            </div>
            <div class="text-2xl font-title tracking-wider bg-mcu-surface px-3 py-1 rounded-lg border shadow-inner flex items-center gap-2 shrink-0"
                 :class="team.budget > 0 ? 'border-mcu-primary/30 text-mcu-text shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]' : 'border-red-500/30 text-red-400'">
              <span>{{ team.budget }}</span>
              <img :src="mcuCoinsIcon" alt="" class="w-5 h-5 opacity-90 drop-shadow-[0_0_10px_rgba(34,197,94,0.35)]" />
            </div>
          </div>
          
          <!-- Roles -->
          <div class="flex-1 min-h-0 flex flex-col gap-2">
            <div v-for="role in roles" :key="role" 
                 class="h-10 flex-none bg-mcu-surface/60 rounded-xl border flex items-center px-3 gap-3 transition-all relative overflow-hidden group/role"
                 :class="getPlayer(team, role) ? 'border-mcu-border hover:border-mcu-primary/50 hover:bg-mcu-surface-light' : 'border-transparent bg-mcu-bg/30 opacity-70'">
              
              <div v-if="getPlayer(team, role) && state === 'sold' && soldToTeam?.id === team.id && soldRole === role" 
                   class="absolute inset-0 bg-mcu-primary/10 animate-pulse"></div>

              <div class="w-9 h-9 flex items-center justify-center shrink-0">
                <img :src="getRoleIcon(role)" class="w-6 h-6 object-contain" :class="getPlayer(team, role) ? 'opacity-90' : 'opacity-25 grayscale'" />
              </div>
              <div class="flex-1 min-w-0 relative z-10">
                <template v-if="getPlayer(team, role)">
                  <div class="flex items-center justify-between gap-3 min-w-0">
                    <div class="flex items-center gap-2 min-w-0">
                      <img :src="getPlayer(team, role)?.avatarUrl" alt="" class="w-6 h-6 rounded-md border border-mcu-border/70 bg-mcu-bg/60 shrink-0" />
                      <div class="font-bold text-mcu-text text-base uppercase tracking-wide truncate group-hover/role:text-mcu-primary transition-colors">
                        {{ getPlayer(team, role)?.name }}
                      </div>
                    </div>
                    <div class="text-xs text-mcu-primary font-mono font-bold tracking-wider flex items-center gap-1 shrink-0">
                      <span>{{ getPlayer(team, role)?.price }}</span>
                      <img :src="mcuCoinsIcon" alt="" class="w-3.5 h-3.5 opacity-90" />
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="text-mcu-text-muted italic text-sm tracking-wide">Emplacement vide</div>
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
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { dicebearPortraitUrl } from '../lib/dicebear';
import { fetchPlayerAvatarConfigsByIds } from '../services/playerAvatarService';
import { getRankIconUrl } from '../utils/rankIcon';
import { getFantasyTierBadgeClass } from '../utils/tierStyles';
import AnimatedModal from '../components/AnimatedModal.vue';
import TeamLogo from '../components/TeamLogo.vue';
import { hasTeamLogo } from '../utils/teamLogo';

const scale = ref(1);

const updateScale = () => {
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;
  const scaleX = winWidth / 1920;
  const scaleY = winHeight / 1080;
  scale.value = Math.min(scaleX, scaleY);
};

// Assets Import
import mcuLogo from '../assets/mcu_logo.png';
import mcuCoinsIcon from '../assets/mcu_coins.png';
import topIcon from '../assets/top.png';
import jglIcon from '../assets/jgl.png';
import midIcon from '../assets/mid.png';
import adcIcon from '../assets/adc.png';
import supIcon from '../assets/support.png';

type State = 'bidding' | 'sold';
const state = ref<State>('bidding');
const showRecapModal = ref(false);

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
  price: number;
  avatarUrl: string;
}

interface Team {
  id: string;
  name: string;
  color: string;
  budget: number;
  players: Player[];
}

type DbTeam = Database['public']['Tables']['teams']['Row'];
type DbPlayer = Database['public']['Tables']['players']['Row'];
type AuctionPlayerRow = Pick<
  DbPlayer,
  | 'id'
  | 'pseudo'
  | 'riot_id'
  | 'participation_type'
  | 'primary_role'
  | 'team_id'
  | 'auction_price'
  | 'rank'
  | 'fantasy_tier'
  | 'champion_pool'
  | 'champion_signature'
>;

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

const AUCTION_TEAM_BUDGET = 100_000;
const teamPalette = ['#0036FF', '#F3ED00', '#FF3366', '#FF5900', '#EE1C25', '#E4A853', '#22C55E', '#8B5CF6'];

const dbTeams = ref<DbTeam[]>([]);
const dbPlayers = ref<AuctionPlayerRow[]>([]);
const avatarUrlByPlayerId = ref<Map<string, string>>(new Map());
const champions = ref<Array<{ name: string; image_url?: string | null }>>([]);
const championsByName = ref<Map<string, { image_url?: string | null }>>(new Map());

const allTeams = ref<Team[]>([]);
const leftTeams = computed(() => allTeams.value.slice(0, 3));
const rightTeams = computed(() => allTeams.value.slice(3, 6));

const soldRole = ref('MID');
const lastSold = ref<{
  player: Player;
  meta?: {
    rank?: string | null;
    tier?: string | null;
    championPool?: string[] | null;
    championSignature?: string | null;
  };
  teamId: string;
  teamName: string;
  teamColor: string;
  price: number;
} | null>(null);

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

const remainingPlayersCount = computed(() => {
  return dbPlayers.value
    .filter((p) => p.participation_type?.toLowerCase() === 'joueur')
    .filter((p: any) => !p.team_id).length;
});

const getChampionSquare = (name: string) => championsByName.value.get(name)?.image_url ?? '';

const unsoldPlayers = computed(() => {
  return dbPlayers.value
    .filter((p) => p.participation_type?.toLowerCase() === 'joueur')
    .filter((p: any) => !p.team_id)
    .map((p) => ({
      id: p.id,
      name: p.pseudo || p.riot_id || 'Joueur',
      role: roleToOverlayRole(p.primary_role),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const currentPlayerId = ref<string>('');
const currentPlayerInput = ref<string>('');
const showPlayerSuggestions = ref(false);

const currentPlayerSuggestions = computed(() => {
  const q = (currentPlayerInput.value ?? '').toLowerCase().trim();
  if (!q) return unsoldPlayers.value.slice(0, 20);
  return unsoldPlayers.value
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, 20);
});

const selectCurrentPlayer = (playerId: string) => {
  const picked = unsoldPlayers.value.find((p) => p.id === playerId);
  if (!picked) return;
  currentPlayerId.value = picked.id;
  currentPlayerInput.value = picked.name;
  showPlayerSuggestions.value = false;
  if (state.value === 'sold') state.value = 'bidding';
};

const handleCurrentPlayerInput = () => {
  // typing always opens suggestions; selection happens by click.
  showPlayerSuggestions.value = true;
  if (state.value === 'sold') state.value = 'bidding';
  // If user edits the text, we keep selection unless it no longer matches the chosen player name.
  const selected = currentPlayerId.value ? unsoldPlayers.value.find((p) => p.id === currentPlayerId.value) : null;
  if (selected && selected.name.toLowerCase().trim() !== (currentPlayerInput.value ?? '').toLowerCase().trim()) {
    currentPlayerId.value = '';
  }
};

const hidePlayerSuggestionsSoon = () => {
  window.setTimeout(() => {
    showPlayerSuggestions.value = false;
  }, 120);
};

const currentPlayer = computed<Player | null>(() => {
  const source = unsoldPlayers.value;
  if (source.length === 0) return null;

  const selected = currentPlayerId.value ? source.find((p) => p.id === currentPlayerId.value) : null;
  const picked = selected ?? source[0];

  // If selection became invalid (sold/moved), drop it.
  if (!selected && currentPlayerId.value) currentPlayerId.value = '';

  return {
    id: picked.id,
    name: picked.name,
    role: picked.role,
    price: 0,
    avatarUrl: avatarUrlByPlayerId.value.get(picked.id) ?? dicebearPortraitUrl(undefined, picked.name),
  };
});

const currentPlayerMeta = computed(() => {
  const id = currentPlayer.value?.id;
  if (!id) return null;
  const row: any = dbPlayers.value.find((p) => p.id === id);
  if (!row) return null;
  return {
    rank: row.rank ?? null,
    tier: row.fantasy_tier ?? null,
    championPool: (row.champion_pool ?? null) as string[] | null,
    championSignature: (row.champion_signature ?? null) as string | null,
  };
});

const soldMeta = computed(() => lastSold.value?.meta ?? null);

const canSell = computed(() => {
  if (selling.value) return false;
  if (!sellTeamId.value) return false;
  return !!currentPlayer.value?.id;
});

const selling = ref(false);
const sellTeamId = ref<string>('');
const sellPrice = ref<number>(0);

const soldToTeam = computed(() => allTeams.value.find(t => t.id === sellTeamId.value) ?? allTeams.value[0]);
const soldPrice = computed(() => {
  const n = Number(sellPrice.value ?? 0);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
});
const soldTeamName = computed(() => soldToTeam.value?.name ?? '—');
const soldTeamColor = computed(() => soldToTeam.value?.color ?? '#0036FF');

const transfers = computed(() =>
  allTeams.value
    .flatMap((t) =>
      t.players.map((p) => ({
        player: p.name,
        role: p.role,
        team: t.name,
        teamColor: t.color,
        price: p.price ?? 0,
      })),
    )
    .filter((t) => t.price > 0),
);

const biggestTransfers = computed(() =>
  [...transfers.value].sort((a, b) => b.price - a.price).slice(0, 5),
);

const smallestTransfers = computed(() =>
  [...transfers.value].sort((a, b) => a.price - b.price).slice(0, 5),
);

let auctionChannel: ReturnType<typeof supabase.channel> | null = null;

const loadData = async () => {
  const [teamsRes, champsRes] = await Promise.all([
    supabase.from('teams').select('*').order('name', { ascending: true }),
    supabase.from('champions').select('name,image_url'),
  ]);
  if (teamsRes.error) throw teamsRes.error;
  dbTeams.value = (teamsRes.data ?? []) as DbTeam[];

  if (champsRes.error) throw champsRes.error;
  champions.value = (champsRes.data ?? []) as any[];
  championsByName.value = new Map(
    champions.value.map((c) => [
      c.name,
      { image_url: (c as any).image_url ?? null },
    ])
  );

  const playersSelectWithAuctionPrice =
    'id,pseudo,riot_id,participation_type,primary_role,team_id,auction_price,rank,fantasy_tier,champion_pool,champion_signature';
  const playersSelectWithoutAuctionPrice =
    'id,pseudo,riot_id,participation_type,primary_role,team_id,rank,fantasy_tier,champion_pool,champion_signature';

  const playersRes = await supabase.from('players').select(playersSelectWithAuctionPrice).order('pseudo', { ascending: true });
  if (playersRes.error) {
    // If the DB migration hasn't been applied yet, don't crash the overlay.
    if (playersRes.error.code === '42703' && /auction_price/i.test(playersRes.error.message ?? '')) {
      const retry = await supabase.from('players').select(playersSelectWithoutAuctionPrice).order('pseudo', { ascending: true });
      if (retry.error) throw retry.error;
      dbPlayers.value = (retry.data ?? []) as unknown as AuctionPlayerRow[];
    } else {
      throw playersRes.error;
    }
  } else {
    dbPlayers.value = (playersRes.data ?? []) as unknown as AuctionPlayerRow[];
  }

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

  const playersByTeamId = new Map<string, AuctionPlayerRow[]>();
  for (const p of dbPlayers.value.filter((p) => p.participation_type?.toLowerCase() === 'joueur')) {
    const tid = (p as any).team_id as string | null | undefined;
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
        const price = Math.max(0, Math.round(Number((p as any).auction_price ?? 0) || 0));
        return {
          id: p.id,
          name,
          role,
          price,
          avatarUrl: avatarUrlByPlayerId.value.get(p.id) ?? dicebearPortraitUrl(undefined, name),
        };
      })
      .filter((p) => !!p.role);

    const spent = teamPlayers.reduce((sum, p) => sum + (p.price ?? 0), 0);
    return {
      id: t.id,
      name: t.name,
      color: teamPalette[idx % teamPalette.length],
      budget: AUCTION_TEAM_BUDGET - spent,
      players: teamPlayers,
    };
  });

  allTeams.value = nextTeams;
};

const sell = async () => {
  if (!sellTeamId.value) {
    showToast('Choisis une équipe.', 'error');
    return;
  }

  // Accept either an explicit selection, or typed text (best match), or fallback to current player.
  let playerId = currentPlayerId.value;
  if (!playerId) {
    const q = (currentPlayerInput.value ?? '').toLowerCase().trim();
    if (q) {
      const exact = unsoldPlayers.value.find((p) => p.name.toLowerCase().trim() === q);
      const partial = unsoldPlayers.value.find((p) => p.name.toLowerCase().includes(q));
      playerId = (exact ?? partial)?.id ?? '';
    }
  }
  if (!playerId) {
    playerId = currentPlayer.value?.id ?? '';
  }
  if (!playerId) {
    showToast('Aucun joueur sélectionné.', 'error');
    return;
  }

  const targetTeam = allTeams.value.find((t) => t.id === sellTeamId.value) ?? null;
  if (!targetTeam) {
    showToast('Équipe introuvable.', 'error');
    return;
  }

  const row = dbPlayers.value.find((p) => p.id === playerId) as any | undefined;
  const playerRole =
    roleToOverlayRole(row?.primary_role ?? '') || roleToOverlayRole(currentPlayer.value?.role ?? '') || (currentPlayer.value?.role ?? '');
  if (playerRole) {
    const existing = getPlayer(targetTeam, playerRole);
    if (existing) {
      showToast(`Impossible: ${targetTeam.name} a déjà un joueur ${playerRole}.`, 'error');
      return;
    }
  }

  selling.value = true;
  try {
    const price = Math.max(0, Math.round(Number(sellPrice.value ?? 0) || 0));
    const { error } = await supabase
      .from('players')
      .update({ team_id: sellTeamId.value, auction_price: price })
      .eq('id', playerId);
    if (error) {
      if (error.code === '42703' && /auction_price/i.test(error.message ?? '')) {
        showToast("La colonne 'auction_price' n'existe pas en DB. Applique la migration Supabase, puis réessaie.", 'error');
        return;
      }
      showToast('Erreur Sell : ' + (error.message ?? 'Unknown error'), 'error');
      return;
    }

    const p = dbPlayers.value.find((x) => x.id === playerId);
    soldRole.value = roleToOverlayRole(p?.primary_role ?? '');

    // Snapshot the sold player so Sold/Recap don't switch to the next current player.
    const soldPlayer: Player = {
      id: playerId,
      name: p?.pseudo || p?.riot_id || currentPlayer.value?.name || '—',
      role: roleToOverlayRole(p?.primary_role ?? currentPlayer.value?.role ?? ''),
      price,
      avatarUrl:
        avatarUrlByPlayerId.value.get(playerId) ??
        (p ? dicebearPortraitUrl(undefined, p.pseudo || p.riot_id || 'Joueur') : currentPlayer.value?.avatarUrl ?? ''),
    };
    lastSold.value = {
      player: soldPlayer,
      meta: {
        rank: (p as any)?.rank ?? null,
        tier: (p as any)?.fantasy_tier ?? null,
        championPool: ((p as any)?.champion_pool ?? null) as string[] | null,
        championSignature: ((p as any)?.champion_signature ?? null) as string | null,
      },
      teamId: sellTeamId.value,
      teamName: soldToTeam.value?.name ?? soldTeamName.value,
      teamColor: soldToTeam.value?.color ?? soldTeamColor.value,
      price,
    };

    state.value = 'sold';

    // Reset selection to next available
    currentPlayerId.value = '';
    currentPlayerInput.value = '';

    await loadData();
    showToast('Vente enregistrée.', 'success');
  } finally {
    selling.value = false;
  }
};

onMounted(async () => {
  updateScale();
  window.addEventListener('resize', updateScale);

  await loadData();
  auctionChannel = supabase
    .channel('auction_overlay_players')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, async () => {
      await loadData();
    })
    .subscribe();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScale);
  if (auctionChannel) supabase.removeChannel(auctionChannel);
  auctionChannel = null;
  dismissToast();
});
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

@keyframes stamp {
  0% {
    opacity: 0;
    transform: translateY(-12px) scale(1.12) rotate(-10deg);
    filter: blur(1px);
  }
  60% {
    opacity: 1;
    transform: translateY(2px) scale(0.98) rotate(-10deg);
    filter: blur(0px);
  }
  100% {
    opacity: 0.92;
    transform: translateY(0px) scale(1) rotate(-10deg);
    filter: blur(0px);
  }
}

.animate-stamp {
  animation: stamp 520ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideRight {
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(200%); opacity: 0; }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.02; transform: scale(1); }
  50% { opacity: 0.035; transform: scale(1.03); }
}

.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}

.animate-pulse-slow-delayed {
  animation: pulse-slow 8s ease-in-out infinite;
  animation-delay: 4s;
}

.bidding-card {
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
}
.bidding-card:hover {
  box-shadow: 0 26px 90px rgba(0, 0, 0, 0.9);
  border-color: rgba(240, 253, 244, 0.18);
  transform: translateY(-2px);
}
</style>