<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] p-4 md:p-8 relative">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <img src="../../assets/mcu_logo.png" alt="MCU Logo" class="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
        <h1 class="text-2xl md:text-4xl font-title text-[#22C55E]">Admin Dashboard</h1>
      </div>
      <button @click="handleLogout" class="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#EF4444] hover:text-[#EF4444] text-xs font-bold uppercase tracking-widest rounded transition-colors" cursor-pointer>
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
          <button @click="handleRecalculateStandings" class="text-xs px-4 py-2 border border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/10 rounded font-bold transition-colors" cursor-pointer>
            Recalculate Standings
          </button>
          <button @click="loadMatches" class="text-xs px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#2A2A2A] rounded font-bold transition-colors" cursor-pointer>
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
            
            <button @click="toggleRound(bracketGroup.name, round.number)" 
                    class="flex items-center gap-2 w-full text-left mb-3 cursor-pointer group">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#A1A1AA] group-hover:text-[#22C55E] transition-transform" 
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
            
            <div v-show="isRoundExpanded(bracketGroup.name, round.number)" 
                 class="grid grid-cols-1 gap-3 mb-2"
                 :class="bracketGroup.name === 'group_a' || bracketGroup.name === 'group_b' ? 'xl:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'">
              <div v-for="match in round.matches" :key="match.id" class="bg-[#1A1A1A] p-3 border border-[#2A2A2A] rounded flex flex-col gap-2 transition-all hover:border-[#22C55E]/40"
                   :class="{ 'border-[#22C55E]/30 bg-[#0d130f]': match.is_completed }">
                   
                <div class="text-[10px] text-[#A1A1AA] font-bold tracking-widest flex justify-between items-center mb-1">
                  <span>M#{{ match.match_order }}</span>
                  <span v-if="match.is_completed" class="text-green-500 px-1.5 py-0.5 bg-green-500/10 rounded">DONE</span>
                </div>
                
                <div class="flex items-stretch justify-between gap-2 w-full">
                  <div class="flex-1 flex flex-col gap-1">
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
                  
                  <!-- Save Button -->
                  <div v-if="saveMatchVisible(match)" class="flex flex-col justify-center w-14">
                    <button @click="handleUpdateMatch(match)" 
                            :disabled="!match.team1_id || !match.team2_id" 
                            class="h-full w-full flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase bg-[#2A2A2A] hover:bg-[#22C55E] hover:text-[#0B0F0C] text-[#F0FDF4] transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-[#4ADE80]" cursor-pointer title="Save Score">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      SAVE
                    </button>
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
import { ref, computed, onMounted, reactive } from 'vue';
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

const expandedRounds = reactive(new Set<string>());

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

const handleLogout = () => {
  localStorage.removeItem('admin_auth');
  router.push('/admin/login');
};

