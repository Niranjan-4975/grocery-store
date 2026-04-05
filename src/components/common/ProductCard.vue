<script setup lang="ts">
import { inject, computed, ref, watch } from 'vue';
import api from '../../axios';
import { useNotify } from '../../composables/useNotify';

const props = defineProps<{ 
  product: any,
  imageHeight?: string | number 
}>();

const { notify } = useNotify();
const isWishlisted = ref(props.product.wishlisted || false);
const loadingWishlist = ref(false);

const addToCart = inject("addToCart") as any;
const removeFromCart = inject("removeFromCart") as any;
const cart = inject("cart") as any;

const cartItem = computed(() => cart.value.find((p: any) => p.id === props.product.id));

function getImageUrl(url: string) {
  return url ? `${import.meta.env.VITE_IMAGE_API_URL}${url}` : '/placeholder.png';
}

const stockStatus = computed(() => {
  const s = props.product.stock;
  if (s <= 0) return { label: 'Out of Stock', color: 'text-error', icon: 'mdi-close-circle' };
  if (s < 5) return { label: `Only ${s} left!`, color: 'text-red-darken-3', icon: 'mdi-clock-outline' };
  if (s < 10) return { label: `Only ${s} left`, color: 'text-orange-darken-2', icon: 'mdi-clock-outline' };
  return { label: `In Stock`, color: 'text-success', icon: 'mdi-check-circle-outline' };
});

async function toggleWishlist() {
  if (loadingWishlist.value) return;
  loadingWishlist.value = true;
  try {
    const response: any = await api.post(`/wishlist/addWishList/${props.product.id}`);
    const status = response.data || response;
    if (status === 'ADDED') {
      isWishlisted.value = true;
      notify.success("Added to Wishlist ❤️");
    } else {
      isWishlisted.value = false;
      notify.warning("Removed from Wishlist");
    }
  } catch (error) {
    notify.error("Please login to manage wishlist");
  } finally {
    loadingWishlist.value = false;
  }
}
// Props change hone par heart state sync karo
watch(() => props.product.wishlisted, (newVal) => {
  isWishlisted.value = newVal;
}, { immediate: true });
</script>

<template>
  <v-card class="product-card-main" variant='outlined' rounded="lg">
    <v-img 
      :src="getImageUrl(product.imageUrl)" 
      :height="imageHeight || 180" 
      cover 
      class="bg-grey-lighten-4 cursor-pointer"
      @click="$router.push({name:'ProductDetail', params: {id: product.id}})"
    >
      <v-btn
        icon size="small" variant="flat" class="wishlist-btn"
        @click.stop="toggleWishlist" :loading="loadingWishlist"
      >
        <v-icon :color="isWishlisted ? 'red' : 'grey-darken-1'">
          {{ isWishlisted ? 'mdi-heart' : 'mdi-heart-outline' }}
        </v-icon>
      </v-btn>
    </v-img>

    <div class="pa-3">
      <div class="text-subtitle-2 text-truncate font-weight-bold mb-1">{{ product.name }}</div>
      
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="text-primary font-weight-black text-h6">₹{{ product.price }}</div>
        <div :class="['text-caption font-weight-bold', stockStatus.color]">
          <v-icon size="x-small" :class="stockStatus.color" class="mr-1">{{ stockStatus.icon }}</v-icon>
          {{ stockStatus.label }}
        </div>
      </div>

      <div v-if="cartItem" class="d-flex align-center justify-space-between cart-action-row">
        <v-btn icon="mdi-minus" size="x-small" variant="tonal" color="red" @click="removeFromCart(product)"></v-btn>
        <span class="font-weight-bold">{{ cartItem.quantity }}</span>
        <v-btn icon="mdi-plus" size="x-small" variant="tonal" color="green" @click="addToCart(product)"></v-btn>
      </div>
      <v-btn v-else size="small" color="primary" variant="flat" block @click="addToCart(product)" :disabled="product.stock <= 0">
        {{ product.stock <= 0 ? $t('product.out_of_stock') : $t('product.add_to_cart') }}
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.product-card-main { transition: all 0.3s ease; background: white; border-color: #eee !important; }
.product-card-main:hover { transform: translateY(-5px); box-shadow: 0 6px 15px rgba(0,0,0,0.1) !important; border-color: #1867C0 !important; }
.wishlist-btn { position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.8) !important; backdrop-filter: blur(4px); }
.heart-pop { animation: heartBeat 0.3s ease-in-out; }
@keyframes heartBeat { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
.cart-action-row { background: #f8f9fa; border-radius: 8px; padding: 2px 8px; }
</style>