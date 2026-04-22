import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/champions",
      name: "champions",
      component: () => import("../views/Champions.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/Admin.vue"),
    },
    {
      path: "/draft",
      name: "draft",
      component: () => import("../views/Draft.vue"),
    },
    {
      path: "/overlay",
      name: "overlay",
      component: () => import("../views/Overlay.vue"),
    },
  ],
});

export default router;
