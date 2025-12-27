<script setup lang="ts">
import { inject, ref, onMounted } from "vue";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity?: number;
}

// --- State ---
const products = ref<Product[]>([]);
const featuredProducts = ref<Product[]>([]);
const loading = ref(true);
const API_BASE = "http://localhost:8080/api/products"; // Public endpoint

// --- API Functions ---
async function fetchHomeData() {
  loading.value = true;
  try {
    // 1. Featured Products load karo
    const featuredRes = await axios.get(`${API_BASE}/featured`);
    featuredProducts.value = featuredRes.data;

    // 2. All Active Products load karo (Grid ke liye)
    const productsRes = await axios.get(`${API_BASE}/getProducts`, {
      params: { size: 12 } // Pehle 12 products dikhao
    });
    // Agar backend Page object bhej raha hai toh .content use karein
    products.value = productsRes.data.content || productsRes.data;
  } catch (error) {
    console.error("Error loading products:", error);
  } finally {
    loading.value = false;
  }
}

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
// Full path for images (Backend storage path)
function getImageUrl(url: string) {
  return url ? `http://localhost:8080${url}` : '/placeholder.png';
}
onMounted(() => {
  fetchHomeData();
});
</script>

<template>
  <div class="home-container">
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>

    <section v-if="featuredProducts.length > 0" class="featured-section">
      <h2 class="section-title text-high-emphasis mb-4">🌟 Featured Products</h2>
      <v-slide-group show-arrows class="featured-slider pb-4">
        <v-slide-group-item v-for="product in featuredProducts" :key="product.id">
          <v-card class="featured-card ma-2" width="220" elevation="2" rounded="lg">
            <v-img 
              :src="getImageUrl(product.imageUrl)" 
              height="160" 
              cover 
              class="cursor-pointer"
              @click="$router.push({name:'ProductDetail', params: {id: product.id}})"
            />
            <v-card-text class="text-center pt-2">
              <div class="text-subtitle-1 font-weight-bold">{{ product.name }}</div>
              <div class="text-primary font-weight-black">₹{{ product.price }}</div>
            </v-card-text>
            
            <v-card-actions class="justify-center pb-4">
              <div v-if="cartItem(product)" class="d-flex align-center gap-2">
                <v-btn size="x-small" icon color="error" variant="tonal" @click="removeFromCart(product)"><v-icon>mdi-minus</v-icon></v-btn>
                <span class="font-weight-bold">{{ cartItem(product).quantity }}</span>
                <v-btn size="x-small" icon color="success" variant="tonal" @click="addToCart(product)"><v-icon>mdi-plus</v-icon></v-btn>
              </div>
              <v-btn v-else color="primary" variant="flat" size="small" rounded @click="addToCart(product)">
                Add to Cart
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </section>

    <section class="product-grid-section mt-6">
      <h2 class="text-h5 font-weight-bold text-high-emphasis mb-4">All Products</h2>
      <v-row v-if="products.length > 0">
        <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="4" lg="3">
          <v-card elevation="1" rounded="lg" class="product-card-main">
            <v-img 
              :src="getImageUrl(product.imageUrl)" 
              height="180" 
              cover
              @click="$router.push({name:'ProductDetail', params: {id: product.id}})"
            />
            <v-card-title class="text-subtitle-1 pb-0">{{ product.name }}</v-card-title>
            <v-card-subtitle class="text-primary font-weight-bold">₹{{ product.price }}</v-card-subtitle>
            
            <v-card-actions class="pa-4">
              <div v-if="cartItem(product)" class="d-flex align-center justify-space-between w-100">
                <v-btn size="small" icon color="error" @click="removeFromCart(product)"><v-icon>mdi-minus</v-icon></v-btn>
                <span class="text-h6">{{ cartItem(product).quantity }}</span>
                <v-btn size="small" icon color="success" @click="addToCart(product)"><v-icon>mdi-plus</v-icon></v-btn>
              </div>
              <v-btn v-else block color="primary" variant="elevated" @click="addToCart(product)">
                Add to Cart
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <div v-else-if="!loading" class="text-center pa-10 text-grey">
        No products found.
      </div>
    </section>
  </div>
</template>

<style scoped>
.featured-card {
  transition: transform 0.3s ease;
}
.featured-card:hover {
  transform: scale(1.05);
}
.product-card-main {
  transition: box-shadow 0.3s;
}
.product-card-main:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.15) !important;
}
.cursor-pointer {
  cursor: pointer;
}
</style>