import { createRouter, createWebHashHistory } from "vue-router";
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
  {
    path: "/",
    component: Applayout,
    meta: { requiresAuth: true },
    children: [
      { path: "home", name: "Home", component: Home },
      { path: "product", name: "Products", component: Products },
      { path: "product/:id", name: "ProductDetail", component: ProductDetail},
      { path: "checkout", name: "Checkout", component: Checkout},
      { path: "profile", name: "Profile", component: Profile},
      { path: "orderHistory", name: "OrderHistory", component: OrderHistory}
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
  const { isAuthenticated } = useAuth();

  if (to.path === "/") {
    return isAuthenticated.value ? next("/home") : next("/login");
  } 
  if(to.meta.requiresAuth && !isAuthenticated.value){
    return next("/login");
  }
  if((to.path === "/login" || to.path === "/signup") && isAuthenticated.value){
    return next("/home");
  }
  console.log("isAuthenticated value -->",isAuthenticated.value)
  next();
});

console.log("beforeEach --->",router.beforeEach)
export default router;
