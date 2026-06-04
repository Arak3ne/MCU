<template>
  <Transition name="fade-modal">
    <div
      v-if="show"
      class="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[#0B0F0C]/96 backdrop-blur-2xl font-sans text-[#F0FDF4]"
      role="dialog"
      aria-modal="true"
      @keydown.esc="onEsc"
      tabindex="-1"
    >
      <!-- Soft animated background (same spirit as FantasyScoreReveal) -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[520px] bg-mcu-primary/10 blur-[150px] opacity-55"></div>
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[620px] bg-mcu-primary/5 blur-[120px] rounded-t-full opacity-35"></div>
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.06] mix-blend-overlay"></div>
      </div>

      <!-- Click-to-close backdrop -->
      <button
        v-if="closeOnBackdrop"
        type="button"
        class="absolute inset-0 cursor-default"
        aria-label="Fermer"
        @click="close"
      />

      <!-- Modal panel -->
      <Transition name="modal-pop" appear>
        <div
          v-if="show"
          class="relative w-full max-w-[1000px] mx-4 md:mx-6 rounded-3xl border border-white/10 bg-gradient-to-b from-[#111111]/85 to-[#0B0F0C]/80 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div class="absolute inset-0 bg-gradient-to-br from-mcu-primary/10 to-transparent"></div>
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.14)_0%,transparent_60%)] opacity-60"></div>
          </div>

          <div class="relative p-5 md:p-7">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <div v-if="kicker" class="text-[10px] font-extrabold uppercase tracking-[0.35em] text-white/50">
                  {{ kicker }}
                </div>
                <div v-if="title" class="text-3xl md:text-4xl font-title uppercase tracking-widest text-white truncate">
                  {{ title }}
                </div>
                <div v-if="subtitle" class="mt-1 text-sm text-white/55">
                  {{ subtitle }}
                </div>
              </div>

              <button
                v-if="showClose"
                type="button"
                class="shrink-0 w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Fermer"
                @click="close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="mt-5">
              <slot />
            </div>

            <div v-if="$slots.footer" class="mt-6 pt-5 border-t border-white/10">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { watch } from 'vue';

const props = defineProps<{
  show: boolean;
  title?: string;
  subtitle?: string;
  kicker?: string;
  closeOnBackdrop?: boolean;
  showClose?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:show', v: boolean): void;
}>();

const close = () => emit('update:show', false);
const onEsc = () => close();

watch(
  () => props.show,
  (v) => {
    if (v) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  },
  { immediate: true },
);
</script>

<style scoped>
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

.modal-pop-enter-active {
  transition: transform 520ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 520ms cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-pop-leave-active {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 260ms cubic-bezier(0.22, 1, 0.36, 1);
}
.modal-pop-enter-from {
  opacity: 0;
  transform: translateY(18px) scale(0.92);
  filter: blur(10px);
}
.modal-pop-enter-to {
  opacity: 1;
  transform: translateY(0px) scale(1);
  filter: blur(0px);
}
.modal-pop-leave-from {
  opacity: 1;
  transform: translateY(0px) scale(1);
  filter: blur(0px);
}
.modal-pop-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.96);
  filter: blur(8px);
}
</style>
