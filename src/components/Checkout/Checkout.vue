<script setup lang="ts">
import { ref, inject, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../../axios";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity?: number;
}

const shippingAddress = ref("");
const selectedPayment = ref("COD");
const paymentOptions = ["COD", "Online Payment"];
// Inject cart operations
const cart = inject("cart") as any;
const addToCart = inject("addToCart") as any;
const removeFromCart = inject("removeFromCart") as any;
const removeAll = inject("removeAll") as any;

const router = useRouter();


function increase(product: Product) {
  addToCart(product);
}
function decrease(product: Product) {
  removeFromCart(product);
}
function remove(product: Product) {
  removeAll(product);
}

// Compute total
const total = computed(() => {
  return cart.value.reduce((acc: number, item: Product) => {
    return acc + item.price * (item.quantity || 0);
  }, 0);
});

// Confirm order
async function confirmOrder() {
  if (!cart.value.length) {
    alert("🛒 Your cart is empty!");
    return;
  }
  if (!shippingAddress.value) {
    alert("📍 Please enter a shipping address.");
    return;
  }
  //1. Prepare order payload
  const orderPayload = {
    shippingAddress: shippingAddress.value || "Default Address",
    paymentMethod: selectedPayment.value || "COD",
    items: cart.value.map((item: Product) => ({
      productId: item.id,
      quantity: item.quantity,
    }))
  };
  try {
    //2. Send order to backend
    const response = await api.post(`/orders/place`, orderPayload);
    if (response.status === 201 || response.status === 200) {
      alert(`✅ Order Confirmed! Order ID: ${response.data.id}`);
      cart.value = []; // Clear cart locally
      router.push("/orders");
    }
  } catch (error: any) {
    console.error("Order Placement Error:", error);
    alert(`Failed to place order: ${error.response?.data?.message || 'Check console'}`);
  }
}

function getImageUrl(url: string) {
  return url ? `${import.meta.env.VITE_IMAGE_API_URL}${url}` : '/placeholder.png';
}
</script>

<template>
  <v-container class="checkout-container">
    <h2 class="mb-4">My Cart</h2>

    <v-row v-if="cart.length">
      <v-col cols="12" md="8">
        <v-card v-for="item in cart" :key="item.id" class="cart-item mb-4" variant="outlined">
          <div class="d-flex align-center pa-3">
            <v-img :src="getImageUrl(item.imageUrl)" cover class="rounded-lg mr-4">
            </v-img>
            <div class="flex-grow-1 item-info">
              <h3 class="text-subtitle-1 font-weight-bold">{{ item.name }}</h3>
              <p class="text-caption">Price: ₹{{ item.price }} | Subtotal: ₹{{ (item.price * (item.quantity || 0)).toFixed(2) }}</p>
              <div class="cart-controls mt-2">
                <v-btn size="x-small" color="red" icon @click="decrease(item)">
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
                <span class="mx-3 font-weight-bold">{{ item.quantity }}</span>
                <v-btn size="x-small" color="green" icon @click="increase(item)">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn size="x-small" color="grey-lighten-1" icon class="ml-4" @click="remove(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4" elevation="2">
          <h3 class="mb-4">Shipping Details</h3>
          <v-textarea
            label="Delivery Address"
            v-model="shippingAddress"
            rows="3"
            outlined
            dense
            class="mb-4"
          ></v-textarea>
          <v-select
            :items="paymentOptions"
            label="Payment Method"
            v-model="selectedPayment"
            outlined
            dense
          ></v-select>
          <v-divider class="my-4"></v-divider>
          <div class="d-flex justify-space-between text-h6 mb-4">
            <span>Total:</span>
            <span class="text-success">₹{{ total.toFixed(2) }}</span>
          </div>
          <v-btn color="primary" block large @click="confirmOrder">
            Confirm Order
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
    <div v-else class="text-center py-10 empty-cart">
      <v-icon size="64" color="grey-lighten-1">mdi-cart-outline</v-icon>
      <p class="text-h6 text-grey mt-3">🛒 Your cart is empty.</p>
      <v-btn color="primary" class="mt-4" @click="$router.push('/home')">Start Shopping</v-btn>
    </div>
  </v-container>
</template>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
}
.cart-controls {
  display: flex;
  align-items: center;
}
</style>
