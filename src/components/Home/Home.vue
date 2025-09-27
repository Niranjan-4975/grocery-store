<script setup lang="ts">
import { inject, ref } from "vue";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

// Regular products
const products = ref<Product[]>([
  { id: 1, name: 'Apple', price: 50, image: '/apple.png' },
  { id: 2, name: 'Banana', price: 30, image: '/banana.png' },
  { id: 3, name: 'Milk', price: 45, image: '/milk.png' },
]);

// Featured products (for horizontal scroll)
const featuredProducts = ref<Product[]>([
  { id: 4, name: 'Orange', price: 60, image: '/orange.png' },
  { id: 5, name: 'Bread', price: 40, image: '/bread.png' },
  { id: 6, name: 'Cheese', price: 120, image: '/cheese.png' },
  { id: 4, name: 'Orange', price: 60, image: '/orange.png' },
  { id: 5, name: 'Bread', price: 40, image: '/bread.png' },
  { id: 6, name: 'Cheese', price: 120, image: '/cheese.png' },
  { id: 4, name: 'Orange', price: 60, image: '/orange.png' },
  { id: 5, name: 'Bread', price: 40, image: '/bread.png' },
  { id: 6, name: 'Cheese', price: 120, image: '/cheese.png' },
  { id: 4, name: 'Orange', price: 60, image: '/orange.png' },
  { id: 5, name: 'Bread', price: 40, image: '/bread.png' },
  { id: 6, name: 'Cheese', price: 120, image: '/cheese.png' },
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
  <div class="home-container">
    <!-- Featured Products Section -->
    <section class="featured-section">
      <h2 class="section-title">🌟 Featured Products</h2>
      <v-slide-group show-arrows class="featured-slider">
        <v-slide-item
          v-for="product in featuredProducts"
          :key="product.id"
          class="featured-card"
        >
          <img :src="product.image" class="product-image" @click="$router.push({name:'ProductDetail', params: {id: product.id}})"/>
          <h3 @click="$router.push({name:'ProductDetail', params: {id: product.id}})">{{ product.name }}</h3>
          <p>₹{{ product.price }}</p>
          <div v-if="cartItem(product)" class="cart-controls">
            <v-btn size="small" icon color="red" @click="decrease(product)">
              <v-icon>mdi-minus</v-icon>
            </v-btn>
            <span>{{ cartItem(product).quantity }}</span>
            <v-btn size="small" icon color="green" @click="increase(product)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-btn size="small" icon color="error" @click="remove(product)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
          <v-btn v-else color="primary" @click.stop="addToCart(product)">
            Add to Cart
          </v-btn>
        </v-slide-item>
      </v-slide-group>
    </section>

    <!-- Regular Product Grid -->
    <section class="product-grid-section">
      <h2>All Products</h2>
      <div class="product-grid">
        <div class="product-card" v-for="product in products" :key="product.id">
          <img :src="product.image" class="product-image" @click="$router.push({name:'ProductDetail', params: {id: product.id}})"/>
          <h3 @click="$router.push({name:'ProductDetail', params: {id: product.id}})">{{ product.name }}</h3>
          <p>₹{{ product.price }}</p>
          <div v-if="cartItem(product)" class="cart-controls">
            <v-btn size="small" color="red" icon @click="decrease(product)">
              <v-icon>mdi-minus</v-icon>
            </v-btn>
            <span>{{ cartItem(product).quantity }}</span>
            <v-btn size="small" color="green" icon @click="increase(product)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-btn size="small" color="error" icon @click="remove(product)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
          <v-btn v-else color="primary" @click.stop="addToCart(product)">
            Add to Cart
          </v-btn>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  padding: 16px;
}

/* Featured Products */
.featured-section {
  margin-bottom: 32px;
}
.featured-slider {
  display: flex;
  gap: 16px;
}
.featured-card {
  min-width: 180px;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
}
.featured-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
.cart-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 8px 0;
}

/* Product Grid */
.product-grid-section h2 {
  margin-bottom: 16px;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px,1fr));
  gap: 16px;
}
.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}
</style>
