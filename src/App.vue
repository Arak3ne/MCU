<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue";

const route = useRoute();
const showNavbar = computed(() => {
  const isPublicRoute = ["/admin/login", "/overlay", "/register"].includes(route.path) || route.path.startsWith("/admin");
  return !isPublicRoute;
});
</script>

<template>
  <div>
    <Navbar v-if="showNavbar" />
    <router-view />
  </div>
</template>
