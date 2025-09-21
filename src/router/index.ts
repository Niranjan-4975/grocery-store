import { createRouter, createWebHashHistory } from "vue-router";
import Auth from "../components/Auth/Auth.vue";
import Home from "../components/Home/Home.vue";

const routes = [
  { path: "/", name: "Auth", component: Auth },
  { path: "/home", name: "Home", component: Home },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
