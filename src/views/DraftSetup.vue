<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] pb-20">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header class="space-y-3 text-center">
        <p class="text-xs uppercase tracking-[0.25em] text-[#22C55E]">Draft Tool</p>
        <h1 class="text-5xl font-title uppercase tracking-wider drop-shadow-[0_0_15px_rgba(34,197,94,0.2)]">Créer une draft</h1>
        <p class="text-[#A1A1AA] text-sm max-w-lg mx-auto">
          Configure les équipes et les capitaines avant d’ouvrir la room.
        </p>
      </header>

      <section class="space-y-8">
        <div v-if="loading" class="py-12 flex justify-center items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
          <span class="ml-3 text-[#A1A1AA]">Chargement des équipes...</span>
        </div>
        
        <div v-else class="relative">
          <!-- VS Separator -->
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 rounded-full bg-[#0B0F0C] border border-[#2A2A2A] shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <span class="font-title text-2xl text-[#22C55E]">VS</span>
          </div>

          <div class="grid md:grid-cols-2 gap-8 md:gap-6 relative">
            <!-- Equipe 1 -->
            <div class="bg-[#111111]/80 backdrop-blur-sm border border-[#2A2A2A] rounded-lg p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden group">
              <!-- Subtil glow effet -->
              <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[60px] pointer-events-none -mr-20 -mt-20"></div>
              
              <div class="space-y-6 relative z-10">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-8 bg-[#2A2A2A] rounded-sm shadow-[0_0_10px_rgba(255,255,255,0.05)]"></div>
                  <h2 class="font-title text-3xl tracking-wider text-white">Équipe 1</h2>
                </div>
                
                <label class="block space-y-2">
                  <span class="text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">Sélectionner l'équipe</span>
                  <div class="relative">
                    <select v-model="team1Id" class="w-full bg-[#0B0F0C] border border-[#2A2A2A] hover:border-white/40 focus:border-white focus:ring-1 focus:ring-white/50 outline-none px-4 py-3 rounded-md transition-all text-sm appearance-none cursor-pointer">
                      <option value="">Sélectionner une équipe</option>
                      <option v-for="team in teamOptionsForTeam1" :key="team.id" :value="team.id">{{ team.name }}</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#A1A1AA]">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </label>

                <div class="space-y-2" :class="{'opacity-50 pointer-events-none': !selectedTeam1}">
                  <span class="text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">Capitaine</span>
                  <div class="relative">
                    <select
                      v-model="captainTeam1Id"
                      :disabled="!captainTestMode || !selectedTeam1"
                      class="w-full bg-[#0B0F0C] border border-[#2A2A2A] hover:border-white/40 focus:border-white focus:ring-1 focus:ring-white/50 outline-none px-4 py-3 rounded-md transition-all text-sm appearance-none disabled:cursor-not-allowed"
                    >
                      <option value="">Sélectionner un capitaine</option>
                      <option v-for="player in captainOptionsTeam1" :key="player.id" :value="player.id">
                        {{ playerLabel(player) }}
                      </option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#A1A1AA]">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Equipe 2 -->
            <div class="bg-[#111111]/80 backdrop-blur-sm border border-[#2A2A2A] rounded-lg p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden group">
              <!-- Subtil glow effet -->
              <div class="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[60px] pointer-events-none -ml-20 -mt-20"></div>

              <div class="space-y-6 relative z-10">
                <div class="flex items-center justify-end md:justify-start gap-3">
                  <div class="w-3 h-8 bg-[#2A2A2A] rounded-sm shadow-[0_0_10px_rgba(255,255,255,0.05)] md:order-first order-last"></div>
                  <h2 class="font-title text-3xl tracking-wider text-white text-right md:text-left">Équipe 2</h2>
                </div>
                
                <label class="block space-y-2">
                  <span class="text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">Sélectionner l'équipe</span>
                  <div class="relative">
                    <select v-model="team2Id" class="w-full bg-[#0B0F0C] border border-[#2A2A2A] hover:border-white/40 focus:border-white focus:ring-1 focus:ring-white/50 outline-none px-4 py-3 rounded-md transition-all text-sm appearance-none cursor-pointer">
                      <option value="">Sélectionner une équipe</option>
                      <option v-for="team in teamOptionsForTeam2" :key="team.id" :value="team.id">{{ team.name }}</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#A1A1AA]">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </label>

                <div class="space-y-2" :class="{'opacity-50 pointer-events-none': !selectedTeam2}">
                  <span class="text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">Capitaine</span>
                  <div class="relative">
                    <select
                      v-model="captainTeam2Id"
                      :disabled="!captainTestMode || !selectedTeam2"
                      class="w-full bg-[#0B0F0C] border border-[#2A2A2A] hover:border-white/40 focus:border-white focus:ring-1 focus:ring-white/50 outline-none px-4 py-3 rounded-md transition-all text-sm appearance-none disabled:cursor-not-allowed"
                    >
                      <option value="">Sélectionner un capitaine</option>
                      <option v-for="player in captainOptionsTeam2" :key="player.id" :value="player.id">
                        {{ playerLabel(player) }}
                      </option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#A1A1AA]">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showCaptainTestToggle" class="bg-[#111111] border border-[#2A2A2A] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <span class="text-sm font-bold uppercase tracking-widest text-[#F0FDF4]">Mode test capitaine</span>
            <p class="text-xs text-[#71717A]">
              OFF: auto (premier joueur). ON: override manuel pour tester.
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0">
            <input v-model="captainTestMode" type="checkbox" class="sr-only peer" />
            <div class="w-11 h-6 bg-[#0B0F0C] border border-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#A1A1AA] peer-checked:after:bg-[#F0FDF4] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E] peer-checked:border-[#22C55E]"></div>
          </label>
        </div>

        <div class="flex flex-col items-center gap-4 pt-6">
          <p v-if="errorMessage" class="text-sm text-red-400 bg-red-400/10 px-5 py-3 rounded-md border border-red-400/20 shadow-lg">{{ errorMessage }}</p>
          <button
            :disabled="!canCreate || creating"
            @click="createDraftSession"
            class="px-10 py-4 rounded-md text-sm font-bold tracking-[0.2em] uppercase transition-all min-w-[280px] relative overflow-hidden group"
            :class="canCreate && !creating
              ? 'bg-[#22C55E] text-[#0B0F0C] hover:bg-[#4ADE80] shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]'
              : 'bg-[#111111] text-[#71717A] border border-[#2A2A2A] cursor-not-allowed'"
          >
            <span class="relative z-10">{{ creating ? "Création en cours..." : "Créer la room draft" }}</span>
            <div v-if="canCreate && !creating" class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { fetchDraftSetupTeams, getPlayers } from "../lib/queries";

type TeamPlayer = { id: string; pseudo: string; team_id: string | null };
type DraftSetupTeam = {
  id: string;
  name: string;
  players: TeamPlayer[];
  defaultCaptain: TeamPlayer | null;
};

const router = useRouter();
const userRaw = localStorage.getItem("mcu_user");
const currentUser = userRaw ? (JSON.parse(userRaw) as { id: string; team_id: string | null }) : null;
const teams = ref<DraftSetupTeam[]>([]);
const allPlayers = ref<TeamPlayer[]>([]);
const loading = ref(true);
const creating = ref(false);
const errorMessage = ref("");

const team1Id = ref("");
const team2Id = ref("");
const captainTeam1Id = ref("");
const captainTeam2Id = ref("");

const captainTestEnabledByEnv = import.meta.env.DEV || import.meta.env.VITE_ENABLE_CAPTAIN_TEST_MODE === "true";
const showCaptainTestToggle = captainTestEnabledByEnv;
const captainTestMode = ref(false);

const selectedTeam1 = computed(() => teams.value.find((t) => t.id === team1Id.value) ?? null);
const selectedTeam2 = computed(() => teams.value.find((t) => t.id === team2Id.value) ?? null);
const teamNameById = computed(() => new Map(teams.value.map((team) => [team.id, team.name])));

const teamOptionsForTeam1 = computed(() => teams.value.filter((t) => t.id !== team2Id.value));
const teamOptionsForTeam2 = computed(() => teams.value.filter((t) => t.id !== team1Id.value));
const captainOptionsTeam1 = computed(() =>
  captainTestMode.value ? allPlayers.value : selectedTeam1.value?.players ?? [],
);
const captainOptionsTeam2 = computed(() =>
  captainTestMode.value ? allPlayers.value : selectedTeam2.value?.players ?? [],
);

watch([selectedTeam1, selectedTeam2], ([team1, team2]) => {
  if (team1 && team2) {
    captainTeam1Id.value = team1.defaultCaptain?.id ?? team1.players[0]?.id ?? "";
    captainTeam2Id.value = team2.defaultCaptain?.id ?? team2.players[0]?.id ?? "";
  }
});

watch(captainTestMode, (enabled) => {
  if (enabled) return;
  if (selectedTeam1.value) captainTeam1Id.value = selectedTeam1.value.defaultCaptain?.id ?? "";
  if (selectedTeam2.value) captainTeam2Id.value = selectedTeam2.value.defaultCaptain?.id ?? "";
});

const canCreate = computed(() => {
  if (!selectedTeam1.value || !selectedTeam2.value) return false;
  if (!resolveCaptainId(selectedTeam1.value, captainTeam1Id.value)) return false;
  if (!resolveCaptainId(selectedTeam2.value, captainTeam2Id.value)) return false;
  return true;
});

const resolveCaptainId = (team: DraftSetupTeam, selectedId: string): string => {
  if (selectedId) return selectedId;
  if (team.defaultCaptain?.id) return team.defaultCaptain.id;
  const teamFallback = team.players[0]?.id;
  if (teamFallback) return teamFallback;
  if (currentUser?.team_id === team.id && currentUser.id) return currentUser.id;
  return "";
};

const playerLabel = (player: TeamPlayer) => {
  if (!captainTestMode.value) return player.pseudo;
  const teamName = player.team_id ? teamNameById.value.get(player.team_id) : null;
  return teamName ? `${player.pseudo} (${teamName})` : `${player.pseudo} (Sans equipe)`;
};

const loadTeams = async () => {
  loading.value = true;
  const [{ data, error }, { data: playersData, error: playersError }] = await Promise.all([
    fetchDraftSetupTeams(),
    getPlayers(),
  ]);
  if (error || !data) errorMessage.value = error?.message ?? "Impossible de charger les équipes.";
  if (playersError || !playersData) errorMessage.value = playersError?.message ?? "Impossible de charger les joueurs.";
  if (data) teams.value = data as DraftSetupTeam[];
  if (playersData) {
    allPlayers.value = playersData.map((player) => ({
      id: player.id,
      pseudo: player.pseudo,
      team_id: player.team_id,
    }));
  }
  loading.value = false;
};

const createDraftSession = async () => {
  if (!canCreate.value || !selectedTeam1.value || !selectedTeam2.value) return;
  errorMessage.value = "";
  creating.value = true;
  try {
    const sessionId = crypto.randomUUID();
    const captain1 = resolveCaptainId(selectedTeam1.value, captainTeam1Id.value);
    const captain2 = resolveCaptainId(selectedTeam2.value, captainTeam2Id.value);
    if (!captain1 || !captain2) {
      errorMessage.value =
        "Impossible de créer la room: sélectionne un capitaine pour chaque équipe.";
      return;
    }
    const sessionMeta = {
      t1: selectedTeam1.value.id,
      t2: selectedTeam2.value.id,
      t1n: selectedTeam1.value.name,
      t2n: selectedTeam2.value.name,
      // No side/first-pick selection on setup: default first pick to team1.
      sc: selectedTeam1.value.id,
      fp: selectedTeam1.value.id,
      c1: captain1,
      c2: captain2,
    };
    localStorage.setItem(`draft_room_meta_${sessionId}`, JSON.stringify(sessionMeta));
    router.push({ name: "draft-room", params: { sessionId } });
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : "Erreur lors de la création de la room";
  } finally {
    creating.value = false;
  }
};

onMounted(() => {
  void loadTeams();
});
</script>
