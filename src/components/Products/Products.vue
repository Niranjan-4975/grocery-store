<script setup lang="ts">
import { inject, ref, computed, onMounted } from "vue";
import api from "../../axios";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: { name: string };
  quantity?: number;
}

// Sample product list
const products = ref<Product[]>([]);
const loading = ref(false);

// Fetch products from API (replace with real API endpoint)
async function fetchProducts() {
  loading.value = true;
  try {
    const response: any = await api.get("/products/getProducts");
    products.value = response.content;
  } catch (error) {
    return { success: false};
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProducts();
  fetchCategories();
});
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
const categories = ref<string[]>(["All"]);

// Populate categories based on products
async function fetchCategories() {
  try{
    const response: any = await api.get("/categories");
    const backendCats = response.map((c: any) => c.name);
    categories.value = ["All", ...backendCats];
  } catch (error) {
    return { success: false};
  }
}

// Computed filtered products
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesCategory =
      selectedCategory.value === "All" || 
      (product.category && product.category.name === selectedCategory.value);
    const matchesSearch =
      product.name.toLowerCase().includes(search.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});

function getImageUrl(url: string) {
  return url ? `${import.meta.env.VITE_IMAGE_API_URL}${url}` : '/placeholder.png';
}
</script>

<template>
  <div class="products-container">
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
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
        <v-img
          :src="getImageUrl(product.imageUrl)"
          height="150"
          cover
          class="product-image rounded-lg mb-3"
          @click="$router.push({name:'ProductDetail', params: {id: product.id}})"
        >
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
            </v-row>
          </template>
        </v-img>
        <h3 class="cursor-pointer" @click="$router.push({name:'ProductDetail', params: {id: product.id}})">
          {{ product.name }}
        </h3>
        <p class="text-primary font-weight-bold">₹{{ product.price }}</p>
        <p class="category-label">{{ product.category?.name || 'Uncategorized' }}</p>
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
