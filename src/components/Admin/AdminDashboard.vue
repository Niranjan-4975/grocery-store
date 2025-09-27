<script setup lang="ts">
import { ref } from "vue";

const stats = ref([
  { title: "Total Orders", value: 152, icon: "mdi-cart", color: "blue" },
  { title: "Total Revenue", value: "₹45,200", icon: "mdi-currency-inr", color: "green" },
  { title: "Customers", value: 87, icon: "mdi-account-group", color: "purple" },
  { title: "Products", value: 34, icon: "mdi-package-variant", color: "orange" },
]);

const recentOrders = ref([
  { id: 1, customer: "Niranjan", total: "₹1,200", status: "Pending" },
  { id: 2, customer: "Ravi", total: "₹900", status: "Delivered" },
  { id: 3, customer: "Aarti", total: "₹2,150", status: "Cancelled" },
  { id: 4, customer: "Manoj", total: "₹750", status: "Delivered" },
]);
</script>

<template>
  <div class="admin-dashboard pa-4">
    <!-- Header -->
    <h1 class="mb-6">📊 Admin Dashboard</h1>

    <!-- Stats Cards -->
    <v-row dense>
      <v-col v-for="(item, i) in stats" :key="i" cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4 text-center">
          <v-icon :color="item.color" size="36">{{ item.icon }}</v-icon>
          <h2 class="mt-2">{{ item.value }}</h2>
          <p class="text-subtitle-2">{{ item.title }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Orders -->
    <h2 class="mt-10 mb-4">🛒 Recent Orders</h2>
    <v-table class="recent-orders">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in recentOrders" :key="order.id">
          <td>#{{ order.id }}</td>
          <td>{{ order.customer }}</td>
          <td>{{ order.total }}</td>
          <td>
            <v-chip
              :color="order.status === 'Delivered' ? 'green' : order.status === 'Cancelled' ? 'red' : 'orange'"
              dark
              small
            >
              {{ order.status }}
            </v-chip>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<style scoped>
.admin-dashboard h1 {
  font-weight: 600;
}
.recent-orders {
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
