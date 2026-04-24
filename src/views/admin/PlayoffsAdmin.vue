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

    <!-- Regular Season Section -->
    <div class="mb-12 bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm">
      <h2 class="text-2xl font-bold mb-4">1. Regular Season Standings</h2>
      <p class="text-[#A1A1AA] text-sm mb-6">Update team records directly. Points determine seeding.</p>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-for="team in allTeams" :key="team.id" class="bg-[#1A1A1A] p-4 border border-[#2A2A2A] rounded flex flex-col md:flex-row items-center justify-between gap-4">
          <span class="font-bold text-[#F0FDF4] text-lg w-full md:w-1/3">{{ team.name }}</span>
          
          <div class="flex items-center gap-4 text-sm w-full md:w-auto">
            <div class="flex flex-col items-center">
              <label class="text-[#A1A1AA] text-xs font-bold mb-1">Wins</label>
              <input type="number" v-model.number="team.wins" class="w-16 bg-[#111111] border border-[#2A2A2A] text-center rounded p-1 focus:border-[#22C55E] focus:outline-none" />
            </div>
            <div class="flex flex-col items-center">
              <label class="text-[#A1A1AA] text-xs font-bold mb-1">Losses</label>
              <input type="number" v-model.number="team.losses" class="w-16 bg-[#111111] border border-[#2A2A2A] text-center rounded p-1 focus:border-[#22C55E] focus:outline-none" />
            </div>
            <div class="flex flex-col items-center">
              <label class="text-[#A1A1AA] text-xs font-bold mb-1 text-[#22C55E]">Points</label>
              <input type="number" v-model.number="team.points" class="w-16 bg-[#111111] border border-[#22C55E]/50 text-center rounded p-1 focus:border-[#22C55E] focus:outline-none" />
            </div>
          </div>
          
          <button @click="handleUpdateTeam(team)" class="px-4 py-2 bg-[#2A2A2A] hover:bg-[#22C55E] text-[#F0FDF4] hover:text-[#0B0F0C] text-xs font-bold uppercase rounded transition-colors w-full md:w-auto whitespace-nowrap" cursor-pointer>
            Save Stats
          </button>
        </div>
      </div>
    </div>

    <!-- Setup Section -->
    <div class="mb-12 bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm">
      <h2 class="text-2xl font-bold mb-4">2. Select Playoff Teams</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <label v-for="team in allTeams" :key="team.id" class="flex items-center gap-2 cursor-pointer p-2 hover:bg-[#1A1A1A] rounded border border-transparent hover:border-[#2A2A2A] transition-colors">
          <input type="checkbox" :value="team.id" v-model="selectedTeamIds" class="w-4 h-4 accent-[#22C55E] bg-[#0B0F0C] border-[#2A2A2A]" />
          <span>{{ team.name }}</span>
        </label>
      </div>
      <button @click="handleGenerateBracket" class="px-6 py-2 bg-[#22C55E] text-[#0B0F0C] font-bold rounded-sm hover:bg-[#d9b876] transition-colors" cursor-pointer>
        Generate Bracket (Overwrites existing!)
      </button>
    </div>

    <!-- Management Section -->
    <div class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">3. Manage Matches</h2>
        <button @click="loadMatches" class="text-xs px-4 py-2 border border-[#2A2A2A] hover:bg-[#1A1A1A] rounded" cursor-pointer>Refresh</button>
      </div>
      
      <div v-if="loadingMatches" class="text-[#A1A1AA] animate-pulse">Loading matches...</div>
      <div v-else-if="matches.length === 0" class="text-[#A1A1AA] p-6 bg-[#111111] rounded border border-[#2A2A2A]">
        No active playoff bracket. Select teams and generate one above.
      </div>
      
      <div v-else class="space-y-12">
        <div v-for="bracketGroup in groupedMatches" :key="bracketGroup.name" class="bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm relative overflow-hidden">
          <!-- Background decoration -->
          <div class="absolute right-0 top-0 w-64 h-64 bg-[#22C55E] opacity-[0.03] blur-[100px] pointer-events-none"></div>
          
          <h3 class="text-xl font-title mb-6" 
              :class="bracketGroup.name === 'upper' ? 'text-[#4ADE80]' : bracketGroup.name === 'lower' ? 'text-[#EF4444]' : 'text-[#22C55E]'">
            {{ bracketGroup.name.replace('_', ' ').toUpperCase() }} BRACKET
          </h3>
          
          <div v-for="round in bracketGroup.rounds" :key="round.number" class="mb-8 pl-4 border-l-2 border-[#2A2A2A]">
            <h4 class="text-lg font-bold mb-4 text-[#A1A1AA] uppercase tracking-widest text-sm">Round {{ round.number }}</h4>
            
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
                           :disabled="match.is_completed" />
                  </div>
                  <!-- Team 2 -->
                  <div class="flex items-center justify-between bg-[#0B0F0C] p-2 rounded border transition-colors"
                       :class="getWinnerStatusClass(match, 2)">
                    <span :class="match.team2 ? 'text-[#F0FDF4] font-bold' : 'text-[#A1A1AA] italic'">{{ match.team2?.name || 'TBD' }}</span>
                    <input type="number" v-model.number="match.team2_score" 
                           class="w-16 bg-[#111111] border border-[#2A2A2A] text-center rounded p-1 font-bold focus:border-[#22C55E] focus:outline-none" 
                           :disabled="match.is_completed" />
                  </div>
                </div>

                <div class="mt-2 text-right">
                  <button v-if="!match.is_completed" 
                          @click="handleUpdateMatch(match)" 
                          :disabled="!match.team1_id || !match.team2_id" 
                          class="px-4 py-2 w-full text-xs font-bold uppercase tracking-widest bg-[#2A2A2A] hover:bg-[#22C55E] hover:text-[#0B0F0C] text-[#F0FDF4] transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed" cursor-pointer>
                    Save & Advance
                  </button>
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
import { generateDoubleEliminationBracket } from '../../lib/bracket';
import { fetchPlayoffMatches, generatePlayoffMatches, updatePlayoffMatch, updateTeamStats } from '../../lib/queries';