const loadMatches = async () => {
  loadingMatches.value = true;
  const { data, error } = await fetchPlayoffMatches();
  if (error) {
    console.error(error);
    alert('Erreur chargement des matchs: ' + error.message);
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

const isBO3 = (m: any) => m?.stage === 'knockout' && m?.round === 2;

const getTeamName = (teamId: string | null) => {
  if (!teamId) return "TBD";
  const team = allTeams.value.find(t => t.id === teamId);
  return team ? team.name : "TBD";
};

const generateDraftsForMatches = async (matchesToDraft: any[]) => {
  const apiKey = "DRAFTER-59605981-E026-439E-BAFC-3C532CF18FB1";
  
  const { data: champions } = await supabase
    .from("champions")
    .select("name, image_url")
    .eq("is_available", false);
    
  const disabledChampions = (champions || []).map((c) => {
    if (c.image_url) {
      const parts = c.image_url.split('/');
      return parts[parts.length - 1].replace('.png', '');
    }
    return c.name.replace(/[^a-zA-Z0-9]/g, '');
  });

  for (const match of matchesToDraft) {
    if (!match.team1_id || !match.team2_id) continue;
    
    const blueName = getTeamName(match.team1_id);
    const redName = getTeamName(match.team2_id);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-draft", {
        body: {
          blueName,
          redName,
          disabledChampions,
          apiKey
        }
      });
      
      if (error) {
        console.error(`Error from generate-draft for ${blueName} vs ${redName}:`, error);
      } else {
        console.log(`Successfully generated draft for ${blueName} vs ${redName}`);
      }
      
      if (!error && data?.draftUrl) {
        match.draft_url = data.draftUrl;
        match.draft_id = data.draftId || "";
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {
      console.error("Failed to generate draft for match", match.id, e);
    }
  }
  
  return matchesToDraft;
};

const handleGenerateChampionship = async () => {
  if (allTeams.value.length === 0) {
    return alert('Aucune équipe trouvée en base de données.');
  }

  const teamIds = allTeams.value.map(t => t.id);

  if (!confirm('Generate Championship Matches? This will overwrite existing championship matches.')) return;

  const rawMatches = generateChampionship(teamIds);
  
  alert('Génération des liens Drafter en cours... Veuillez patienter.');
  const generatedMatches = await generateDraftsForMatches(rawMatches);

  const { error } = await generatePlayoffMatches(generatedMatches, 'championship');
  
  if (error) {
    alert('Error generating championship: ' + error.message);
  } else {
    await loadMatches();
    alert('Championship Matches Generated!');
  }
};

const handleGenerateGroups = async () => {
  if (groupSetup.value.groupA.some(t => !t) || groupSetup.value.groupB.some(t => !t)) {
    return alert('Please select exactly 3 teams for both Group A and Group B.');
  }

  const allIds = [...groupSetup.value.groupA, ...groupSetup.value.groupB];
  const uniqueIds = new Set(allIds);
  if (uniqueIds.size !== 6) {
    return alert('You have selected duplicate teams. Each spot must be filled by a distinct team.');
  }

  if (!confirm('Generate Group Matches? This will overwrite existing group matches.')) return;

  const rawMatchesA = generateGroupMatches(groupSetup.value.groupA as string[], 'group_a');
  const rawMatchesB = generateGroupMatches(groupSetup.value.groupB as string[], 'group_b');

  alert('Génération des liens Drafter en cours... Veuillez patienter.');
  const matchesA = await generateDraftsForMatches(rawMatchesA);
  const matchesB = await generateDraftsForMatches(rawMatchesB);

  await generatePlayoffMatches(matchesA, 'group_a');
  await generatePlayoffMatches(matchesB, 'group_b');
  
  await loadMatches();
  alert('Group Matches Generated!');
  showGroupsSetup.value = false;
};

const handleGenerateKnockout = async () => {
  const { groupA1, groupA2, groupB1, groupB2 } = knockoutSetup.value;
  
  if (!groupA1 || !groupA2 || !groupB1 || !groupB2) {
    return alert('Please select all 4 advancing teams.');
  }

  const selectedIds = [groupA1, groupA2, groupB1, groupB2];
  const uniqueIds = new Set(selectedIds);
  if (uniqueIds.size !== 4) {
    return alert('You have selected duplicate teams. Each spot must be filled by a distinct team.');
  }

  if (!confirm('Are you sure? This will delete the current knockout bracket and generate a new one.')) return;
  
  const rawMatches = generateSingleEliminationBracket(selectedIds);
  alert('Génération des liens Drafter en cours... Veuillez patienter.');
  const newMatches = await generateDraftsForMatches(rawMatches);
  const { error } = await generatePlayoffMatches(newMatches, 'knockout');
  if (error) {
    alert('Error generating knockout: ' + error.message);
  } else {
    await loadMatches();
    alert('Knockout Bracket Generated!');
    showKnockoutSetup.value = false;
  }
};

const handleUpdateMatch = async (match: any) => {
  const advances = !!match.winner_to_match_id;
  const confirmMsg = advances
    ? 'Enregistrer les scores et faire avancer le gagnant vers le match suivant ?'
    : 'Enregistrer les scores pour ce match ?';

  if (!confirm(confirmMsg)) return;

  const score1 = Number(match.team1_score) || 0;
  const score2 = Number(match.team2_score) || 0;

  let winnerId = null;

  if (score1 > score2) {
    winnerId = match.team1_id;
  } else if (score2 > score1) {
    winnerId = match.team2_id;
  } else {
    return alert('Égalités interdites.');
  }

  const { error } = await updatePlayoffMatch(
    match.id,
    { team1_score: score1, team2_score: score2, is_completed: true },
    winnerId,
    match.winner_to_match_id
  );

  if (error) {
    alert('Erreur: ' + error.message);
  } else {
    await loadMatches();
    await recalculateStandingsSilent();
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
  if (!confirm('Recalculate all team standings based on match results?')) return;
  
  await recalculateStandingsSilent();
  alert('Standings recalculated successfully!');
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
