<template>
  <nav class="relative z-[100] border-b border-[#2A2A2A] bg-[#0B0F0C]/90 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 lg:h-20 flex items-center justify-between gap-3">
      <router-link
        to="/"
        class="flex items-center gap-2 sm:gap-4 group cursor-pointer hover:opacity-80 transition-opacity shrink-0 min-w-0"
        @click="closeMenu"
      >
        <img
          src="../assets/mcu_logo.png"
          alt="MCU Logo"
          class="w-11 h-11 sm:w-16 sm:h-16 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]"
        />
        <span class="font-title tracking-widest uppercase text-2xl sm:text-3xl text-[#22C55E] drop-shadow-[0_2px_10px_rgba(34,197,94,0.2)] truncate">
          Party
        </span>
      </router-link>

      <!-- Desktop -->
      <div class="hidden lg:flex flex-1 min-w-0 items-center justify-end gap-0 font-sans z-50">
        <router-link
          to="/"
          class="px-4 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer"
          :class="route.path === '/' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'"
        >
          <span class="mt-1">Classement</span>
          <div
            class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300"
            :class="route.path === '/' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"
          />
        </router-link>

        <router-link
          to="/future-matches"
          class="px-4 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer"
          :class="route.path === '/future-matches' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'"
        >
          <span class="mt-1">Matches</span>
          <div
            class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300"
            :class="route.path === '/future-matches' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"
          />
        </router-link>

        <router-link
          to="/champions"
          class="px-4 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer"
          :class="route.path === '/champions' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'"
        >
          <span class="mt-1">Champions</span>
          <div
            class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300"
            :class="route.path === '/champions' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"
          />
        </router-link>

        <div class="h-8 w-px bg-[#2A2A2A] mx-2" />

        <router-link
          to="/players"
          class="px-4 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer"
          :class="route.path === '/players' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'"
        >
          <span class="mt-1">Players</span>
          <div
            class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300"
            :class="route.path === '/players' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"
          />
        </router-link>

        <router-link
          to="/stats"
          class="px-4 py-3 text-sm font-bold tracking-widest uppercase relative group flex items-center h-20 cursor-pointer"
          :class="route.path === '/stats' ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] hover:text-[#F0FDF4] transition-colors'"
        >
          <span class="mt-1">Stats</span>
          <div
            class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300"
            :class="route.path === '/stats' ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"
          />
        </router-link>

        <div class="h-8 w-px bg-[#2A2A2A] mx-2" />

        <div class="relative group h-20 flex items-center cursor-pointer">
          <div
            class="px-4 py-3 text-sm font-bold tracking-widest uppercase flex items-center gap-1 transition-colors h-20"
            :class="isFantasyActive() ? 'text-[#F0FDF4]' : 'text-[#A1A1AA] group-hover:text-[#F0FDF4]'"
          >
            <span class="mt-1 normal-case">Morue-verse</span>
            <ChevronDown class="w-4 h-4 mt-1 transition-transform group-hover:rotate-180" />
            <div
              class="absolute bottom-0 left-0 h-[3px] bg-[#22C55E] transition-all duration-300"
              :class="isFantasyActive() ? 'w-full shadow-[0_0_15px_#22C55E]' : 'w-0 group-hover:w-full left-1/2 -translate-x-1/2'"
            />
          </div>
          <div
            class="absolute top-[calc(100%-8px)] left-1/2 -translate-x-1/2 w-56 pt-2 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-[100]"
          >
            <div class="bg-[#0B0F0C]/95 backdrop-blur-lg border border-[#2A2A2A] rounded-b-lg shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
              <router-link
                to="/fantasy"
                class="flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest uppercase transition-colors"
                :class="route.path === '/fantasy' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#A1A1AA] hover:text-[#22C55E] hover:bg-[#22C55E]/5'"
              >
                <LayoutDashboard class="w-4 h-4" /> Dashboard
              </router-link>
              <router-link
                to="/fantasy-leaderboard"
                class="flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest uppercase transition-colors"
                :class="route.path === '/fantasy-leaderboard' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#A1A1AA] hover:text-[#22C55E] hover:bg-[#22C55E]/5'"
              >
                <ListOrdered class="w-4 h-4" /> Leaderboard
              </router-link>
            </div>
          </div>
        </div>

        <div class="h-8 w-px bg-[#2A2A2A] mx-2 shrink-0" />

        <router-link
          to="/playoffs"
          class="px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all rounded cursor-pointer shrink-0"
          :class="route.path === '/playoffs' ? 'text-[#0B0F0C] border border-[#22C55E] bg-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-[#22C55E] border border-[#22C55E]/30 hover:border-[#22C55E] hover:bg-[#22C55E]/10'"
        >
          Playoffs
        </router-link>

        <router-link
          to="/profil"
          title="Profil"
          aria-label="Profil"
          class="ml-3 flex shrink-0 items-center justify-center w-11 h-11 rounded-lg border transition-colors hover:border-[#2A2A2A]"
          :class="route.path === '/profil' ? 'text-[#22C55E] border-[#22C55E]/45 bg-[#22C55E]/10 shadow-[0_0_14px_rgba(34,197,94,0.2)]' : 'text-[#A1A1AA] border-transparent hover:text-[#F0FDF4]'"
        >
          <UserCircle class="w-6 h-6" stroke-width="2" />
        </router-link>
      </div>

      <!-- Mobile -->
      <div class="flex lg:hidden items-center gap-2 shrink-0">
        <router-link
          to="/profil"
          aria-label="Profil"
          class="flex shrink-0 items-center justify-center w-11 h-11 rounded-lg border transition-colors"
          :class="route.path === '/profil' ? 'text-[#22C55E] border-[#22C55E]/45 bg-[#22C55E]/10' : 'text-[#A1A1AA] border-[#2A2A2A] hover:text-[#F0FDF4]'"
          @click="closeMenu"
        >
          <UserCircle class="w-6 h-6" stroke-width="2" />
        </router-link>
        <button
          type="button"
          class="flex items-center justify-center w-11 h-11 rounded-lg border border-[#2A2A2A] text-[#F0FDF4] hover:border-[#22C55E]/50 hover:text-[#22C55E] transition-colors"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav-panel"
          :aria-label="menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
          @click="toggleMenu"
        >
          <X v-if="menuOpen" class="w-6 h-6" />
          <Menu v-else class="w-6 h-6" />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <button
          v-if="menuOpen"
          type="button"
          class="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Fermer le menu"
          @click="closeMenu"
        />
      </Transition>

      <Transition
        enter-active-class="transition duration-250 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <aside
          v-if="menuOpen"
          id="mobile-nav-panel"
          class="fixed top-0 right-0 z-[95] h-[100dvh] w-[min(100vw,20rem)] bg-[#0B0F0C] border-l border-[#2A2A2A] shadow-[-8px_0_40px_rgba(0,0,0,0.6)] flex flex-col lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div class="flex items-center justify-between px-4 h-16 border-b border-[#2A2A2A] shrink-0">
            <span class="font-title text-xl uppercase tracking-widest text-[#22C55E]">Menu</span>
            <button type="button" class="flex items-center justify-center w-10 h-10 rounded-lg text-[#A1A1AA] hover:text-[#F0FDF4]" aria-label="Fermer" @click="closeMenu">
              <X class="w-5 h-5" />
            </button>
          </div>

          <nav class="flex-1 overflow-y-auto overscroll-contain py-3 px-3 space-y-1">
            <router-link
              v-for="item in mobileNavItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-lg px-3 py-3.5 text-sm font-bold tracking-widest uppercase transition-colors min-h-[44px] border"
              :class="mobileLinkClass(item.to, item.highlight)"
              @click="closeMenu"
            >
              <component :is="item.icon" v-if="item.icon" class="w-4 h-4 shrink-0" />
              {{ item.label }}
            </router-link>
          </nav>
        </aside>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, type Component } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronDown, LayoutDashboard, ListOrdered, UserCircle, Menu, X } from 'lucide-vue-next';

