<script setup lang="ts">
import { inject, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../../axios";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string; // backend key name
  category?: { id: number; name: string }; // backend structured category
  description: string;
  quantity?: number;
}

// --- State ---
const product = ref<Product | null>(null);
const loading = ref(true);
const recommended = ref<Product[]>([]);

const route = useRoute();
const router = useRouter();

// --- API Functions ---

async function fetchProductDetail() {
  loading.value = true;
  const productId = route.params.id;
  try {
    // 1. Fetch current product detail
    const response = await api.get(`/products/getProducts/${productId}`);
    product.value = response.data;
    
    // 2. Fetch recommendations based on category
    if (product.value && product.value.category) {
      fetchRecommendedProducts();
    }
  } catch (error) {
    console.error("Error fetching product detail:", error);
    product.value = null;
  } finally {
    loading.value = false;
  }
}

async function fetchRecommendedProducts() {
  if (!product.value || !product.value.category) return;
  try {
    const response = await api.get(`/products/getProducts`, {
      params: { 
        // ✅ Name search ki jagah ID use karo, ye 100% accurate results dega
        categoryId: product.value.category.id,
        size: 8 
      }
    });
    const allItems = response.data.content || response.data;
    // Current product ko hata do list se
    recommended.value = allItems.filter((p: Product) => p.id !== product.value?.id);
  } catch (error) {
    console.error("Error fetching recommended products:", error);
  }
}
// --- Helpers ---
const cart = inject("cart") as any;
const addToCart = inject("addToCart") as any;
const removeFromCart = inject("removeFromCart") as any;
const removeAll = inject("removeAll") as any;

function cartItem(p: Product) {
  return cart.value.find((item: any) => item.id === p.id);
}

function getImageUrl(url: string) {
  return url ? `${import.meta.env.VITE_IMAGE_API_URL}${url}` : '/placeholder.png';
}

// Navigate back
function goBack() { router.back(); }

function goToProduct(id: number) {
  router.push(`/product/${id}`);
}

// React to route changes (jab user recommended product par click kare)
onMounted(fetchProductDetail);
watch(() => route.params.id, fetchProductDetail);
</script>

<template>
  <v-container class="product-detail-container">
    <v-row v-if="loading" justify="center" align="center" style="min-height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-row>

    <div v-else-if="product">
      <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="goBack" class="mb-4">Back</v-btn>

      <v-row>
        <v-col cols="12" md="5">
          <v-img 
            :src="getImageUrl(product.imageUrl)" 
            class="product-image-large rounded-lg border" 
            elevation="2"
            cover
          ></v-img>
        </v-col>

        <v-col cols="12" md="7" class="pl-md-8">
          <h1 class="text-h4 font-weight-bold mb-2">{{ product.name }}</h1>
          <v-chip color="primary" size="small" variant="tonal" class="mb-4">
            {{ product.category?.name || 'General' }}
          </v-chip>
          
          <div class="text-h3 font-weight-black text-primary mb-6">
            ₹{{ product.price?.toLocaleString('en-IN') }}
          </div>
          
          <p class="text-body-1 text-grey-darken-1 mb-8">
            {{ product.description || 'No description available for this product.' }}
          </p>

          <div class="cart-action-section border-t pt-6">
            <div v-if="cartItem(product)" class="d-flex align-center gap-4 mb-4">
              <v-btn size="large" color="red" icon elevation="2" @click="removeFromCart(product)">
                <v-icon>mdi-minus</v-icon>
              </v-btn>
              <span class="text-h5 font-weight-bold px-4">{{ cartItem(product).quantity }}</span>
              <v-btn size="large" color="green" icon elevation="2" @click="addToCart(product)">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
              <v-btn size="large" icon color="error" variant="text" class="ml-4" @click="removeAll(product)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
            <v-btn v-else color="primary" size="large" rounded="pill" block elevation="4" prepend-icon="mdi-cart-plus" @click="addToCart(product)">
              Add to Cart
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <div v-if="recommended.length" class="recommended-section mt-12 pt-12 border-t">
        <h3 class="text-h5 font-weight-bold mb-6">Recommended for You</h3>
        <v-slide-group show-arrows>
          <v-slide-group-item v-for="rec in recommended" :key="rec.id">
            <v-card class="ma-2" elevation="1" width="200" rounded="lg" @click="goToProduct(rec.id)">
              <v-img :src="getImageUrl(rec.imageUrl)" height="140" cover></v-img>
              <v-card-title class="text-subtitle-1 font-weight-bold pb-0">{{ rec.name }}</v-card-title>
              <v-card-subtitle class="text-primary font-weight-black pb-4">₹{{ rec.price }}</v-card-subtitle>
            </v-card>
          </v-slide-group-item>
        </v-slide-group>
      </div>
    </div>

    <v-row v-else justify="center" align="center" style="min-height: 400px;" class="text-center">
      <v-col>
        <v-icon size="100" color="grey-lighten-1">mdi-package-variant-closed-remove</v-icon>
        <h3 class="text-h5 mt-4">Product not found.</h3>
        <v-btn color="primary" variant="flat" class="mt-4" @click="router.push('/')">Go Home</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.product-detail-container {
  max-width: 1200px;
}
.product-image-large {
  width: 100%;
  aspect-ratio: 1;
}
.gap-4 {
  gap: 16px;
}
.border-t {
  border-top: 1px solid rgba(0,0,0,0.1);
}
</style>