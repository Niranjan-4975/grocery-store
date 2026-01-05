<script setup lang="ts">
import { inject, ref, onMounted } from "vue";
import api from "../../axios";

// --- Types ---
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category?: { name: string };
  quantity?: number;
}

// --- State ---
const products = ref<Product[]>([]);
const featuredProducts = ref<Product[]>([]);
const loading = ref(true);

// --- API Functions ---
async function fetchHomeData() {
  loading.value = true;
  try {
    // 1. Featured Products
    const featuredRes: any = await api.get("/products/featured");
    featuredProducts.value = featuredRes;

    // 2. All Products
    const productsRes: any = await api.get("/products/getProducts");
    products.value = productsRes.content;
  } catch (error) {
    return { success: false};
  } finally {
    loading.value = false;
  }
}

// Inject cart operations
const cart = inject("cart") as any;
const addToCart = inject("addToCart") as any;
const removeFromCart = inject("removeFromCart") as any;
const removeAll = inject("removeAll") as any;

// Exact helper functions from your products page
function cartItem(product: Product) {
  return cart.value.find((p: Product) => p.id === product.id);
}
function increase(product: Product) { addToCart(product); }
function decrease(product: Product) { removeFromCart(product); }
function remove(product: Product) { removeAll(product); }

function getImageUrl(url: string) {
  return url ? `${import.meta.env.VITE_IMAGE_API_URL}${url}` : '/placeholder.png';
}

onMounted(fetchHomeData);
</script>

<template>
  <v-container fluid class="pa-4 pt-6">
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>

    <section v-if="featuredProducts.length > 0" class="mb-10">
      <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">🌟 Featured Products</h2>
      <v-slide-group show-arrows class="pb-4">
        <v-slide-group-item v-for="product in featuredProducts" :key="product.id">
          <v-card class="featured-card ma-2" width="220" elevation="2" rounded="lg">
            <v-img 
              :src="getImageUrl(product.imageUrl)" 
              height="160" 
              cover 
              class="cursor-pointer"
              @click="$router.push({name:'ProductDetail', params: {id: product.id}})"
            />
            <v-card-text class="text-center pt-2 pb-0">
              <div class="text-subtitle-1 font-weight-bold">{{ product.name }}</div>
              <div class="text-primary font-weight-black">₹{{ product.price }}</div>
            </v-card-text>
            
            <v-card-actions class="justify-center pb-4 pt-2">
              <div v-if="cartItem(product)" class="cart-controls">
                <v-btn size="small" color="red" icon @click="decrease(product)">
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
                <span class="mx-1 font-weight-bold">{{ cartItem(product).quantity }}</span>
                <v-btn size="small" color="green" icon @click="increase(product)">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn size="small" icon color="error" @click="remove(product)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
              <v-btn v-else color="primary" variant="flat" size="small" rounded block @click="addToCart(product)">
                Add to Cart
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </section>

    <v-divider class="my-6"></v-divider>

    <section class="mt-6">
      <h2 class="text-h5 font-weight-bold mb-6">All Products</h2>
      <v-row v-if="products.length > 0">
        <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="4" lg="3">
          <v-card elevation="1" rounded="lg" class="product-card-main pa-2">
            <v-img 
              :src="getImageUrl(product.imageUrl)" 
              height="180" 
              cover
              class="rounded-lg cursor-pointer"
              @click="$router.push({name:'ProductDetail', params: {id: product.id}})"
            />
            <v-card-title class="text-subtitle-1 pb-0 font-weight-bold">{{ product.name }}</v-card-title>
            <v-card-subtitle class="text-primary font-weight-black text-body-1">₹{{ product.price }}</v-card-subtitle>
            
            <v-card-actions class="pa-2 mt-2">
              <div v-if="cartItem(product)" class="cart-controls w-100 justify-space-between px-1">
                <div class="d-flex align-center">
                  <v-btn size="small" color="red" icon @click="decrease(product)">
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                  <span class="mx-2 font-weight-bold">{{ cartItem(product).quantity }}</span>
                  <v-btn size="small" color="green" icon @click="increase(product)">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
                <v-btn size="small" icon color="error" @click="remove(product)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
              <v-btn v-else block color="primary" variant="elevated" rounded @click="addToCart(product)">
                Add to Cart
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </section>
  </v-container>
</template>

<style scoped>
/* 🚀 Featured/Product Cards original hover effects */
.featured-card {
  transition: all 0.3s ease;
}
.featured-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
}
.product-card-main {
  transition: all 0.3s ease;
}
.product-card-main:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.12) !important;
  transform: scale(1.02);
}

/* 🎯 CUSTOM BUTTONS CSS FROM PRODUCTS PAGE */
.cart-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* Space between buttons */
  margin: 8px 0;
}

/* Circular Buttons styling if needed */
.v-btn--icon.v-btn--size-small {
  width: 32px;
  height: 32px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>