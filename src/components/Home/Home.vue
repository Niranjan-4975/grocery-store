<template>
  <v-container fluid class="pa-4 pt-6">
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4">{{ $t('nav.loading') }}</v-progress-linear>
    
    <section v-if="featuredProducts.length > 0" class="mb-10">
      <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">🌟 {{ $t('product.featured') }}</h2>
      <v-slide-group show-arrows class="pb-4">
        <v-slide-group-item v-for="product in featuredProducts" :key="product.id">
          <div class="ma-2" style="width: 220px;">
            <ProductCard :product="product" image-height="160" />
          </div>
        </v-slide-group-item>
      </v-slide-group>
    </section>

    <v-divider class="my-6"></v-divider>

    <section class="mt-6">
      <h2 class="text-h5 font-weight-bold mb-6">🌟 {{ $t('product.all_products') }}</h2>
      <v-row v-if="products.length > 0">
        <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="4" lg="3">
          <ProductCard :product="product" image-height="200" />
        </v-col>
      </v-row>
      <v-row v-else-if="!loading" justify="center" class="mt-10">
        <v-col cols="12" class="text-center">
          <v-icon size="64" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
          <p class="text-grey-darken-1 mt-2">{{ $t('product.not_found') }}</p>
        </v-col>
      </v-row>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../../axios";
import ProductCard from "../common/ProductCard.vue";

const products = ref<any[]>([]);
const featuredProducts = ref<any[]>([]);
const loading = ref(true);

async function fetchHomeData() {
  loading.value = true;
  try {
    const featuredRes: any = await api.get("/products/featured");
    featuredProducts.value = featuredRes;
    const productsRes: any = await api.get("/products/getProducts");
    products.value = productsRes.content;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchHomeData);
</script>
<style scoped>
/* Home page specific spacing */
section h2 {
  border-left: 4px solid #1867C0;
  padding-left: 12px;
}
</style>