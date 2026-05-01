<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue";
import RiotIdModal from "./components/RiotIdModal.vue";

const route = useRoute();
const showNavbar = computed(() => {
  const isPublicRoute = ["/admin/login", "/overlay", "/register"].includes(route.path) || route.path.startsWith("/admin");
  return !isPublicRoute;
});

const currentUser = ref<any>(null);
const needsRiotId = computed(() => {
  return currentUser.value && !currentUser.value.riot_id && !["/admin/login", "/overlay", "/register"].includes(route.path) && !route.path.startsWith("/admin");
});

onMounted(() => {
  const userStr = localStorage.getItem('mcu_user');
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }
});

const onRiotIdUpdated = (updatedPlayer: any) => {
  currentUser.value = updatedPlayer;
};
</script>

<template>
  <div>
    <Navbar v-if="showNavbar" />
    <router-view />
    <RiotIdModal v-if="needsRiotId" :player="currentUser" @updated="onRiotIdUpdated" />
  </div>
</template>
