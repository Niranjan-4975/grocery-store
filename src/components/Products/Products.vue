<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import api from "../../axios";
import { useSocket } from "../../composables/useSocket";
import { useRoute } from "vue-router";
import ProductCard from "../common/ProductCard.vue";

const route = useRoute();
const { onStockUpdate } = useSocket();
let stopListening: (() => void) | null = null;

// --- State ---
const products = ref<any[]>([]);
const categories = ref<string[]>(["All"]);
const selectedCategoryId = ref(0);
const loading = ref(false);

// ✅ Missing Pagination Refs (Add these)
const page = ref(1);
const itemsPerPage = ref(20); // Default items
const searchQuery = ref("");

// --- Methods ---
function getProductsByCategory(catName: string) {
  return products.value.filter(p => p.category?.name === catName);
}

async function fetchProducts() {
  loading.value = true;
  try {
    const response: any = await api.get("/products/getProducts", {
      params: { 
        search: searchQuery.value,
        categoryId: selectedCategoryId.value !== 0 ? selectedCategoryId.value : null,
        page: page.value - 1, 
        size: itemsPerPage.value
      }
    });
    products.value = response.content;
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    const response: any = await api.get("/categories");
    const backendCats = response.map((c: any) => c.name);
    categories.value = ["All", ...backendCats];
  } catch (error) {}
}

// ✅ Watch for route query changes and trigger fetch
watch(() => route.query.q, (newVal) => {
  searchQuery.value = (newVal as string) || "";
  fetchProducts(); // Jab bhi search badle, API call karo
}, { immediate: true });

// ✅ Filter Logic (Local fallback)
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  return products.value.filter((p) => 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(() => {
  // fetchProducts watch mein handle ho raha hai immediate: true se
  fetchCategories();
  stopListening = onStockUpdate((updates) => {
    updates.forEach((u: any) => {
      const p = products.value.find(item => item.id === u.productId);
      if (p) p.stock = u.newStock;
    });
  });
});

onUnmounted(() => { if (stopListening) stopListening(); });
</script>

<template>
  <div class="products-container">
    <v-progress-linear v-if="loading" indeterminate color="primary" fixed top>{{ $t('nav.loading') }}</v-progress-linear>

    <template v-if="searchQuery">
      <div class="px-4 d-flex align-center mb-4 pt-4">
        <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/product')"></v-btn>
        <h2 class="text-h6 ml-2 font-weight-bold">{{ $t('product.Results for {query}', { query: searchQuery }) }}</h2>
      </div>
      <div v-if="filteredProducts.length === 0 && !loading" class="pa-10 text-center">
        <v-icon size="64" color="grey">mdi-magnify-minus</v-icon>
        <p class="text-grey">{{ $t('product.No products found matching your search.') }}</p>
      </div>
      <div class="product-grid px-4">
        <ProductCard v-for="p in filteredProducts" :key="p.id" :product="p" />
      </div>
    </template>

    <template v-else>
      <div v-for="cat in categories.filter(c => c !== 'All')" :key="cat" class="category-section mb-8 pt-4">
        <div class="d-flex align-center justify-space-between px-4 mb-2">
          <h2 class="text-subtitle-1 font-weight-bold">{{ cat }}</h2>
          <v-btn variant="text" density="compact" color="primary" class="text-none">{{ $t('product.View All') }}</v-btn>
        </div>
        
        <div class="horizontal-scroll-wrapper">
          <div class="horizontal-scroll-content">
            <div class="scroll-item" v-for="product in getProductsByCategory(cat)" :key="product.id">
               <ProductCard :product="product" image-height="150" /> 
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Scroller and Grid CSS */
.horizontal-scroll-wrapper { overflow-x: auto; scrollbar-width: none; padding-bottom: 10px; }
.horizontal-scroll-wrapper::-webkit-scrollbar { display: none; }
.horizontal-scroll-content { display: flex; gap: 16px; padding: 0 16px; }
.scroll-item { flex: 0 0 190px; }
.product-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); 
  gap: 16px; 
  padding-bottom: 30px;
}
@media (max-width: 600px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}
</style>