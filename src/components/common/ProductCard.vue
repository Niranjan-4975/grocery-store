<script setup lang="ts">
import { inject, computed } from 'vue';

const props = defineProps<{ product: any }>();

const addToCart = inject("addToCart") as any;
const removeFromCart = inject("removeFromCart") as any;
const cart = inject("cart") as any;

const cartItem = computed(() => cart.value.find((p: any) => p.id === props.product.id));

function getImageUrl(url: string) {
  return url ? `${import.meta.env.VITE_IMAGE_API_URL}${url}` : '/placeholder.png';
}
// ✅ Stock Color Logic
const stockStatus = computed(() => {
  const s = props.product.stock;
  if (s <= 0) return { label: 'Out of Stock', color: 'text-error' };
  if (s < 5) return { label: `Only ${s} left!`, color: 'text-red-darken-3' }; // Red
  if (s < 10) return { label: `Only ${s} left`, color: 'text-orange-darken-2' }; // Orange
  return { label: `In Stock: ${s}`, color: 'text-success' }; // Green
});
</script>

<template>
  <v-card class="product-card-mini" elevation="0">
    <v-img :src="getImageUrl(product.imageUrl)" height="130" cover class="rounded-lg" />
    <div class="pa-2">
      <div class="text-subtitle-2 text-truncate font-weight-bold">{{ product.name }}</div>
      <div class="text-primary font-weight-bold">₹{{ product.price }}</div>
      
      <div class="[text-caption mb-1, stockStatus.color]">
        <v-icon size="x-small" :class="stockStatus.color" class="mr-0.5">
        {{ product.stock > 0 ? 'mdi-clock-outline' : 'mdi-close-circle' }}
        </v-icon>
        {{ stockStatus.label }}
      </div>

      <div v-if="cartItem" class="d-flex align-center justify-space-between">
        <v-btn icon="mdi-minus" size="x-small" color="red" @click="removeFromCart(product)"></v-btn>
        <span class="text-body-2">{{ cartItem.quantity }}</span>
        <v-btn icon="mdi-plus" size="x-small" color="green" @click="addToCart(product)"></v-btn>
      </div>
      <v-btn v-else size="small" color="primary" block @click="addToCart(product)" :disabled="product.stock <= 0">
        {{ product.stock <= 0 ? 'Unavailable' : 'Add to Cart' }}
      </v-btn>
    </div>
  </v-card>
</template>