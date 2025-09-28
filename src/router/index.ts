import { createRouter, createWebHashHistory } from "vue-router";
import { adminRoutes } from "./adminRoutes.ts";
import Applayout from "../components/common/Applayout.vue";
import Home from "../components/Home/Home.vue";
import Products from "../components/Products/Products.vue";
import Login from "../components/Auth/Login.vue";
import { useAuth } from "../composables/useAuth.ts";
import ProductDetail from "../components/Products/ProductDetail.vue";
import Checkout from "../components/Checkout/Checkout.vue";
import Profile from "../components/Auth/Profile.vue";
import OrderHistory from "../components/Order/OrderHistory.vue";

const routes = [
  // Redirect root to /login or /home depending on auth
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { layout: "none", requiresAuth: false },
  },
  {
    path: "/signup",
    name: "Signup",
    component: Login,
    meta: { layout: "none", requiresAuth: false },
  },
  adminRoutes,
  {
    path: "/",
    component: Applayout,
    meta: { requiresAuth: true },
    children: [
      { path: "home", name: "Home", component: Home, meta: {role: 'customer'}},
      { path: "product", name: "Products", component: Products, meta: {role: 'customer'}},
      { path: "product/:id", name: "ProductDetail", component: ProductDetail, meta: {role: 'customer'}},
      { path: "checkout", name: "Checkout", component: Checkout, meta: {role: 'customer'}},
      { path: "profile", name: "Profile", component: Profile, meta: {role: 'customer'}},
      { path: "orderHistory", name: "OrderHistory", component: OrderHistory, meta: {role: 'customer'}}
    ],
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const { isAuthenticated, user, initAuth } = useAuth();
  initAuth();
  if (to.path === "/") {
    return isAuthenticated.value ? next("/home") : next("/login");
  }
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return next("/login");
  }
  if ((to.path === "/login" || to.path === "/signup") && isAuthenticated.value) {
    return next("/home");
  }
  // ✅ Role-based route enforcement
  if (to.meta.role && user.value?.role !== to.meta.role) {
    // If admin tries to access customer route → redirect to /admin
    if (user.value?.role === "admin") return next("/admin");

    // If customer tries to access admin route → redirect to /home
    if (user.value?.role === "customer") return next("/home");
  }
  next();
});


export default router;
