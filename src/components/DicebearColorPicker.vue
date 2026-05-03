<template>
  <div class="space-y-3">
    <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">{{ label }}</p>
    <div class="flex flex-wrap gap-2.5 items-center">
      <button
        v-for="hex in colors"
        :key="hex"
        type="button"
        class="relative w-10 h-10 cursor-pointer rounded-full shrink-0 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]"
        :class="modelValue === hex ? 'ring-2 ring-[#22C55E] ring-offset-2 ring-offset-[#111111] scale-105' : 'ring-2 ring-transparent hover:ring-[#404040]'"
        :style="{ backgroundColor: '#' + hex }"
        :title="'#' + hex"
        @click="emit('update:modelValue', hex)"
      />
      <slot name="extra" />
    </div>
    <p v-if="showValueLine" class="font-mono text-[10px] text-[#52525b]">#{{ modelValue }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ label: string; modelValue: string; colors: readonly string[]; showValueLine?: boolean }>(),
  { showValueLine: true }
)
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()
</script>