const route = useRoute();
const menuOpen = ref(false);

type MobileNavItem = {
  to: string;
  label: string;
  icon?: Component;
  highlight?: boolean;
  section?: string;
};

const mobileNavItems: MobileNavItem[] = [
  { to: '/', label: 'Classement' },
  { to: '/future-matches', label: 'Matches' },
  { to: '/champions', label: 'Champions' },
  { to: '/players', label: 'Players' },
  { to: '/stats', label: 'Stats' },
  { to: '/fantasy', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/fantasy-leaderboard', label: 'Leaderboard', icon: ListOrdered },
  { to: '/playoffs', label: 'Playoffs', highlight: true },
];

const isFantasyActive = () => ['/fantasy', '/fantasy-leaderboard'].includes(route.path);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const mobileLinkClass = (to: string, highlight?: boolean) => {
  const active = route.path === to;
  if (highlight) {
    return active
      ? 'bg-[#22C55E] text-[#0B0F0C] border-[#22C55E] mt-2'
      : 'text-[#22C55E] border-[#22C55E]/40 bg-[#22C55E]/10 mt-2';
  }
  if (['/fantasy', '/fantasy-leaderboard'].includes(to)) {
    return active
      ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30 pl-6'
      : 'text-[#A1A1AA] hover:text-[#F0FDF4] hover:bg-[#1A1A1A] border-transparent pl-6';
  }
  return active
    ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
    : 'text-[#A1A1AA] hover:text-[#F0FDF4] hover:bg-[#1A1A1A] border-transparent';
};

const lockBodyScroll = (locked: boolean) => {
  document.body.style.overflow = locked ? 'hidden' : '';
};

watch(menuOpen, (open) => lockBodyScroll(open));
watch(() => route.path, closeMenu);

const onEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMenu();
};

onMounted(() => window.addEventListener('keydown', onEscape));
onUnmounted(() => {
  window.removeEventListener('keydown', onEscape);
  lockBodyScroll(false);
});
</script>
