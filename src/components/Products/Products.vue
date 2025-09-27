<script setup lang="ts">
import { inject, ref, computed } from "vue";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity?: number;
}

// Sample product list
const products = ref<Product[]>([
  { id: 1, name: 'Apple', price: 50, image: '/apple.png', category: 'Fruits' },
  { id: 2, name: 'Banana', price: 30, image: '/banana.png', category: 'Fruits' },
  { id: 3, name: 'Milk', price: 45, image: '/milk.png', category: 'Dairy' },
  { id: 4, name: 'Bread', price: 40, image: '/bread.png', category: 'Bakery' },
  { id: 5, name: 'Cheese', price: 120, image: '/cheese.png', category: 'Dairy' },
  { id: 6, name: 'Chicken', price: 250, image: '/chicken.png', category: 'Meat' },
  { id: 7, name: 'Carrot', price: 20, image: '/carrot.png', category: 'Vegetables' },
]);

// Inject cart functions
const cart = inject("cart") as any;
const addToCart = inject("addToCart") as any;
const removeFromCart = inject("removeFromCart") as any;
const removeAll = inject("removeAll") as any;

// Cart helpers
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

// Filters
const search = ref("");
const selectedCategory = ref("All");

// Available categories
const categories = ref<string[]>([
  "All",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Meat",
  "Beverages",
  "Snacks",
  "Frozen Foods",
  "Household Items"
]);

// Computed filtered products
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesCategory =
      selectedCategory.value === "All" || product.category === selectedCategory.value;
    const matchesSearch =
      product.name.toLowerCase().includes(search.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});
</script>

<template>
  <div class="products-container">
    <h2>Products</h2>

    <!-- Filters -->
    <div class="filters">
      <v-text-field
        v-model="search"
        label="Search Products"
        prepend-inner-icon="mdi-magnify"
        clearable
      />
      <v-select
        v-model="selectedCategory"
        :items="categories"
        label="Category"
      />
    </div>

    <!-- Products Grid -->
    <div class="product-grid">
      <div class="product-card" v-for="product in filteredProducts" :key="product.id">
        <img :src="product.image" class="product-image" @click="$router.push({name:'ProductDetail', params: {id: product.id}})"/>
        <h3 @click="$router.push({name:'ProductDetail', params: {id: product.id}})">{{ product.name }}</h3>
        <p>₹{{ product.price }}</p>
        <p class="category-label">{{ product.category }}</p>
        <div v-if="cartItem(product)" class="cart-controls">
          <v-btn size="small" color="red" icon @click="decrease(product)">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
          <span>{{ cartItem(product).quantity }}</span>
          <v-btn size="small" color="green" icon @click="increase(product)">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn size="small" icon color="error" @click="remove(product)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
        <v-btn v-else color="primary" @click="addToCart(product)">
          Add to Cart
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-container {
  padding: 16px;
}

/* Filters */
.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

/* Product Card */
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
.cart-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 8px 0;
}
.category-label {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 8px;
}
</style>
