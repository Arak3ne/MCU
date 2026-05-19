import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import { getMcuAdminSession } from "../lib/adminAuth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/Register.vue"),
    },
    {
      path: "/champions",
      name: "champions",
      component: () => import("../views/Champions.vue"),
    },
    {
      path: "/players",
      name: "players",
      component: () => import("../views/DraftablePlayers.vue"),
    },
    {
      path: "/fantasy",
      name: "fantasy",
      component: () => import("../views/FantasyDashboard.vue"),
    },
    {
      path: "/future-matches",
      name: "future-matches",
      component: () => import("../views/FutureMatches.vue"),
    },
    {
      path: "/matches",
      redirect: { name: "future-matches" },
    },
    {
      path: "/stats",
      name: "stats",
      component: () => import("../views/Stats.vue"),
    },
    {
      path: "/profil",
      name: "profil",
      component: () => import("../views/Profile.vue"),
    },
    {
      path: "/fantasy-leaderboard",
      name: "fantasy-leaderboard",
      component: () => import("../views/FantasyLeaderboard.vue"),
    },
    {
      path: "/playoffs",
      name: "playoffs",
      component: () => import("../views/Playoffs.vue"),
    },
    {
      path: "/admin/login",
      name: "admin-login",
      component: () => import("../views/admin/Login.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/admin/PlayoffsAdmin.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/power-ranking",
      name: "admin-power-ranking",
      component: () => import("../views/admin/PowerRanking.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/overlay",
      name: "overlay",
      component: () => import("../views/Overlay.vue"),
    },
  ],
});

router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const adminSession = await getMcuAdminSession();
  const isAuthenticated = !!adminSession;
  const isRegistered = localStorage.getItem("mcu_user") !== null;
  const isPublicRoute =
    ["/admin/login", "/overlay", "/register"].includes(to.path) ||
    to.path.startsWith("/admin");

  if (requiresAuth && !isAuthenticated) {
    return { path: "/admin/login", query: { redirect: to.fullPath } };
  }
  if (!isRegistered && !isPublicRoute) {
    return "/register";
  }
  if (isRegistered && to.path === "/register") {
    return "/";
  }
  return true;
});

export default router;
