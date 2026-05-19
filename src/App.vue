<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue";
import { useGlobalDraftSync } from "./composables/useGlobalDraftSync";

const route = useRoute();
const showNavbar = computed(() => {
  const isPublicRoute = ["/admin/login", "/overlay", "/register"].includes(route.path) || route.path.startsWith("/admin");
  return !isPublicRoute;
});

useGlobalDraftSync();
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <Navbar v-if="showNavbar" />
    <router-view />
  </div>
</template>
