<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted, watch} from "vue";
import api from "../../axios";
import { useSocket } from "../../composables/useSocket";
import { useRoute } from "vue-router";
import ProductCard from "../common/ProductCard.vue";

const route = useRoute();
const { onStockUpdate } = useSocket();
let stopListening: (() => void) | null = null;
// Search sync
const searchQuery = ref("");
watch(() => route.query.q, (newVal) => {
  searchQuery.value = (newVal as string) || "";
}, { immediate: true });

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: { name: string };
  quantity?: number;
  stock: number;
}

function getProductsByCategory(catName: string) {
  return products.value.filter(p => p.category?.name === catName);
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
  if (route.query.q) {
    search.value = route.query.q as string;
  }
  fetchProducts();
  fetchCategories();
  // ✅ Register listener
  stopListening = onStockUpdate((updates) => {
    console.log("New stock update received:", updates);
    updates.forEach((u: any) => {
      // Products list mein dhundo
      const p = products.value.find(item => item.id === u.productId);
      if (p) {
        p.stock = u.newStock; // UI turant update hogi!
      }
    });
  })
});
onUnmounted(() => {
  if (stopListening) stopListening();
});
// Filters
const search = ref("");
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

// ✅ Filter Logic updated to use route query
const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesSearch;
  });
});
</script>

<template>
  <div class="products-container">
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <template v-if="searchQuery">
      <div class="px-4 d-flex align-center mb-4">
        <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/product')"></v-btn>
        <h2 class="ml-2">Results for "{{ searchQuery }}"</h2>
      </div>
      <div class="product-grid px-4">
        <ProductCard v-for="p in filteredProducts" :key="p.id" :product="p" />
      </div>
    </template>

    <template v-else>
      <div v-for="cat in categories.filter(c => c !== 'All')" :key="cat" class="category-section mb-8">
        <div class="d-flex align-center justify-space-between px-4 mb-2">
          <h2 class="text-h6 font-weight-bold">{{ cat }}</h2>
          <v-btn variant="text" density="compact" color="primary">View All</v-btn>
        </div>
        
        <div class="horizontal-scroll-wrapper">
          <div class="horizontal-scroll-content">
            <div class="scroll-item" v-for="product in getProductsByCategory(cat)" :key="product.id">
               <ProductCard :product="product" /> </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<style scoped>
.horizontal-scroll-wrapper {
  overflow-x: auto;
  white-space: nowrap;
  padding: 10px 0;
  scrollbar-width: none; /* Firefox */
}
/* Scroller CSS remains same */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 16px;
}
.horizontal-scroll-wrapper::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}
.horizontal-scroll-content {
  display: flex;
  gap: 16px;
  padding: 0 16px;
}
.scroll-item {
  flex: 0 0 180px; /* Card width fix */
}
.product-card-mini {
  border: 1px solid #eee;
  border-radius: 12px;
  background: white;
  transition: transform 0.2s;
}
.product-card-mini:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
