import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import { getMcuAdminSession } from "../lib/adminAuth";
import {
  getMcuRegisteredUser,
  isMcuPublicPath,
  isMcuRegistered,
  requiresMcuRegistration,
} from "../lib/mcuSession";

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
      path: "/draft/:sessionId",
      name: "draft-room",
      component: () => import("../views/DraftRoom.vue"),
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
    {
      path: "/admin/auction",
      name: "admin-auction-overlay",
      component: () => import("../views/AuctionOverlay.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/mercato",
      name: "admin-mercato-overlay",
      component: () => import("../views/admin/MercatoOverlay.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth) {
    try {
      const adminSession = await getMcuAdminSession();
      if (!adminSession) {
        return { path: "/admin/login", query: { redirect: to.fullPath } };
      }
    } catch (error) {
      console.error("[router] admin session check failed", error);
      return { path: "/admin/login", query: { redirect: to.fullPath } };
    }
  }

  const registered = isMcuRegistered();

  if (requiresMcuRegistration(to.path) && !registered) {
    return "/register";
  }

  if (!registered && !isMcuPublicPath(to.path)) {
    return "/register";
  }

  if (getMcuRegisteredUser() && to.path === "/register") {
    return "/";
  }

  return true;
});

export default router;
