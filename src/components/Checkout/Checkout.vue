<script setup lang="ts">
import { inject, computed } from "vue";
import { useRouter } from "vue-router";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

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
function confirmOrder() {
  if (!cart.value.length) {
    alert("🛒 Your cart is empty!");
    return;
  }
  alert(`✅ Order Confirmed! Total: ₹${total.value}`);
  cart.value = [];
  router.push("/home");
}
</script>

<template>
  <div class="checkout-container">
    <h2>My Cart</h2>

    <div v-if="cart.length">
      <v-card
        v-for="item in cart"
        :key="item.id"
        class="cart-item"
      >
        <img :src="item.image" class="item-image" />
        <div class="item-info">
          <h3>{{ item.name }}</h3>
          <p>Price: ₹{{ item.price }}</p>
          <p>Subtotal: ₹{{ (item.price * (item.quantity || 0)).toFixed(2) }}</p>

          <div class="cart-controls">
            <v-btn size="small" color="red" icon @click="decrease(item)">
              <v-icon>mdi-minus</v-icon>
            </v-btn>
            <span>{{ item.quantity }}</span>
            <v-btn size="small" color="green" icon @click="increase(item)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-btn size="small" color="error" icon @click="remove(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card>

      <div class="checkout-summary">
        <h3>Total: ₹{{ total.toFixed(2) }}</h3>
        <v-btn color="success" block @click="confirmOrder">
          Confirm Order
        </v-btn>
      </div>
    </div>

    <div v-else class="empty-cart">
      <p>🛒 Your cart is empty.</p>
      <v-btn text @click="$router.push('/home')">Go to Home</v-btn>
    </div>
  </div>
</template>

<style scoped>
.checkout-container {
  padding: 16px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.item-info {
  flex: 1;
}

.cart-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.checkout-summary {
  margin-top: 24px;
  text-align: right;
}

.empty-cart {
  text-align: center;
  margin-top: 50px;
}
</style>