const router = useRouter();
const allTeams = ref<any[]>([]);
const selectedTeamIds = ref<string[]>([]);
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

const handleUpdateTeam = async (team: any) => {
  const { error } = await updateTeamStats(team.id, {
    wins: team.wins,
    losses: team.losses,
    points: team.points
  });
  if (error) alert('Error updating team: ' + error.message);
  // Optional: show a small toast, but alert is fine for admin MVP
};

const loadMatches = async () => {
  loadingMatches.value = true;
  const { data } = await fetchPlayoffMatches();
  if (data) matches.value = data;
  loadingMatches.value = false;
};

const handleGenerateBracket = async () => {
  if (selectedTeamIds.value.length < 2) return alert('Select at least 2 teams');
  if (!confirm('Are you sure? This will delete the current bracket and lock all teams in. Make sure you selected teams in their seeded order (1st plays last, etc.).')) return;
  
  const newMatches = generateDoubleEliminationBracket(selectedTeamIds.value);
  const { error } = await generatePlayoffMatches(newMatches);
  if (error) {
    alert('Error generating bracket: ' + error.message);
  } else {
    await loadMatches();
    alert('Bracket successfully generated!');
  }
};

const handleUpdateMatch = async (match: any) => {
  if (!confirm('Save score and advance winner? This locks the match.')) return;
  
  const score1 = match.team1_score || 0;
  const score2 = match.team2_score || 0;
  
  let winnerId = null;
  let loserId = null;
  
  if (score1 > score2) {
    winnerId = match.team1_id;
    loserId = match.team2_id;
  } else if (score2 > score1) {
    winnerId = match.team2_id;
    loserId = match.team1_id;
  } else {
    return alert('Ties are not allowed.');
  }

  const { error } = await updatePlayoffMatch(
    match.id,
    { team1_score: score1, team2_score: score2, is_completed: true },
    winnerId,
    loserId,
    match.winner_to_match_id,
    match.loser_to_match_id
  );

  if (error) alert('Error updating match: ' + error.message);
  else await loadMatches();
};

const getWinnerStatusClass = (match: any, teamNum: 1 | 2) => {
  if (!match.is_completed) return 'border-[#2A2A2A]';
  const isWinner = teamNum === 1 ? match.team1_score > match.team2_score : match.team2_score > match.team1_score;
  return isWinner ? 'border-[#22C55E] bg-[#22C55E]/10' : 'border-[#2A2A2A] opacity-50 grayscale';
};

const groupedMatches = computed(() => {
  const groups: Record<string, any> = {
    upper: { name: 'upper', rounds: {} },
    lower: { name: 'lower', rounds: {} },
    grand_finals: { name: 'grand_finals', rounds: {} }
  };

  for (const m of matches.value) {
    const b = m.bracket;
    if (!groups[b]) continue;
    if (!groups[b].rounds[m.round]) {
      groups[b].rounds[m.round] = { number: m.round, matches: [] };
    }
    groups[b].rounds[m.round].matches.push(m);
  }

  return [
    { ...groups.upper, rounds: Object.values(groups.upper.rounds).sort((a: any, b: any) => a.number - b.number) },
    { ...groups.lower, rounds: Object.values(groups.lower.rounds).sort((a: any, b: any) => a.number - b.number) },
    { ...groups.grand_finals, rounds: Object.values(groups.grand_finals.rounds).sort((a: any, b: any) => a.number - b.number) }
  ].filter(g => g.rounds.length > 0);
});
</script>
