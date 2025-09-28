<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide } from "vue";
import { RouterView} from "vue-router";
import IconButton from "./IconButton.vue";
import { useAuth } from "../../composables/useAuth";

// Auth
const { logout, loading, user} = useAuth();
 //need to replace real user name later in from auth details

const userInitials = computed(()=>{
  if(!user.value?.username) return null;
  return user.value.username
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();
})

// Responsive state
const isMobile = ref(window.innerWidth <= 600);
function handleResize() {
  isMobile.value = window.innerWidth <= 600;
}
onMounted(() => window.addEventListener("resize", handleResize));
onUnmounted(() => window.removeEventListener("resize", handleResize));

// Drawer & cart state
const drawer = ref(false);
function toggleDrawer() {
  drawer.value = !drawer.value;
}
const cartDropdown = ref(false);

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}
const cart = ref<Product[]>([]);

// Provide cart functions to children
provide("cart", cart);
const addToCart = (product: Product) => {
  const existing = cart.value.find(p => p.id === product.id);
  if (existing) existing.quantity = (existing.quantity || 0) + 1;
  else cart.value.push({ ...product, quantity: 1 });
};

const removeFromCart = (product: Product) => {
  const existing = cart.value.find(p => p.id === product.id);
  if (existing) {
    existing.quantity!--;
    if (existing.quantity === 0) cart.value = cart.value.filter(p => p.id !== product.id);
  }
  if (cart.value.length === 0) cartDropdown.value = false;
};

const removeAll = (product: Product) => {
  cart.value = cart.value.filter(p => p.id !== product.id);
  if (cart.value.length === 0) cartDropdown.value = false;
};

// Provide them for child components
provide("addToCart", addToCart);
provide("removeFromCart", removeFromCart);
provide("removeAll", removeAll);

const totalItems = computed(() =>
  cart.value.reduce((acc, item) => acc + (item.quantity || 0), 0)
);
const total = computed(() =>
  cart.value.reduce((acc, item) => acc + (item.price * (item.quantity || 0)), 0)
);

// Categories
const categories = [
  "Fruits", "Vegetables", "Dairy", "Bakery", "Meat",
  "Beverages", "Snacks", "Frozen Foods", "Household Items"
];

// Logout handler
function handleLogout() {
  logout();
}
</script>

<template>
  <v-app>
    <!-- Loading screen -->
    <div v-if="loading" class="loading-screen">Loading...</div>

    <!-- App content -->
    <template v-else>
      <v-app-bar app color="primary" dark>
        <IconButton icon="mdi-menu" tooltip="Menu" color="white" @click="toggleDrawer" />
        <v-app-bar-title>Grocery Store</v-app-bar-title>
        <v-spacer></v-spacer>

        <!-- Desktop nav -->
        <div v-if="!isMobile">
          <v-btn to="/home" text :class="{ 'active-link': $route.path === '/home' }">Home</v-btn>
          <v-btn to="/product" text :class="{ 'active-link': $route.path === '/product' }">Products</v-btn>
        </div>

        <!-- Cart menu -->
        <v-menu v-model="cartDropdown" :close-on-content-click="false" offset-y bottom>
          <template #activator="{ props }">
            <IconButton v-bind="props" icon="mdi-cart" :badge="totalItems" tooltip="My Cart" color="white" />
          </template>
          <v-card style="width: 350px;">
            <v-list>
              <v-list-item>
                <v-list-item-title class="text-h6">Cart ({{ totalItems }})</v-list-item-title>
              </v-list-item>
              <v-divider />
              <template v-if="cart.length">
                <v-list-item
                  v-for="item in cart"
                  :key="item.id"
                  class="d-flex align-center justify-space-between"
                >
                  <div>
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      ₹{{ item.price }} × {{ item.quantity ?? 0 }} = ₹{{ item.price * (item.quantity ?? 0) }}
                    </v-list-item-subtitle>
                  </div>
                  <div class="d-flex align-center">
                    <IconButton icon="mdi-minus"  size="small" tooltip="Remove one" color="red" @click="removeFromCart(item)" />
                    <span class="mx-2">{{ item.quantity ?? 0 }}</span>
                    <IconButton icon="mdi-plus" size="small" tooltip="Add one" color="green" @click="addToCart(item)" />
                    <IconButton icon="mdi-delete" size="small" tooltip="Remove all" color="error" @click="removeAll(item)" />
                  </div>
                </v-list-item>
                <v-divider />
                <v-list-item>
                  <v-list-item-title>Total: ₹{{ total }}</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-btn color="success" block @click.stop="() => {cartDropdown = false; $router.push('/checkout');}">Checkout</v-btn>
                </v-list-item>
              </template>
              <template v-else>
                <v-list-item>
                  <v-list-item-title class="text-center">🛒 Your cart is empty</v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </v-card>
        </v-menu>

        <!-- Profile / Logout -->
        <v-menu offset-y bottom transition="scale-transition">
          <template #activator="{props}">
            <div v-bind="props">
              <IconButton v-if="!userInitials" icon="userInitials || mdi-account" tooltip="Profile" color="white"/>
              <v-avatar v-else size="36" class="cursor-pointer" color="deep-purple accent-4">
                <span class="white--text">{{ userInitials }}</span>
              </v-avatar>
            </div>
          </template>
            <v-list>
              <!---My Profile-->
              <v-list-item @click="$router.push('profile')">
                <v-list-item-title>My Profile</v-list-item-title>
              </v-list-item>
              <!---My Orders-->
              <v-list-item @click="$router.push('orderHistory')">
                <v-list-item-title>My Orders</v-list-item-title>
              </v-list-item>
              <!---Logout--->
              <v-list-item @click="handleLogout">
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
        </v-menu>
        
      </v-app-bar>

      <!-- Desktop drawer -->
      <v-navigation-drawer app v-model="drawer" temporary v-if="!isMobile">
        <v-list dense>
          <v-subheader>Categories</v-subheader>
          <v-list-item v-for="(category, i) in categories" :key="i" :title="category" prepend-icon="mdi-food-apple" />
        </v-list>
      </v-navigation-drawer>

      <!-- Mobile drawer -->
      <v-navigation-drawer v-model="drawer" app temporary v-if="isMobile">
        <v-list dense nav>
          <v-list-item to="/home" title="Home" prepend-icon="mdi-home" @click="drawer = false"/>
          <v-list-item to="/product" title="Products" prepend-icon="mdi-package-variant" @click="drawer = false"/>
          <v-divider class="my-2" />
          <v-subheader>Categories</v-subheader>
          <v-list-item v-for="(category, i) in categories" :key="i" :title="category" prepend-icon="mdi-food-apple" />
        </v-list>
      </v-navigation-drawer>

      <!-- Page content -->
      <v-main>
        <RouterView />
      </v-main>
    </template>
  </v-app>
</template>

<style>
.loading-screen {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  font-size: 1.2rem;
}
.active-link {
  font-weight: bold;
  text-decoration: solid;
}
</style>
