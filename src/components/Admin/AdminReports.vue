<script setup lang="ts">
import { ref } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, BarElement, PointElement } from 'chart.js';
import { Line, Bar } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, LineElement, BarElement, CategoryScale, LinearScale, PointElement);

// --- Mock Data ---
const totalSales = ref(1250);
const totalOrders = ref(320);
const totalRevenue = ref(75200);

// Line Chart
const lineChartData = ref({
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  datasets: [
    {
      label: "Sales",
      data: [120, 150, 180, 200, 170],
      borderColor: "#3f51b5",
      backgroundColor: "rgba(63, 81, 181, 0.2)",
      tension: 0.4
    }
  ]
});
const lineChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
});

// Bar Chart
const barChartData = ref({
  labels: ["Fruits", "Vegetables", "Dairy", "Bakery"],
  datasets: [
    {
      label: "Stock",
      data: [50, 80, 30, 60],
      backgroundColor: ["#3f51b5", "#e91e63", "#ff9800", "#4caf50"]
    }
  ]
});
const barChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
});

const lowStockProducts = ref([
  { name: 'Bread', stock: 5 },
  { name: 'Milk', stock: 10 },
  { name: 'Butter', stock: 2 },
]);

</script>

<template>
  <v-container fluid>
    <!-- Cards -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card color="primary" dark>
          <v-card-title>Total Sales</v-card-title>
          <v-card-text class="text-h4">{{ totalSales }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card color="success" dark>
          <v-card-title>Total Orders</v-card-title>
          <v-card-text class="text-h4">{{ totalOrders }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card color="orange darken-1" dark>
          <v-card-title>Total Revenue</v-card-title>
          <v-card-text class="text-h4">₹ {{ totalRevenue }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row class="mt-5">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Sales Over Time</v-card-title>
          <v-card-text>
            <Line :data="lineChartData" :options="lineChartOptions" style="height:300px" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Best-selling Products</v-card-title>
          <v-card-text>
            <Bar :data="barChartData" :options="barChartOptions" style="height:300px" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Low Stock Products -->
    <v-row class="mt-5">
      <v-col cols="12">
        <v-card>
          <v-card-title>Low Stock Products</v-card-title>
          <v-card-text>
            <v-data-table :items="lowStockProducts" :headers="[
              { text: 'Product Name', value: 'name' },
              { text: 'Stock', value: 'stock' }
            ]" dense></v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-card {
  padding: 16px;
}
</style>
