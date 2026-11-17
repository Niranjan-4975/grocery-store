<script setup lang="ts">
import { inject, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n"; // ✅ Added for translation
import api from "../../axios";
import ProductCard from "../common/ProductCard.vue"; // ✅ Reusing our Master Card

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category?: { id: number; name: string };
  description: string;
  quantity?: number;
  wishlisted?: boolean; // ✅ For Heart Icon sync
}

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// --- State ---
const product = ref<Product | null>(null);
const loading = ref(true);
const recommended = ref<Product[]>([]);

// ✅ Helper to translate category names
function translateCategory(catName?: string) {
  if (!catName) return t('nav.categories');
  const key = `categories.${catName.toLowerCase().replace(/\s+/g, '_')}`;
  const translated = t(key);
  return translated === key ? catName : translated;
}

async function fetchProductDetail() {
  loading.value = true;
  const productId = route.params.id;
  try {
    const response: any = await api.get(`/products/getProducts/${productId}`);
    product.value = response;
    
    if (product.value && product.value.category) {
      fetchRecommendedProducts();
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

async function fetchRecommendedProducts() {
  if (!product.value || !product.value.category) return;
  try {
    const response: any = await api.get(`/products/getProducts`, {
      params: { 
        categoryId: product.value.category.id,
        size: 8 
      }
    });
    const allItems = response.content;
    recommended.value = allItems.filter((p: Product) => p.id !== product.value?.id);
  } catch (error) {}
}

const cart = inject("cart") as any;
const addToCart = inject("addToCart") as any;
const removeFromCart = inject("removeFromCart") as any;
const removeAll = inject("removeAll") as any;

function cartItem(p: Product) {
  return cart.value.find((item: any) => item.id === p.id);
}

function getImageUrl(url: string) {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${import.meta.env.VITE_IMAGE_API_URL}${url}`;
}

function goBack() { router.back(); }

onMounted(fetchProductDetail);
watch(() => route.params.id, fetchProductDetail);
</script>

<template>
  <v-container class="product-detail-container pb-12">
    <v-row v-if="loading" justify="center" align="center" style="min-height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-row>

    <div v-else-if="product">
      <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="goBack" class="mb-4 text-none">
        {{ $t('product.back') }}
      </v-btn>

      <v-row>
        <v-col cols="12" md="5">
          <v-hover v-slot="{ isHovering, props }">
            <v-card v-bind="props" :elevation="isHovering ? 8 : 2" rounded="xl" class="overflow-hidden">
              <v-img :src="getImageUrl(product.imageUrl)" aspect-ratio="1" cover>
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-card>
          </v-hover>
        </v-col>

        <v-col cols="12" md="7" class="pl-md-10">
          <div class="d-flex align-center mb-2">
            <span class="text-overline text-primary font-weight-bold">{{ translateCategory(product.category?.name) }}</span>
          </div>
          <h1 class="text-h3 font-weight-bold mb-4">{{ product.name }}</h1>
          
          <div class="text-h4 font-weight-black text-success mb-6">
            ₹{{ product.price?.toLocaleString('en-IN') }}
          </div>

          <v-divider class="mb-6"></v-divider>

          <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ $t('product.description') }}</h3>
          <p class="text-body-1 text-grey-darken-2 mb-8 leading-relaxed">
            {{ product.description || $t('product.no_desc') }}
          </p>

          <div class="pa-6 bg-grey-lighten-4 rounded-lg">
            <div v-if="cartItem(product)" class="d-flex align-center justify-space-between">
              <div class="d-flex align-center gap-4">
                <v-btn size="large" color="error" icon variant="elevated" @click="removeFromCart(product)">
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
                <span class="text-h4 font-weight-bold px-4">{{ cartItem(product).quantity }}</span>
                <v-btn size="large" color="success" icon variant="elevated" @click="addToCart(product)">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </div>
              <v-btn color="error" variant="text" prepend-icon="mdi-delete" @click="removeAll(product)">
                {{ $t('cart.remove_all') }}
              </v-btn>
            </div>
            <v-btn v-else color="primary" size="x-large" rounded="pill" block elevation="4" prepend-icon="mdi-cart-plus" @click="addToCart(product)">
              {{ $t('product.add_to_cart') }}
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <div v-if="recommended.length" class="mt-12 pt-12 border-t">
        <h3 class="text-h5 font-weight-bold mb-6">✨ {{ $t('product.recommended') }}</h3>
        <v-slide-group show-arrows>
          <v-slide-group-item v-for="rec in recommended" :key="rec.id">
            <div class="ma-2" style="width: 200px;">
              <ProductCard :product="rec" image-height="140" />
            </div>
          </v-slide-group-item>
        </v-slide-group>
      </div>
    </div>

    <v-row v-else justify="center" align="center" style="min-height: 400px;" class="text-center">
      <v-col>
        <v-icon size="100" color="grey-lighten-2">mdi-basket-remove</v-icon>
        <h3 class="text-h5 mt-4 text-grey-darken-1">{{ $t('product.not_found') }}</h3>
        <v-btn color="primary" variant="flat" rounded="pill" class="mt-6 px-8" @click="router.push('/home')">
          {{ $t('product.go_home') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.product-detail-container { max-width: 1200px; }
.gap-4 { gap: 16px; }
.border-t { border-top: 2px solid #f5f5f5; }
.leading-relaxed { line-height: 1.6; }
</style>