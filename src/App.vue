<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue";
import { useGlobalDraftSync } from "./composables/useGlobalDraftSync";

const route = useRoute();
const showNavbar = computed(() => {
  if (["/register", "/overlay", "/admin/login"].includes(route.path)) return false;
  if (route.path.startsWith("/admin")) return false;
  return true;
});

useGlobalDraftSync();
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <Navbar v-if="showNavbar" />
    <router-view />
  </div>
</template>
