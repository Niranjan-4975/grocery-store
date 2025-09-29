<script setup lang="ts">
import { inject, ref, computed, onMounted, watch} from "vue";
import { useRoute, useRouter } from "vue-router";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  quantity?: number;
}

// Sample product data (in real app, fetch from API)
const products = ref<Product[]>([
  { id: 1, name: 'Apple', price: 50, image: '/apple.png', category: 'Fruits', description: 'Fresh and juicy apples from local farms.' },
  { id: 2, name: 'Banana', price: 30, image: '/banana.png', category: 'Fruits', description: 'Ripe bananas packed with nutrients.' },
  { id: 3, name: 'Milk', price: 45, image: '/milk.png', category: 'Dairy', description: 'Organic whole milk, fresh daily.' },
  { id: 4, name: 'Bread', price: 40, image: '/bread.png', category: 'Bakery', description: 'Soft and fluffy whole wheat bread.' },
  { id: 5, name: 'Cheese', price: 120, image: '/cheese.png', category: 'Dairy', description: 'Delicious cheese, perfect for sandwiches.' },
]);

// Cart injections
const cart = inject("cart") as any;
const addToCart = inject("addToCart") as any;
const removeFromCart = inject("removeFromCart") as any;
const removeAll = inject("removeAll") as any;

// Route
const route = useRoute();
const router = useRouter();

//reactive product
const product = ref<Product | null>(null);
//load product by route param
function loadProduct(){
  const productId = Number(route.params.id);
  product.value = products.value.find((p) => p.id === productId) || null;
}
onMounted(loadProduct);
watch(() => route.params.id, loadProduct);

//Recommended products
const recommended = computed(() =>{
  if(!product.value) return [];
  return products.value.filter(
    (p) => p.category === product.value?.category && p.id !== product.value?.id
  );
});

// Cart helpers
function cartItem(product: Product) {
  return cart.value.find((p: Product) => p.id === product.id);
}

function increase(product: Product) {
  addToCart(product);
}

function decrease(product: Product) {
  removeFromCart(product);
}

function remove(product: Product) {
  removeAll(product);
}

// Navigate back
function goBack() {
  router.back();
}
function goToProduct(id: number){
  console.log("router")
  router.replace(`/product/${id}`);
}
</script>

<template>
  <div class="product-detail-container" v-if="product">
    <v-btn text @click="goBack">← Back</v-btn>

    <div class="product-detail">
      <img :src="product.image" class="product-image" />
      <div class="product-info">
        <h2>{{ product.name }}</h2>
        <p class="category-label">{{ product.category }}</p>
        <p class="price">₹{{ product.price }}</p>
        <p class="description">{{ product.description }}</p>

        <div v-if="cartItem(product)" class="cart-controls">
          <v-btn size="small" color="red" icon @click="decrease(product)">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
          <span>{{ cartItem(product).quantity }}</span>
          <v-btn size="small" color="green" icon @click="increase(product)">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn size="small" icon color="error" @click="remove(product)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
        <v-btn v-else color="primary" @click="addToCart(product)">
          Add to Cart
        </v-btn>
      </div>
    </div>

    <!--Recomended Section-->
    <div v-if="recommended.length" class="recommended-section">
      <h3>Recommended for You</h3>
      <v-slide-group show-arrows>
        <v-slide-item v-for="rec in recommended" :key="rec.id">
          <v-card class="ma-2" outlined width="160" @click="goToProduct(rec.id)">
            <v-img :src="rec.image" height="100"></v-img>
            <v-card-title class="text-subtitle-2">{{ rec.name }}</v-card-title>
            <v-card-subtitle>₹{{ rec.price }}</v-card-subtitle>
          </v-card>
        </v-slide-item>
      </v-slide-group>
    </div>
  </div>

  <div v-else class="product-not-found">
    <h3>Product not found.</h3>
    <v-btn text @click="goBack">Go Back</v-btn>
  </div>
</template>

<style scoped>
.product-detail-container {
  padding: 16px;
}

.product-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 16px;
}

.product-image {
  max-width: 300px;
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.category-label {
  font-size: 0.9rem;
  color: #555;
}

.price {
  font-size: 1.4rem;
  font-weight: bold;
  margin: 8px 0;
}

.description {
  margin-bottom: 16px;
}

.cart-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.product-not-found {
  text-align: center;
  margin-top: 50px;
}

.recommended-section{
  margin-top: 32px;
}
</style>
