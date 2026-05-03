<template>
  <div class="space-y-3">
    <div class="flex items-baseline justify-between gap-2">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">{{ label }}</p>
      <span v-if="hint" class="text-[10px] text-[#71717A] truncate max-w-[45%]" :title="hint">{{ hint }}</span>
    </div>
    <div
      class="flex flex-wrap gap-2 max-h-[min(40vh,14rem)] overflow-y-auto pr-1 dicebear-picker-scroll pb-1"
      role="list"
    >
      <button
        v-for="it in items"
        :key="it.value"
        type="button"
        role="listitem"
        :title="titleFor(it)"
        class="group relative shrink-0 cursor-pointer rounded-xl border-2 p-1 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]"
        :class="
          modelValue === it.value
            ? 'border-[#22C55E] bg-[#22C55E]/10 shadow-[0_0_16px_rgba(34,197,94,0.25)]'
            : 'border-[#2A2A2A] bg-[#0B0F0C] hover:border-[#404040]'
        "
        @click="emit('update:modelValue', it.value)"
      >
        <div
          class="w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full overflow-hidden bg-[#161616] ring-1 ring-black/40"
        >
          <img
            :src="it.src"
            class="w-full h-full object-cover scale-[1.12]"
            width="56"
            height="56"
            loading="lazy"
            alt=""
          />
        </div>
        <span
          v-if="showCaptionsUnder"
          class="block max-w-[3.75rem] text-center text-[8px] leading-tight uppercase tracking-wide text-[#71717A] mt-1 line-clamp-2 group-hover:text-[#A1A1AA]"
        >
          {{ captionFor(it.value) }}
        </span>
      </button>
    </div>
    <p v-if="showValueLine" class="font-mono text-[10px] text-[#52525b] truncate" :title="modelValue">
      {{ modelValue }}
    </p>
  </div>
</template>

<script setup lang="ts">
export type DicebearPickItem = { value: string; src: string; caption?: string }

const props = withDefaults(
  defineProps<{
    label: string
    modelValue: string
    items: DicebearPickItem[]
    captionMap?: Record<string, string>
    showCaptionsUnder?: boolean
    hint?: string
    showValueLine?: boolean
  }>(),
  { captionMap: () => ({}), showCaptionsUnder: false, hint: '', showValueLine: true }
)

const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

function captionFor(val: string) {
  return props.captionMap[val] ?? val.replace(/([A-Z])/g, ' $1').trim()
}

function titleFor(it: DicebearPickItem) {
  return it.caption ?? captionFor(it.value)
}
</script>

<style scoped>
.dicebear-picker-scroll {
  scrollbar-width: thin;
  scrollbar-color: #2a2a2a #0b0f0c;
}
.dicebear-picker-scroll::-webkit-scrollbar {
  width: 6px;
}
.dicebear-picker-scroll::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 6px;
}
</style>
