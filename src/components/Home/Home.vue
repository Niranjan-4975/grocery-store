<script setup lang="ts">
import { computed, ref } from "vue";
import IconButton from '../common/IconButton.vue';

// Drawer state
const drawer = ref(false);
const cartDropdown = ref(false);

// Computed totals
const cart = ref<Product[]>([]);

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

const total = computed(() =>
  cart.value.reduce((acc, item) => acc + item.price * (item.quantity || 0), 0)
);
const totalItems = computed(() =>
  cart.value.reduce((acc, item) => acc + (item.quantity || 0), 0)
);

// Example products (later from API)
const products = ref<Product[]>([
  { id: 1, name: "Apples", price: 100, image: "https://www.shutterstock.com/shutterstock/photos/1727544364/display_1500/stock-photo-red-apple-isolated-on-white-background-clipping-path-full-depth-of-field-1727544364.jpg" },
  { id: 2, name: "Bananas", price: 80, image: "https://www.shutterstock.com/shutterstock/photos/2174825323/display_1500/stock-photo-bananas-isolated-ripe-bananas-and-peeled-sliced-bananas-on-a-white-background-2174825323.jpg" },
  { id: 3, name: "Tomatoes", price: 60, image: "https://www.shutterstock.com/shutterstock/photos/2557969997/display_1500/stock-photo-tomatoes-isolated-on-white-background-clipping-path-2557969997.jpg" },
  { id: 4, name: "Potatoes", price: 40, image: "https://www.shutterstock.com/shutterstock/photos/2661002145/display_1500/stock-photo-whole-and-cut-potatoes-isolated-on-white-top-view-2661002145.jpg" },
]);

// Grocery categories
const categories = [
  "Fruits", "Vegetables", "Dairy", "Bakery", "Meat", "Beverages", "Snacks", "Frozen Foods", "Household Items"
];

// Cart operations
function addToCart(product: Product) {
  const existing = cart.value.find(item => item.id === product.id);
  if (existing) existing.quantity = (existing.quantity || 0) + 1;
  else cart.value.push({ ...product, quantity: 1 });
}

function removeFromCart(product: Product) {
  const existing = cart.value.find(item => item.id === product.id);
  if (existing) {
    existing.quantity!--;
    if (existing.quantity === 0) cart.value = cart.value.filter(p => p.id !== product.id);
  }
  if (cart.value.length === 0) cartDropdown.value = false;
}

function removeAll(product: Product) {
  cart.value = cart.value.filter(p => p.id !== product.id);
  if (cart.value.length === 0) cartDropdown.value = false;
}

function checkout() {
  alert(`Checkout — total ₹${total.value}`);
  cart.value = [];
  cartDropdown.value = false;
}
</script>

<template>
  <v-app>
    <!-- Drawer -->
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-text-field label="Search Categories" prepend-inner-icon="mdi-magnify" />
      <v-list density="compact" nav>
        <v-list-item
          v-for="(category, i) in categories"
          :key="i"
          :title="category"
          prepend-icon="mdi-food-apple"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app color="primary" dark>
      <IconButton icon="mdi-menu" tooltip="Menu" color="white" @click="drawer = !drawer" />
      <v-app-bar-title>Grocery Store</v-app-bar-title>
      
      <IconButton icon="mdi-magnify" tooltip="Search" color="white" />

      <!-- Cart Dropdown -->
      <v-menu v-model="cartDropdown" :close-on-content-click="false" offset-y bottom>
        <template #activator="{ props }">
          <IconButton v-bind="props" icon="mdi-cart" :badge="totalItems" tooltip="My Cart" color="white"/>
        </template>

        <v-card style="width: 350px;">
          <v-list>
            <v-list-item>
              <v-list-item-title class="text-h6">Cart ({{ totalItems }})</v-list-item-title>
            </v-list-item>
            <v-divider />

            <template v-if="cart.length > 0">
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
                  <span class="mx-2">{{ item.quantity }}</span>
                  <IconButton icon="mdi-plus" tooltip="Add one" color="green" @click="addToCart(item)" />
                  <IconButton icon="mdi-delete" tooltip="Remove all" color="grey" @click="removeAll(item)" />
                </div>
              </v-list-item>
              <v-divider />
              <v-list-item>
                <v-list-item-title class="text-subtitle-1">Total: ₹{{ total }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-btn color="success" block @click="checkout">Checkout</v-btn>
              </v-list-item>
            </template>

            <template v-else>
              <v-list-item>
                <v-list-item-title class="text-center text-subtitle-1">🛒 Your cart is empty</v-list-item-title>
              </v-list-item>
            </template>
          </v-list>
        </v-card>
      </v-menu>

      <IconButton icon="mdi-account" tooltip="Profile" color="white" />
    </v-app-bar>

    <!-- Product Grid -->
    <v-main>
      <v-container fluid class="mt-12">
        <v-row class="mt-12" dense>
          <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="3">
            <v-card>
              <v-img :src="product.image" height="150px"></v-img>
              <v-card-title>{{ product.name }}</v-card-title>
              <v-card-subtitle>₹{{ product.price }}</v-card-subtitle>
              <v-card-actions class="justify-center">
                <IconButton icon="mdi-cart-plus" tooltip="Add to Cart" color="green" @click="addToCart(product)" />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
.mt-12 {
  margin-top: 80px; /* offset below app bar */
}
</style>
