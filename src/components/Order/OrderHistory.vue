<template>
  <v-container class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="3" rounded="xl" class="pa-4">
          <v-card-title class="text-h6">Order History</v-card-title>
          <v-divider class="mb-4"></v-divider>
          <template v-if="orders.length">
            <v-expansion-panels>
              <v-expansion-panel v-for="order in orders" :key="order.id">
                <v-expansion-panel-title class="d-flex justify-space-between align-center">
                    <span>Order #{{ order.id }} — ₹{{ order.total }} — {{ order.date }}</span>
                    <v-chip :color="statusColor(order.status)" small dark class="ml-2">{{ order.status }}</v-chip>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list dense>
                    <v-list-item v-for="item in order.items" :key="item.id">
                      <v-list-item-avatar>
                        <v-img :src="item.image" />
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle>
                          ₹{{ item.price }} × {{ item.quantity }} = ₹{{ item.price * item.quantity }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                  <!---Reorder Button-->
                  <div class="text-right mt-3">
                    <v-btn color="primary" small @click="reorder(order)">Order Again</v-btn>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>

          <template v-else>
            <div class="text-center py-6">
              <v-icon size="48" color="grey">mdi-cart-off</v-icon>
              <p class="mt-2 text-subtitle-1 text-grey">You have no past orders.</p>
            </div>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Mock orders (replace with API/store later)
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: number;
  date: string;
  total: number;
  status: "Pending" | "Delivered" | "Cancelled";
  items: OrderItem[];
}

const orders = ref<Order[]>([
  {
    id: 101,
    date: "2025-09-27",
    total: 200,
    status: "Delivered",
    items: [
      { id: 1, name: "Apple", price: 50, quantity: 2, image: "/apple.png" },
      { id: 2, name: "Banana", price: 30, quantity: 2, image: "/banana.png" }
    ]
  },
  {
    id: 102,
    date: "2025-09-25",
    total: 95,
    status: "Pending",
    items: [
      { id: 3, name: "Milk", price: 45, quantity: 1, image: "/milk.png" },
      { id: 2, name: "Banana", price: 30, quantity: 1, image: "/banana.png" }
    ]
  }
]);

//Reorder function
const reorder = (order: Order) =>{
    console.log("Reording order:", order.id);
    //Todo add items to cart
    alert("Added ${order.items.length} items from Order #${order.id} to your cart");
}

//Status color mapping
const statusColor = (status: string) =>{
    switch(status){
        case "Pending":
            return "orange";
        case "Delivered":
            return "green";
        case "Cancelled":
            return "red";
        default:
            return "grey";
    }
};
</script>
