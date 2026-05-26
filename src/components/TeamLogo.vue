<script setup lang="ts">
import { computed } from 'vue';
import { getTeamLogoUrl, getTeamInitials } from '../utils/teamLogo';

const props = withDefaults(
  defineProps<{
    name: string;
    wrapperClass?: string;
    initialsClass?: string;
    imgClass?: string;
    initialsLength?: 1 | 2;
  }>(),
  {
    wrapperClass:
      'flex items-center justify-center shrink-0 overflow-hidden',
    initialsClass: 'font-title uppercase tracking-wider text-[#F0FDF4]',
    imgClass: 'w-full h-full object-contain p-0.5',
    initialsLength: 2,
  },
);

const logoUrl = computed(() => getTeamLogoUrl(props.name));
const initials = computed(() => getTeamInitials(props.name, props.initialsLength));
</script>

<template>
  <div :class="wrapperClass">
    <img
      v-if="logoUrl"
      :src="logoUrl"
      :alt="name"
      :class="imgClass"
    />
    <span v-else :class="initialsClass">{{ initials }}</span>
    <slot />
  </div>
</template>
