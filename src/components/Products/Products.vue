<template>
  <v-container>
    <h1 class="mb-4">Our Products</h1>

    <!-- Search -->
    <v-text-field
      v-model="search"
      label="Search products"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      class="mb-4"
    />

    <!-- Product Grid -->
    <v-row>
      <v-col
        v-for="product in filteredProducts"
        :key="product.id"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card class="mx-auto" max-width="344">
          <v-img :src="product.image" height="200px"></v-img>
          <v-card-title>{{ product.name }}</v-card-title>
          <v-card-subtitle>₹ {{ product.price }}</v-card-subtitle>

          <v-card-actions>
            <v-btn color="primary" @click="addToCart(product)">
              <v-icon start>mdi-cart-plus</v-icon> Add to Cart
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";

const search = ref("");

// Dummy products for now (later we can fetch from JSON/API)
const products = ref([
  { id: 1, name: "Apple", price: 50, image: "https://via.placeholder.com/200" },
  { id: 2, name: "Banana", price: 30, image: "https://via.placeholder.com/200" },
  { id: 3, name: "Milk", price: 60, image: "https://via.placeholder.com/200" },
  { id: 4, name: "Bread", price: 40, image: "https://via.placeholder.com/200" }
]);

const filteredProducts = computed(() =>
  products.value.filter(p =>
    p.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

function addToCart(product) {
  alert(`${product.name} added to cart!`);
  // later we’ll connect this with Vuex/Pinia cart store
}
</script>
