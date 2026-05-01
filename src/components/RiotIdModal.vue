<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
    <div class="w-full max-w-md bg-mcu-surface border border-mcu-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      <div class="p-6 border-b border-mcu-border bg-mcu-surface-light">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-full bg-mcu-primary/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-mcu-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-xl font-title text-white uppercase tracking-wider">Mise à jour requise</h2>
        </div>
        <p class="text-sm text-mcu-text-muted">
          Pour récupérer tes statistiques de match, nous avons besoin de ton identifiant Riot complet (Pseudo#TAG).
        </p>
      </div>

      <form @submit.prevent="submitRiotId" class="p-6 space-y-6">
        <div>
          <label for="riotId" class="block text-xs font-medium text-mcu-text-muted mb-2 uppercase tracking-widest">
            Riot ID (Pseudo#TAG)
          </label>
          <div class="relative">
            <input 
              v-model="riotId" 
              type="text" 
              id="riotId"
              required
              class="w-full bg-mcu-surface-light border border-mcu-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mcu-primary focus:ring-1 focus:ring-mcu-primary transition-all"
              placeholder="Faker#KR1"
              :class="{ 'border-red-500/50 focus:border-red-500 focus:ring-red-500': errorMsg }"
            />
          </div>
          <p v-if="errorMsg" class="mt-2 text-xs text-red-400">{{ errorMsg }}</p>
          <p v-else class="mt-2 text-xs text-mcu-text-muted">N'oublie pas le # et les lettres/chiffres qui suivent.</p>
        </div>

        <button 
          type="submit"
          :disabled="loading || !isValidFormat"
          class="w-full px-6 py-3 rounded-xl font-bold text-sm bg-mcu-primary text-white hover:bg-mcu-accent transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ loading ? 'Enregistrement...' : 'Valider mon Riot ID' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabase';

const props = defineProps<{
  player: any;
}>();

const emit = defineEmits<{
  (e: 'updated', player: any): void;
}>();

const riotId = ref('');
const loading = ref(false);
const errorMsg = ref('');

// Validation basique du format Riot ID (Pseudo#TAG)
const isValidFormat = computed(() => {
  const regex = /^.+#.+$/;
  return regex.test(riotId.value.trim());
});

const submitRiotId = async () => {
  if (!isValidFormat.value) {
    errorMsg.value = "Le format doit être Pseudo#TAG";
    return;
  }

  loading.value = true;
  errorMsg.value = '';

  try {
    const { data, error } = await supabase
      .from('players')
      .update({ riot_id: riotId.value.trim() })
      .eq('id', props.player.id)
      .select('*')
      .single();

    if (error) throw error;

    // Mettre à jour le localStorage
    localStorage.setItem('mcu_user', JSON.stringify(data));
    
    // Notifier le parent que c'est bon
    emit('updated', data);
  } catch (err) {
    console.error('Error updating Riot ID:', err);
    errorMsg.value = "Une erreur est survenue lors de l'enregistrement.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
