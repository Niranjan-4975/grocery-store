<script setup lang="ts">
import { ref } from 'vue';

// --- Sample Data ---
const totalSales = ref(12500);
const pendingOrders = ref(8);

const lowStockProducts = ref([
  { name: 'Tomatoes', category: 'Vegetables', stock: 2 },
  { name: 'Milk', category: 'Dairy', stock: 5 },
  { name: 'Bread', category: 'Bakery', stock: 1 },
]);

const salesTrend = ref([
  { date: '2025-09-22', amount: 1500 },
  { date: '2025-09-23', amount: 1200 },
  { date: '2025-09-24', amount: 1800 },
  { date: '2025-09-25', amount: 2000 },
  { date: '2025-09-26', amount: 2500 },
]);

const bestSellers = ref([
  { product: 'Tomatoes', soldQuantity: 50 },
  { product: 'Milk', soldQuantity: 40 },
  { product: 'Bread', soldQuantity: 35 },
]);

// --- Chart Options (ApexCharts) ---
const salesChartOptions = ref({
  chart: { type: 'line', height: 300 },
  xaxis: { categories: salesTrend.value.map(item => item.date) },
  series: [{ name: 'Sales', data: salesTrend.value.map(item => item.amount) }],
  title: { text: 'Sales Trend', align: 'left' },
});

const bestSellerChartOptions = ref({
  chart: { type: 'bar', height: 300 },
  xaxis: { categories: bestSellers.value.map(item => item.product) },
  series: [{ name: 'Sold Quantity', data: bestSellers.value.map(item => item.soldQuantity) }],
  title: { text: 'Best-Selling Products', align: 'left' },
});
</script>

<template>
  <v-container fluid>
    <!-- Cards Row -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card outlined>
          <v-card-title>Total Sales</v-card-title>
          <v-card-text>
            <h2>{{ totalSales }}</h2>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card outlined>
          <v-card-title>Pending Orders</v-card-title>
          <v-card-text>
            <h2>{{ pendingOrders }}</h2>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card outlined>
          <v-card-title>Low Stock Alerts</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="item in lowStockProducts" :key="item.name">
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }} ({{ item.stock }} left)</v-list-item-title>
                  <v-list-item-subtitle>{{ item.category }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Row -->
    <v-row>
      <v-col cols="12" sm="6">
        <apexchart type="line" height="300" :options="salesChartOptions" :series="salesChartOptions.series" />
      </v-col>
      <v-col cols="12" sm="6">
        <apexchart type="bar" height="300" :options="bestSellerChartOptions" :series="bestSellerChartOptions.series" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
h2 {
  margin: 0;
  font-weight: bold;
  font-size: 2rem;
}
</style>
