<script setup lang="ts">
import { inject, ref } from "vue";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

// Products array
const products = ref<Product[]>([
  { id: 1, name: 'Apple', price: 50, image: '/apple.png' },
  { id: 2, name: 'Banana', price: 30, image: '/banana.png' },
  { id: 3, name: 'Milk', price: 45, image: '/milk.png' },
]);

// Inject cart operations from Applayout
const cart = inject("cart") as any;
const addToCart = inject("addToCart") as any;
const removeFromCart = inject("removeFromCart") as any;
const removeAll = inject("removeAll") as any;

function cartItem(product: Product) {
  return cart.value.find((p: Product) => p.id === product.id);
}

function increase(product: Product) {
  addToCart(product);
}

function decrease(product: Product) {
  removeFromCart(product);
}

function remove(product: Product) {
  removeAll(product);
}
</script>

<template>
  <div class="product-grid">
    <div class="product-card" v-for="product in products" :key="product.id">
      <img :src="product.image" class="product-image" />
      <h3>{{ product.name }}</h3>
      <p>₹{{ product.price }}</p>

      <div v-if="cartItem(product)">
        <v-btn icon @click="decrease(product)"> <v-icon>mdi-minus</v-icon> </v-btn>
        <span>{{ cartItem(product).quantity }}</span>
        <v-btn icon @click="increase(product)"> <v-icon>mdi-plus</v-icon> </v-btn>
        <v-btn icon color="red" @click="remove(product)"> <v-icon>mdi-delete</v-icon> </v-btn>
      </div>
      <v-btn v-else color="primary" @click="addToCart(product)">Add to Cart</v-btn>
    </div>
  </div>
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px,1fr));
  gap: 16px;
  padding: 16px;
}
.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}
.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
</style>
