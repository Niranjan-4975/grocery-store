<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide } from "vue";
import { RouterView } from "vue-router";
import IconButton from "./IconButton.vue";
import { useAuth } from "../../composables/useAuth";

// Auth
const { logout, loading } = useAuth();

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

// Checkout
function checkout() {
  alert(`Checkout — total ₹${total.value}`);
  cart.value = [];
  cartDropdown.value = false;
}

// Logout handler
function handleLogout() {
  logout();
  // router.push("/login") already handled in useAuth().logout()
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
          <v-btn to="/home" text>Home</v-btn>
          <v-btn to="/product" text>Products</v-btn>
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
                    <IconButton icon="mdi-minus" tooltip="Remove one" color="red" @click="removeFromCart(item)" />
                    <span class="mx-2">{{ item.quantity ?? 0 }}</span>
                    <IconButton icon="mdi-plus" tooltip="Add one" color="green" @click="addToCart(item)" />
                    <IconButton icon="mdi-delete" tooltip="Remove all" color="grey" @click="removeAll(item)" />
                  </div>
                </v-list-item>
                <v-divider />
                <v-list-item>
                  <v-list-item-title>Total: ₹{{ total }}</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-btn color="success" block @click="checkout">Checkout</v-btn>
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
        <IconButton icon="mdi-account" tooltip="Profile" color="white" @click="handleLogout" />
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
          <v-list-item to="/home" title="Home" prepend-icon="mdi-home" />
          <v-list-item to="/product" title="Products" prepend-icon="mdi-package-variant" />
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
</style>
