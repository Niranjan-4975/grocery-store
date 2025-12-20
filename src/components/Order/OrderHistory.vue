<template>
  <v-container class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="3" rounded="xl" class="pa-4">
          <v-card-title class="text-h6">My Order History</v-card-title>
          <v-divider class="mb-4"></v-divider>
          <div v-if="loading" class="text-center py-10">
            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
            <p class="mt-2 text-subtitle-1 text-grey">Loading your order history...</p>
          </div>
          <template v-else-if="orders.length">
            <v-expansion-panels>
              <v-expansion-panel v-for="order in orders" :key="order.id">
                <v-expansion-panel-title>
                  <div class="d-flex justify-space-between w-100 align-center pr-4">
                    <span class="font-weight-bold">Order #{{ order.id }}</span>
                    <span>₹{{ order.totalAmount?.toFixed(2) }}</span>
                    <span class="text-caption text-grey">{{ formatDate(order.orderDate) }}</span>
                    <v-chip :color="statusColor(order.status)" size="small" class="ml-2">
                      {{ order.status }}
                    </v-chip>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list lines="two">
                    <v-list-item v-for="item in order.items" :key="item.id" class="px-0">
                      <template v-slot:prepend>
                        <v-avatar color="grey-lighten-3" rounded="lg">
                          <v-icon>mdi-package-variant</v-icon>
                        </v-avatar>
                      </template>
                      <v-list-item-title class="font-weight-medium">{{ item.productName }}</v-list-item-title>
                      <v-list-item-subtitle>₹{{ item.price }} × {{ item.quantity }} = <strong>₹{{ item.price * item.quantity }}</strong>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>

                  <v-divider class="my-3"></v-divider>
                  <div class="d-flex justify-space-between align-center">
                    <div class="text-caption">
                      <strong>Payment:</strong> {{ order.paymentMethod }} <br>
                      <strong>Address:</strong> {{ order.shippingAddress }}
                    </div>
                    <v-btn color="primary" variant="tonal" size="small" @click="reorder(order)">
                      Order Again
                    </v-btn>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>

          <template v-else>
            <div class="text-center py-10">
              <v-icon size="64" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
              <p class="mt-4 text-h6 text-grey">You haven't placed any orders yet.</p>
              <v-btn color="primary" class="mt-4" to="/home">Start Shopping</v-btn>
            </div>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from "vue";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/orders";
const token = localStorage.getItem("token");

// Update orders ref to be empty initially
const orders = ref<any[]>([]);
const loading = ref(false);

// Inject cart function for reordering
const addToCart = inject("addToCart") as any;

async function fetchOrders() {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/my-orders`, {
      headers: { "user-payload": token },
    });
    orders.value = response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchOrders);

//Reorder function
const reorder = (order: any) => {
  order.items.forEach((item: any) => {
    // We map backend OrderItem back to a Product object for the cart
    const productToCart = {
      id: item.productId,
      name: item.productName,
      price: item.price,
      // Note: Image might need to be fetched or stored if required for cart UI
    };
    for (let i = 0; i < item.quantity; i++) {
      addToCart(productToCart);
    }
  });
  alert(`Added items from Order #${order.id} to your cart!`);
};

//Status color mapping
const statusColor = (status: string) =>{
  switch(status){
    case "PENDING":
      return "orange";
    case "PROCESSING":
      return "blue";
    case "SHIPPED":
      return "indigo";
    case "DELIVERED":
      return "green";
    case "CANCELLED":
      return "red";
    default:
      return "violet";
  }
};

//Format date
const formatDate = (dateStr: string) =>{
  return new Date(dateStr).toLocaleDateString(undefined,{
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>
