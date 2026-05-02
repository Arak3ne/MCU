<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] p-8 relative">
    <div class="flex justify-between items-center mb-8">
      <div class="flex items-center gap-4">
        <img src="../../assets/mcu_logo.png" alt="MCU Logo" class="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
        <h1 class="text-4xl font-title text-[#22C55E]">Playoffs Admin</h1>
      </div>
      <button @click="handleLogout" class="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#EF4444] hover:text-[#EF4444] text-xs font-bold uppercase tracking-widest rounded transition-colors" cursor-pointer>
        Logout
      </button>
    </div>

    <!-- Step 1: Setup Championship Phase -->
    <div class="mb-12 bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm">
      <h2 class="text-2xl font-bold mb-4">1. Setup Championship (Regular Season)</h2>
      <p class="text-[#A1A1AA] text-sm mb-6">Select the 6 teams participating in the tournament. Generating will create a Round Robin schedule and overwrite existing championship matches.</p>
      
      <div class="bg-[#1A1A1A] p-4 rounded border border-[#2A2A2A] mb-6">
        <h3 class="text-xl font-bold mb-4 text-[#22C55E]">Championship Teams</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="i in 6" :key="`champ-${i}`" class="flex flex-col gap-2">
            <label class="text-sm font-bold text-[#A1A1AA]">Team {{ i }}</label>
            <select v-model="championshipSetup[i-1]" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-2 rounded focus:border-[#22C55E] focus:outline-none">
              <option :value="null">-- Select Team --</option>
              <option v-for="team in allTeams" :key="`tc-${i}-${team.id}`" :value="team.id">{{ team.name }}</option>
            </select>
          </div>
        </div>
      </div>
      
      <button @click="handleGenerateChampionship" class="px-6 py-3 bg-[#22C55E] text-[#0B0F0C] font-bold rounded-sm hover:bg-[#4ADE80] transition-colors w-full md:w-auto" cursor-pointer>
        Generate Championship Matches
      </button>
    </div>

    <!-- Step 1: Setup Group Stage -->
    <div class="mb-12 bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm">
      <h2 class="text-2xl font-bold mb-4">1. Setup Playoff Groups (Phase 1)</h2>
      <p class="text-[#A1A1AA] text-sm mb-6">Select the 6 teams participating in the playoffs and assign them to Group A and Group B (3 teams each). Generating will overwrite existing group matches.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <!-- Group A Teams -->
        <div class="bg-[#1A1A1A] p-4 rounded border border-[#2A2A2A]">
          <h3 class="text-xl font-bold mb-4 text-[#22C55E]">Group A Teams</h3>
          <div class="space-y-4">
            <div v-for="i in 3" :key="`gA-${i}`" class="flex flex-col gap-2">
              <label class="text-sm font-bold text-[#A1A1AA]">Team {{ i }}</label>
              <select v-model="groupSetup.groupA[i-1]" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-2 rounded focus:border-[#22C55E] focus:outline-none">
                <option :value="null">-- Select Team --</option>
                <option v-for="team in allTeams" :key="`tA-${i}-${team.id}`" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Group B Teams -->
        <div class="bg-[#1A1A1A] p-4 rounded border border-[#2A2A2A]">
          <h3 class="text-xl font-bold mb-4 text-[#22C55E]">Group B Teams</h3>
          <div class="space-y-4">
            <div v-for="i in 3" :key="`gB-${i}`" class="flex flex-col gap-2">
              <label class="text-sm font-bold text-[#A1A1AA]">Team {{ i }}</label>
              <select v-model="groupSetup.groupB[i-1]" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-2 rounded focus:border-[#22C55E] focus:outline-none">
                <option :value="null">-- Select Team --</option>
                <option v-for="team in allTeams" :key="`tB-${i}-${team.id}`" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <button @click="handleGenerateGroups" class="px-6 py-3 bg-[#22C55E] text-[#0B0F0C] font-bold rounded-sm hover:bg-[#4ADE80] transition-colors w-full md:w-auto" cursor-pointer>
        Generate Group Matches
      </button>
    </div>

    <!-- Step 2: Setup Knockout Stage -->
    <div class="mb-12 bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm">
      <h2 class="text-2xl font-bold mb-4">2. Setup Knockout Stage (Phase 2)</h2>
      <p class="text-[#A1A1AA] text-sm mb-6">Select the advancing teams from the groups. The system will create Semi-Finals (1A vs 2B, 1B vs 2A) and a BO3 Final.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <!-- Group A Results -->
        <div class="bg-[#1A1A1A] p-4 rounded border border-[#2A2A2A]">
          <h3 class="text-xl font-bold mb-4 text-[#22C55E]">Group A Results</h3>
          <div class="space-y-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-[#A1A1AA]">1st Place Group A</label>
              <select v-model="knockoutSetup.groupA1" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-2 rounded focus:border-[#22C55E] focus:outline-none">
                <option :value="null">-- Select Team --</option>
                <option v-for="team in allTeams" :key="`ka1-${team.id}`" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-[#A1A1AA]">2nd Place Group A</label>
              <select v-model="knockoutSetup.groupA2" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-2 rounded focus:border-[#22C55E] focus:outline-none">
                <option :value="null">-- Select Team --</option>
                <option v-for="team in allTeams" :key="`ka2-${team.id}`" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Group B Results -->
        <div class="bg-[#1A1A1A] p-4 rounded border border-[#2A2A2A]">
          <h3 class="text-xl font-bold mb-4 text-[#22C55E]">Group B Results</h3>
          <div class="space-y-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-[#A1A1AA]">1st Place Group B</label>
              <select v-model="knockoutSetup.groupB1" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-2 rounded focus:border-[#22C55E] focus:outline-none">
                <option :value="null">-- Select Team --</option>
                <option v-for="team in allTeams" :key="`kb1-${team.id}`" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-[#A1A1AA]">2nd Place Group B</label>
              <select v-model="knockoutSetup.groupB2" class="bg-[#0B0F0C] border border-[#2A2A2A] text-[#F0FDF4] p-2 rounded focus:border-[#22C55E] focus:outline-none">
                <option :value="null">-- Select Team --</option>
                <option v-for="team in allTeams" :key="`kb2-${team.id}`" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <button @click="handleGenerateKnockout" class="px-6 py-3 bg-[#22C55E] text-[#0B0F0C] font-bold rounded-sm hover:bg-[#4ADE80] transition-colors w-full md:w-auto" cursor-pointer>
        Generate Knockout Bracket
      </button>
    </div>

    <!-- Management Section -->
    <div class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">4. Manage Matches</h2>
        <div class="flex gap-4">
          <button @click="handleRecalculateStandings" class="text-xs px-4 py-2 border border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/10 rounded" cursor-pointer>Recalculate Standings</button>
          <button @click="loadMatches" class="text-xs px-4 py-2 border border-[#2A2A2A] hover:bg-[#1A1A1A] rounded" cursor-pointer>Refresh</button>
        </div>
      </div>
      
      <div v-if="loadingMatches" class="text-[#A1A1AA] animate-pulse">Loading matches...</div>
      <div v-else-if="matches.length === 0" class="text-[#A1A1AA] p-6 bg-[#111111] rounded border border-[#2A2A2A]">
        Aucun match. Générez d'abord les matchs championship, puis les groupes et le knockout si besoin.
      </div>
      
      <div v-else class="space-y-12">
        <div v-for="bracketGroup in groupedMatches" :key="bracketGroup.name" class="bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm relative overflow-hidden">
          <!-- Background decoration -->
          <div class="absolute right-0 top-0 w-64 h-64 bg-[#22C55E] opacity-[0.03] blur-[100px] pointer-events-none"></div>
          
          <h3 class="text-xl font-title mb-6 text-[#22C55E]">
            {{ formatBracketName(bracketGroup.name) }}
          </h3>
          
          <div v-for="round in bracketGroup.rounds" :key="round.number" class="mb-8 pl-4 border-l-2 border-[#2A2A2A]">
            <h4 class="text-lg font-bold mb-4 text-[#A1A1AA] uppercase tracking-widest text-sm">
              {{ getRoundName(bracketGroup.name, round.number) }}
            </h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="match in round.matches" :key="match.id" class="bg-[#1A1A1A] p-4 border border-[#2A2A2A] rounded flex flex-col gap-3 relative transition-all"
                   :class="match.is_completed ? 'border-[#22C55E]/30 bg-[#111111]' : 'hover:border-[#22C55E]/50'">
                   
                <div class="text-xs text-[#A1A1AA] mb-2 font-bold tracking-widest flex justify-between">
                  <span>MATCH {{ match.match_order }}</span>
                  <span v-if="match.is_completed" class="text-green-500">COMPLETED</span>
                </div>
                
                <div class="flex flex-col gap-2 w-full">
                  <!-- Team 1 -->
                  <div class="flex items-center justify-between bg-[#0B0F0C] p-2 rounded border transition-colors"
                       :class="getWinnerStatusClass(match, 1)">
                    <span :class="match.team1 ? 'text-[#F0FDF4] font-bold' : 'text-[#A1A1AA] italic'">{{ match.team1?.name || 'TBD' }}</span>
                    <input type="number" v-model.number="match.team1_score" 
                           class="w-16 bg-[#111111] border border-[#2A2A2A] text-center rounded p-1 font-bold focus:border-[#22C55E] focus:outline-none" 
                           :disabled="scoreInputsLocked(match)" />
                  </div>
                  <!-- Team 2 -->
                  <div class="flex items-center justify-between bg-[#0B0F0C] p-2 rounded border transition-colors"
                       :class="getWinnerStatusClass(match, 2)">
                    <span :class="match.team2 ? 'text-[#F0FDF4] font-bold' : 'text-[#A1A1AA] italic'">{{ match.team2?.name || 'TBD' }}</span>
                    <input type="number" v-model.number="match.team2_score" 
                           class="w-16 bg-[#111111] border border-[#2A2A2A] text-center rounded p-1 font-bold focus:border-[#22C55E] focus:outline-none" 
                           :disabled="scoreInputsLocked(match)" />
                  </div>
                </div>

                <div class="mt-2 text-right">
                  <button v-if="saveMatchVisible(match)" 
                          @click="handleUpdateMatch(match)" 
                          :disabled="!match.team1_id || !match.team2_id" 
                          class="px-4 py-2 w-full text-xs font-bold uppercase tracking-widest bg-[#2A2A2A] hover:bg-[#22C55E] hover:text-[#0B0F0C] text-[#F0FDF4] transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed" cursor-pointer>
                    {{ saveMatchButtonLabel(match) }}
                  </button>
                  <p v-if="scoreInputsLocked(match)" class="text-[10px] text-[#A1A1AA] mt-2 text-center">
                    Demi-finales verrouillées après validation (winner avancé). Corrige manuellement en base si erreur.
                  </p>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../lib/supabase';
import { generateGroupMatches, generateSingleEliminationBracket, generateChampionship } from '../../lib/bracket';
import { fetchPlayoffMatches, generatePlayoffMatches, updatePlayoffMatch, updateTeamStats } from '../../lib/queries';

const router = useRouter();
const allTeams = ref<any[]>([]);

const championshipSetup = ref<(string | null)[]>([null, null, null, null, null, null]);

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

/** Knockout rounds that slot the winner into the next match stay locked once saved. */
const scoreInputsLocked = (m: any) =>
  !!(m?.is_completed && m?.stage === 'knockout' && m?.winner_to_match_id);

const saveMatchVisible = (m: any) => !scoreInputsLocked(m);

const saveMatchButtonLabel = (m: any) =>
  m?.winner_to_match_id ? 'Valider et faire avancer' : 'Enregistrer le score';

const handleGenerateChampionship = async () => {
  if (championshipSetup.value.some(t => !t)) {
    return alert('Please select exactly 6 teams for the Championship phase.');
  }

  const uniqueIds = new Set(championshipSetup.value);
  if (uniqueIds.size !== 6) {
    return alert('You have selected duplicate teams. Each spot must be filled by a distinct team.');
  }

  if (!confirm('Generate Championship Matches? This will overwrite existing championship matches.')) return;

  const matches = generateChampionship(championshipSetup.value as string[]);

  const { error } = await generatePlayoffMatches(matches, 'championship');
  
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

  const matchesA = generateGroupMatches(groupSetup.value.groupA as string[], 'group_a');
  const matchesB = generateGroupMatches(groupSetup.value.groupB as string[], 'group_b');

  // Clear existing group matches and insert new
  await generatePlayoffMatches(matchesA, 'group_a');
  await generatePlayoffMatches(matchesB, 'group_b');
  
  await loadMatches();
  alert('Group Matches Generated!');
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
  
  const newMatches = generateSingleEliminationBracket(selectedIds);
  const { error } = await generatePlayoffMatches(newMatches, 'knockout');
  if (error) {
    alert('Error generating knockout: ' + error.message);
  } else {
    await loadMatches();
    alert('Knockout Bracket Generated!');
  }
};

const handleUpdateMatch = async (match: any) => {
  const advances = !!match.winner_to_match_id;
  const confirmMsg = advances
    ? 'Enregistrer les scores et faire avancer le gagnant vers le match suivant ? Ce match sera verrouillé.'
    : match.stage === 'championship'
      ? 'Enregistrer les scores pour ce match de championnat ? Tu pourras les modifier ensuite si besoin, puis « Recalculate Standings ».'
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

  if (error) alert('Erreur: ' + error.message);
  else await loadMatches();
};

const handleRecalculateStandings = async () => {
  if (!confirm('Recalculate all team standings based on Championship match results?')) return;
  
  const stats: Record<string, { wins: number, losses: number, points: number }> = {};
  
  // Initialize all teams
  allTeams.value.forEach(t => {
    stats[t.id] = { wins: 0, losses: 0, points: 0 };
  });

  // Calculate from championship matches only
  matches.value.filter(m => m.stage === 'championship' && m.is_completed).forEach(m => {
    if (m.team1_score > m.team2_score) {
      if (stats[m.team1_id]) { stats[m.team1_id].wins++; stats[m.team1_id].points++; }
      if (stats[m.team2_id]) { stats[m.team2_id].losses++; }
    } else if (m.team2_score > m.team1_score) {
      if (stats[m.team2_id]) { stats[m.team2_id].wins++; stats[m.team2_id].points++; }
      if (stats[m.team1_id]) { stats[m.team1_id].losses++; }
    }
  });

  let hasError = false;
  for (const [teamId, st] of Object.entries(stats)) {
    const { error } = await updateTeamStats(teamId, st);
    if (error) {
      console.error(error);
      hasError = true;
    }
  }
  
  if (hasError) alert('Some team stats could not be updated. Check console.');
  else alert('Standings recalculated successfully!');
};

const formatBracketName = (name: string) => {
  if (name === 'championship') return 'CHAMPIONSHIP (REGULAR SEASON)';
  if (name === 'group_a') return 'GROUP A STAGE';
  if (name === 'group_b') return 'GROUP B STAGE';
  if (name === 'knockout') return 'KNOCKOUT STAGE';
  return name.replace('_', ' ').toUpperCase();
};

const getRoundName = (bracket: string, round: number) => {
  if (bracket === 'knockout') {
    if (round === 1) return 'Semi-Finals';
    if (round === 2) return 'Final (BO3)';
  }
  if (bracket === 'championship') return `Ronde ${round}`;
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
