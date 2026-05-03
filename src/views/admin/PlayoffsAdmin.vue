<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] p-4 md:p-8 relative">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4">
      <div v-if="toast" class="fixed top-24 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-4 pointer-events-none">
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

    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <img src="../../assets/mcu_logo.png" alt="MCU Logo" class="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
        <h1 class="text-2xl md:text-4xl font-title text-[#22C55E]">Admin Dashboard</h1>
      </div>
      <button @click="handleLogout" class="cursor-pointer px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#EF4444] hover:text-[#EF4444] text-xs font-bold uppercase tracking-widest rounded transition-colors">
        Logout
      </button>
    </div>

    <!-- Generators Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <!-- 1. Championship -->
      <div class="bg-[#111111] border border-[#2A2A2A] p-4 rounded-sm flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-bold mb-1">1. Championship</h2>
          <p class="text-[#A1A1AA] text-xs mb-3">Creates Round Robin schedule for all teams. Overwrites existing.</p>
        </div>
        <button @click="handleGenerateChampionship" class="px-4 py-2 bg-[#22C55E] text-[#0B0F0C] font-bold rounded-sm hover:bg-[#4ADE80] transition-colors w-full cursor-pointer text-sm">
          Generate Matches
        </button>
      </div>

      <!-- 2. Playoff Groups -->
      <div class="bg-[#111111] border border-[#2A2A2A] p-4 rounded-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-1">
            <h2 class="text-lg font-bold">2. Groups</h2>
            <button @click="showGroupsSetup = !showGroupsSetup" class="text-xs text-[#22C55E] hover:underline cursor-pointer">
              {{ showGroupsSetup ? 'Hide' : 'Setup' }}
            </button>
          </div>
          <p class="text-[#A1A1AA] text-xs mb-3">Select 3 teams for Group A and 3 for Group B.</p>
        </div>
        
        <div v-if="showGroupsSetup" class="flex flex-col gap-3 mt-1">
          <div class="flex gap-2">
            <div class="flex-1 flex flex-col gap-1">
              <span class="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">Group A</span>
              <select v-for="i in 3" :key="`gA-${i}`" v-model="groupSetup.groupA[i-1]" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-1 text-xs rounded focus:border-[#22C55E] focus:outline-none">
                <option :value="null">- Select -</option>
                <option v-for="team in allTeams" :key="`tA-${i}-${team.id}`" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
            <div class="flex-1 flex flex-col gap-1">
              <span class="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">Group B</span>
              <select v-for="i in 3" :key="`gB-${i}`" v-model="groupSetup.groupB[i-1]" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-1 text-xs rounded focus:border-[#22C55E] focus:outline-none">
                <option :value="null">- Select -</option>
                <option v-for="team in allTeams" :key="`tB-${i}-${team.id}`" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
          </div>
          <button @click="handleGenerateGroups" class="px-4 py-2 bg-[#22C55E] text-[#0B0F0C] font-bold rounded-sm hover:bg-[#4ADE80] transition-colors w-full cursor-pointer text-sm">
            Generate Groups
          </button>
        </div>
        <div v-else>
          <button @click="showGroupsSetup = true" class="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] text-[#A1A1AA] font-bold rounded-sm hover:text-[#F0FDF4] transition-colors w-full cursor-pointer text-sm">
            Expand to Setup
          </button>
        </div>
      </div>

      <!-- 3. Knockout -->
      <div class="bg-[#111111] border border-[#2A2A2A] p-4 rounded-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-1">
            <h2 class="text-lg font-bold">3. Knockout Stage</h2>
            <button @click="showKnockoutSetup = !showKnockoutSetup" class="text-xs text-[#22C55E] hover:underline cursor-pointer">
              {{ showKnockoutSetup ? 'Hide' : 'Setup' }}
            </button>
          </div>
          <p class="text-[#A1A1AA] text-xs mb-3">Select advancing teams. Creates Semis and BO3 Final.</p>
        </div>

        <div v-if="showKnockoutSetup" class="flex flex-col gap-3 mt-1">
          <div class="flex gap-2">
            <div class="flex-1 flex flex-col gap-1">
              <span class="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">From Grp A</span>
              <select v-model="knockoutSetup.groupA1" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-1 text-xs rounded focus:border-[#22C55E] focus:outline-none">
                <option :value="null">- 1st Place -</option>
                <option v-for="team in allTeams" :key="`ka1-${team.id}`" :value="team.id">{{ team.name }}</option>
              </select>
              <select v-model="knockoutSetup.groupA2" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-1 text-xs rounded focus:border-[#22C55E] focus:outline-none">
                <option :value="null">- 2nd Place -</option>
                <option v-for="team in allTeams" :key="`ka2-${team.id}`" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
            <div class="flex-1 flex flex-col gap-1">
              <span class="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">From Grp B</span>
              <select v-model="knockoutSetup.groupB1" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-1 text-xs rounded focus:border-[#22C55E] focus:outline-none">
                <option :value="null">- 1st Place -</option>
                <option v-for="team in allTeams" :key="`kb1-${team.id}`" :value="team.id">{{ team.name }}</option>
              </select>
              <select v-model="knockoutSetup.groupB2" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-1 text-xs rounded focus:border-[#22C55E] focus:outline-none">
                <option :value="null">- 2nd Place -</option>
                <option v-for="team in allTeams" :key="`kb2-${team.id}`" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
          </div>
          <button @click="handleGenerateKnockout" class="px-4 py-2 bg-[#22C55E] text-[#0B0F0C] font-bold rounded-sm hover:bg-[#4ADE80] transition-colors w-full cursor-pointer text-sm">
            Generate Knockout
          </button>
        </div>
        <div v-else>
          <button @click="showKnockoutSetup = true" class="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] text-[#A1A1AA] font-bold rounded-sm hover:text-[#F0FDF4] transition-colors w-full cursor-pointer text-sm">
            Expand to Setup
          </button>
        </div>
      </div>
    </div>

    <!-- Management Section -->
    <div class="mb-4">
      <div class="flex flex-wrap gap-4 justify-between items-center mb-4 bg-[#111111] p-4 rounded border border-[#2A2A2A]">
        <div>
          <h2 class="text-xl font-bold mb-1">Manage Matches</h2>
          <p class="text-xs text-[#A1A1AA]">
            <strong class="text-[#22C55E]">Championship Points:</strong> Win: 10pts (+2 if <20min, +1 if 20-30min) | Loss: 3pts (+1 if >30min)
          </p>
        </div>
        <div class="flex gap-2">
          <button @click="handleRecalculateStandings" class="cursor-pointer text-xs px-4 py-2 border border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/10 rounded font-bold transition-colors">
            Recalculate Standings
          </button>
          <button @click="loadMatches" class="cursor-pointer text-xs px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#2A2A2A] rounded font-bold transition-colors">
            Refresh Matches
          </button>
        </div>
      </div>
      
      <div v-if="loadingMatches" class="text-[#A1A1AA] animate-pulse p-4">Loading matches...</div>
      <div v-else-if="matches.length === 0" class="text-[#A1A1AA] p-6 bg-[#111111] rounded border border-[#2A2A2A]">
        Aucun match. Générez d'abord les matchs pour commencer.
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="bracketGroup in groupedMatches" :key="bracketGroup.name" 
             class="bg-[#111111] border border-[#2A2A2A] p-4 rounded-sm relative overflow-hidden"
             :class="{ 'md:col-span-2': bracketGroup.name !== 'group_a' && bracketGroup.name !== 'group_b' }">
          <!-- Background decoration -->
          <div class="absolute right-0 top-0 w-32 h-32 bg-[#22C55E] opacity-[0.02] blur-[50px] pointer-events-none"></div>
          
          <h3 class="text-lg font-title mb-4 text-[#22C55E]">
            {{ formatBracketName(bracketGroup.name) }}
          </h3>
          
          <div v-for="round in bracketGroup.rounds" :key="round.number" class="mb-4 pl-3 border-l-2 transition-colors duration-300"
               :class="isRoundExpanded(bracketGroup.name, round.number) ? 'border-[#22C55E]' : 'border-[#2A2A2A]'">
            
            <div class="flex flex-wrap items-center gap-2 justify-between mb-3">
              <button type="button" @click="toggleRound(bracketGroup.name, round.number)" 
                      class="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer group">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-[#A1A1AA] group-hover:text-[#22C55E] transition-transform" 
                     :class="isRoundExpanded(bracketGroup.name, round.number) ? 'rotate-90 text-[#22C55E]' : ''" 
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <h4 class="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest group-hover:text-[#F0FDF4] transition-colors"
                    :class="isRoundExpanded(bracketGroup.name, round.number) ? 'text-[#F0FDF4]' : ''">
                  {{ getRoundName(bracketGroup.name, round.number) }}
                  <span class="ml-2 text-[10px] font-normal opacity-50">({{ round.matches.length }} matchs)</span>
                </h4>
              </button>
              <button
                v-if="roundHasSaveTourButton(round.matches)"
                type="button"
                @click.stop="handleSaveRound(bracketGroup.name, round.number, round.matches)"
                :disabled="savingRoundKey === roundSaveKey(bracketGroup.name, round.number)"
                class="shrink-0 text-[10px] px-3 py-1.5 font-bold uppercase bg-[#2A2A2A] border border-[#3F3F46] hover:bg-[#22C55E] hover:text-[#0B0F0C] hover:border-[#4ADE80] rounded transition-colors disabled:opacity-40 disabled:cursor-wait cursor-pointer">
                {{ savingRoundKey === roundSaveKey(bracketGroup.name, round.number) ? 'Enregistrement…' : 'Sauvegarder le tour' }}
              </button>
            </div>
            
            <div v-show="isRoundExpanded(bracketGroup.name, round.number)" 
                 class="grid grid-cols-1 gap-3 mb-2"
                 :class="bracketGroup.name === 'group_a' || bracketGroup.name === 'group_b' ? 'xl:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'">
              <div v-for="match in round.matches" :key="match.id" class="bg-[#1A1A1A] p-3 border border-[#2A2A2A] rounded flex flex-col gap-2 transition-all hover:border-[#22C55E]/40"
                   :class="{ 'border-[#22C55E]/30 bg-[#0d130f]': match.is_completed }">
                   
                <div class="text-[10px] text-[#A1A1AA] font-bold tracking-widest flex justify-between items-center mb-1">
                  <span>M#{{ match.match_order }}</span>
                  <span v-if="match.is_completed" class="text-green-500 px-1.5 py-0.5 bg-green-500/10 rounded">DONE</span>
                </div>
                
                <div class="flex items-stretch gap-2 w-full">
                  <div class="flex-1 flex flex-col gap-1 min-w-0">
                    <!-- Team 1 -->
                    <div class="flex items-center justify-between bg-[#0B0F0C] p-1.5 rounded border transition-colors"
                         :class="getWinnerStatusClass(match, 1)">
                      <span class="text-sm truncate mr-2" :class="match.team1 ? 'text-[#F0FDF4] font-bold' : 'text-[#A1A1AA] italic'">{{ match.team1?.name || 'TBD' }}</span>
                      <template v-if="match.stage === 'championship'">
                        <input type="number" v-model.number="match.team1_score" 
                               class="w-12 bg-[#111111] border border-[#2A2A2A] text-center rounded p-0.5 text-sm font-bold focus:border-[#22C55E] focus:outline-none" 
                               :disabled="scoreInputsLocked(match)" />
                      </template>
                      <template v-else>
                        <select v-model.number="match.team1_score" 
                               class="bg-[#111111] border border-[#2A2A2A] text-center rounded p-0.5 text-sm font-bold focus:border-[#22C55E] focus:outline-none cursor-pointer" 
                               :disabled="scoreInputsLocked(match)">
                          <option :value="null">-</option>
                          <option :value="0">0</option>
                          <option :value="1">1</option>
                          <option v-if="isBO3(match)" :value="2">2</option>
                        </select>
                      </template>
                    </div>
                    <!-- Team 2 -->
                    <div class="flex items-center justify-between bg-[#0B0F0C] p-1.5 rounded border transition-colors"
                         :class="getWinnerStatusClass(match, 2)">
                      <span class="text-sm truncate mr-2" :class="match.team2 ? 'text-[#F0FDF4] font-bold' : 'text-[#A1A1AA] italic'">{{ match.team2?.name || 'TBD' }}</span>
                      <template v-if="match.stage === 'championship'">
                        <input type="number" v-model.number="match.team2_score" 
                               class="w-12 bg-[#111111] border border-[#2A2A2A] text-center rounded p-0.5 text-sm font-bold focus:border-[#22C55E] focus:outline-none" 
                               :disabled="scoreInputsLocked(match)" />
                      </template>
                      <template v-else>
                        <select v-model.number="match.team2_score" 
                               class="bg-[#111111] border border-[#2A2A2A] text-center rounded p-0.5 text-sm font-bold focus:border-[#22C55E] focus:outline-none cursor-pointer" 
                               :disabled="scoreInputsLocked(match)">
                          <option :value="null">-</option>
                          <option :value="0">0</option>
                          <option :value="1">1</option>
                          <option v-if="isBO3(match)" :value="2">2</option>
                        </select>
                      </template>
                    </div>
                  </div>
                </div>

                <p v-if="scoreInputsLocked(match)" class="text-[9px] text-[#A1A1AA] leading-tight text-center mt-1">
                  Verrouillé (gagnant avancé)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../lib/supabase';
import { generateGroupMatches, generateSingleEliminationBracket, generateChampionship } from '../../lib/bracket';
import { fetchPlayoffMatches, generatePlayoffMatches, updatePlayoffMatch, updateTeamStats } from '../../lib/queries';

const router = useRouter();
const allTeams = ref<any[]>([]);

const showGroupsSetup = ref(false);
const showKnockoutSetup = ref(false);

const groupSetup = ref({
  groupA: [null, null, null] as (string | null)[],
  groupB: [null, null, null] as (string | null)[]
});

const knockoutSetup = ref({
  groupA1: null as string | null,
  groupA2: null as string | null,
  groupB1: null as string | null,
  groupB2: null as string | null,
});

const matches = ref<any[]>([]);
const loadingMatches = ref(true);
const savingRoundKey = ref('');

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

const expandedRounds = reactive(new Set<string>());

const roundSaveKey = (stage: string, roundNum: number) => `${stage}-${roundNum}`;

/** Scores présents pour ce match ? (null / '-' sur les selects exclus) */
const scoreFilled = (raw: unknown) => raw != null && raw !== '' && !Number.isNaN(Number(raw));

const toggleRound = (stage: string, roundNumber: number) => {
  const key = `${stage}-${roundNumber}`;
  if (expandedRounds.has(key)) {
    expandedRounds.delete(key);
  } else {
    expandedRounds.add(key);
  }
};

const isRoundExpanded = (stage: string, roundNumber: number) => {
  return expandedRounds.has(`${stage}-${roundNumber}`);
};

onMounted(async () => {
  const { data } = await supabase.from('teams').select('*').order('name');
  if (data) allTeams.value = data;
  await loadMatches();
});

onUnmounted(() => {
  dismissToast();
});

const handleLogout = () => {
  localStorage.removeItem('admin_auth');
  router.push('/admin/login');
};

const loadMatches = async () => {
  loadingMatches.value = true;
  const { data, error } = await fetchPlayoffMatches();
  if (error) {
    console.error(error);
    showToast('Erreur chargement des matchs : ' + error.message, 'error');
    matches.value = [];
    loadingMatches.value = false;
    return;
  }
  matches.value = data ?? [];
  loadingMatches.value = false;
};

const scoreInputsLocked = (m: any) =>
  !!(m?.is_completed && m?.stage === 'knockout' && m?.winner_to_match_id);

const saveMatchVisible = (m: any) => !scoreInputsLocked(m);

const roundHasSaveTourButton = (roundMatches: any[]) => roundMatches.some((x) => saveMatchVisible(x));

const isBO3 = (m: any) => m?.stage === 'knockout' && m?.round === 2;


const handleGenerateChampionship = async () => {
  if (allTeams.value.length === 0) {
    showToast('Aucune équipe trouvée en base de données.', 'error');
    return;
  }

  const teamIds = allTeams.value.map(t => t.id);

  const rawMatches = generateChampionship(teamIds);
  
  const { error } = await generatePlayoffMatches(rawMatches, 'championship');
  
  if (error) {
    showToast('Erreur lors de la génération championship : ' + error.message, 'error');
  } else {
    await loadMatches();
    showToast('Matchs championship générés.', 'success');
  }
};

const handleGenerateGroups = async () => {
  if (groupSetup.value.groupA.some(t => !t) || groupSetup.value.groupB.some(t => !t)) {
    showToast('Sélectionne exactement 3 équipes dans le groupe A et 3 dans le groupe B.', 'error');
    return;
  }

  const allIds = [...groupSetup.value.groupA, ...groupSetup.value.groupB];
  const uniqueIds = new Set(allIds);
  if (uniqueIds.size !== 6) {
    showToast('Équipes en double : chaque slot doit être une équipe distincte.', 'error');
    return;
  }

  const rawMatchesA = generateGroupMatches(groupSetup.value.groupA as string[], 'group_a');
  const rawMatchesB = generateGroupMatches(groupSetup.value.groupB as string[], 'group_b');

  await generatePlayoffMatches(rawMatchesA, 'group_a');
  await generatePlayoffMatches(rawMatchesB, 'group_b');
  
  await loadMatches();
  showToast('Matchs de groupes générés.', 'success');
  showGroupsSetup.value = false;
};

const handleGenerateKnockout = async () => {
  const { groupA1, groupA2, groupB1, groupB2 } = knockoutSetup.value;
  
  if (!groupA1 || !groupA2 || !groupB1 || !groupB2) {
    showToast('Sélectionne les 4 équipes qualifiées.', 'error');
    return;
  }

  const selectedIds = [groupA1, groupA2, groupB1, groupB2];
  const uniqueIds = new Set(selectedIds);
  if (uniqueIds.size !== 4) {
    showToast('Équipes en double : chaque slot doit être une équipe distincte.', 'error');
    return;
  }

  const rawMatches = generateSingleEliminationBracket(selectedIds);
  const { error } = await generatePlayoffMatches(rawMatches, 'knockout');
  if (error) {
    showToast('Erreur génération knockout : ' + error.message, 'error');
  } else {
    await loadMatches();
    showToast('Tableau knockout généré.', 'success');
    showKnockoutSetup.value = false;
  }
};

const handleSaveRound = async (_stage: string, roundNum: number, roundMatches: any[]) => {
  const key = roundSaveKey(_stage, roundNum);
  const candidates = roundMatches
    .filter((m) => saveMatchVisible(m) && m.team1_id && m.team2_id)
    .slice()
    .sort((a, b) => (a.match_order ?? 0) - (b.match_order ?? 0));

  type Row = { m: any; s1: number; s2: number };
  const toSave: Row[] = [];

  for (const m of candidates) {
    if (!scoreFilled(m.team1_score) || !scoreFilled(m.team2_score)) continue;
    const s1 = Number(m.team1_score);
    const s2 = Number(m.team2_score);
    if (s1 === s2) {
      showToast(`Égalité interdite (M#${m.match_order}). Corrige le score puis réessaie.`, 'error');
      return;
    }
    toSave.push({ m, s1, s2 });
  }

  if (toSave.length === 0) {
    showToast(
      'Aucun match prêt : deux équipes et un score gagnant par ligne à enregistrer (les lignes vides sont ignorées).',
      'error'
    );
    return;
  }

  savingRoundKey.value = key;
  try {
    for (const { m, s1, s2 } of toSave) {
      const winnerId = s1 > s2 ? m.team1_id : m.team2_id;
      const { error } = await updatePlayoffMatch(
        m.id,
        { team1_score: s1, team2_score: s2, is_completed: true },
        winnerId,
        m.winner_to_match_id
      );
      if (error) {
        showToast(`Erreur M#${m.match_order} : ` + error.message, 'error');
        await loadMatches();
        return;
      }
    }
    await loadMatches();
    await recalculateStandingsSilent();
    showToast(
      toSave.length === 1 ? '1 match enregistré.' : `${toSave.length} matchs enregistrés.`,
      'success'
    );
  } finally {
    savingRoundKey.value = '';
  }
};

const recalculateStandingsSilent = async () => {
  const stats: Record<string, { wins: number, losses: number, points: number }> = {};
  
  allTeams.value.forEach(t => {
    stats[t.id] = { wins: 0, losses: 0, points: 0 };
  });

  matches.value.filter(m => m.stage === 'championship' && m.is_completed).forEach(m => {
    const score1 = Number(m.team1_score) || 0;
    const score2 = Number(m.team2_score) || 0;

    if (score1 > score2) {
      if (stats[m.team1_id]) { stats[m.team1_id].wins++; stats[m.team1_id].points += score1; }
      if (stats[m.team2_id]) { stats[m.team2_id].losses++; stats[m.team2_id].points += score2; }
    } else if (score2 > score1) {
      if (stats[m.team2_id]) { stats[m.team2_id].wins++; stats[m.team2_id].points += score2; }
      if (stats[m.team1_id]) { stats[m.team1_id].losses++; stats[m.team1_id].points += score1; }
    }
  });

  for (const [teamId, st] of Object.entries(stats)) {
    await updateTeamStats(teamId, st);
  }
};

const handleRecalculateStandings = async () => {
  await recalculateStandingsSilent();
  showToast('Classements recalculés.', 'success');
};

const formatBracketName = (name: string) => {
  if (name === 'championship') return 'CHAMPIONSHIP';
  if (name === 'group_a') return 'GROUP A';
  if (name === 'group_b') return 'GROUP B';
  if (name === 'knockout') return 'KNOCKOUT';
  return name.replace('_', ' ').toUpperCase();
};

const getRoundName = (bracket: string, round: number) => {
  if (bracket === 'knockout') {
    if (round === 1) return 'Semi-Finals';
    if (round === 2) return 'Final (BO3)';
  }
  return `Round ${round}`;
};

const getWinnerStatusClass = (match: any, teamNum: 1 | 2) => {
  if (!match.is_completed) return 'border-[#2A2A2A]';
  const isWinner = teamNum === 1 ? match.team1_score > match.team2_score : match.team2_score > match.team1_score;
  return isWinner ? 'border-[#22C55E] bg-[#22C55E]/10' : 'border-[#2A2A2A] opacity-50 grayscale';
};

const groupedMatches = computed(() => {
  const groups: Record<string, any> = {};

  for (const m of matches.value) {
    const b = m.stage;
    if (!groups[b]) groups[b] = { name: b, rounds: {} };
    if (!groups[b].rounds[m.round]) {
      groups[b].rounds[m.round] = { number: m.round, matches: [] };
    }
    groups[b].rounds[m.round].matches.push(m);
  }

  const bracketOrder = ['championship', 'group_a', 'group_b', 'knockout'];
  const orderedKeys = [...bracketOrder.filter((k) => groups[k]), ...Object.keys(groups).filter((k) => !bracketOrder.includes(k))];

  return orderedKeys
    .filter((k) => groups[k] && Object.keys(groups[k].rounds).length > 0)
    .map((k) => ({
      ...groups[k],
      rounds: Object.values(groups[k].rounds).sort((a: any, b: any) => a.number - b.number),
    }));
});
</script>
