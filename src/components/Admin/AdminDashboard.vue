<script setup lang="ts">
import { ref, onMounted, computed, watch} from 'vue';
import { useTheme } from 'vuetify';
import api from '../../axios';
// ✅ Import component directly to ensure it's registered
import VueApexCharts from "vue3-apexcharts";

const theme = useTheme();

const apexchart = VueApexCharts;

// --- State ---
const stats = ref<any>({
  totalSales: 0,
  totalOrders: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  lowStockProducts: [],
  salesTrend: [],
  bestSellers: []
});
const loading = ref(true);

// --- New Reactive State ---
const rangeOptions = [
  { title: 'Last 7 Days', value: '7' },
  { title: 'Last 15 Days', value: '15' },
  { title: 'Last Month', value: '30' },
  { title: 'Custom Range', value: 'custom' }
];
const selectedRange = ref('7'); // Default selection
const showCustomPicker = ref(false);
const customDates = ref({ start: null, end: null });

// Watcher to refetch data when range changes
watch(selectedRange, (newVal) => {
  if (newVal === 'custom') {
    showCustomPicker.value = true;
  } else {
    fetchStats(newVal); // API call with selected days
  }
});

// --- Chart Series ---
const salesSeries = computed(() => [
  { name: 'Revenue', data: stats.value.salesTrend?.map((i: any) => i.amount) || [] }
]);

const bestSellerSeries = computed(() => [
  { name: 'Sold', data: stats.value.bestSellers?.map((item: any) => item.soldQuantity) || [] }
]);

// --- Chart Options ---
const salesOptions = computed(() => ({
  chart: { type: 'area', height: 350, 
    toolbar: { show: false }, 
    theme: { mode: theme.global.name.value === 'dark' ? 'dark' : 'light' } 
  },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: { 
    categories: stats.value.salesTrend?.map((i: any) => i.date) || [],
    labels: { rotate: -45, style: { colors: theme.global.name.value === 'dark' ? '#fff' : '#000' } }
  },
  tooltip: {
    theme: theme.global.name.value === 'dark' ? 'dark' : 'light',
    x: { show: true },
  },
  markers: { size: 4 },
  colors: ['#3f51b5'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } }

}));

const bestSellerOptions = computed(() => ({
  chart: { type: 'bar', height: 350, 
    toolbar: { show: false }, 
    theme: { mode: theme.global.name.value === 'dark' ? 'dark' : 'light' }
  },
  tooltip: {
    theme: theme.global.name.value === 'dark' ? 'dark' : 'light'
  },
  plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '55%' } },
  xaxis: { 
    categories: stats.value.bestSellers?.map((item: any) => item.product) || [],
    labels: { style: { colors: theme.global.name.value === 'dark' ? '#fff' : '#000' } }
  },
  colors: ['#4caf50'],
  dataLabels: { enabled: true }
}));

async function fetchStats(days = '7', startDate = null, endDate = null) {
  loading.value = true;
  try {
    const response = await api.get(`/admin/dashboard/stats`, {
      params: { 
        range: days,
        startDate: startDate,
        endDate: endDate
      }
    });
    stats.value = response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    loading.value = false;
  }
}

async function fetchCustomStats() {
  if (customDates.value.start && customDates.value.end) {
    showCustomPicker.value = false;
    fetchStats('custom', customDates.value.start, customDates.value.end);
  }
}

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <v-container fluid>
    <h2 class="text-h5 font-weight-bold text-high-emphasis mb-4">Admin Dashboard</h2>
    
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3" v-for="(value, label) in { 
        'REVENUE': '₹' + stats.totalRevenue.toLocaleString(), 
        'TOTAL ORDERS': stats.totalOrders, 
        'ORDERS PENDING': stats.pendingOrders, 
        'ITEMS SOLD': stats.totalSales 
      }" :key="label">
        <v-card elevation="2" class="rounded-lg pa-3 border-s-xl border-primary shadow-sm">
          <div class="text-caption font-weight-bold text-grey-darken-1 text-uppercase">{{ label }}</div>
          <div class="text-h4 font-weight-black text-blue-darken-3 mt-2">{{ value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card elevation="2" class="rounded-lg overflow-hidden">
          <v-card-title class="py-3 px-6 border-b d-flex align-center justify-space-between">
            <span class="text-subtitle-1 font-weight-bold">Sales Trend</span>
            <div style="width: 180px;">
              <v-select
                v-model="selectedRange"
                :items="rangeOptions"
                density="compact"
                variant="outlined"
                hide-details
                class="text-caption"
              ></v-select>
            </div>
          </v-card-title>
          <v-card-text class="pa-4">
            <div v-if="!loading && stats.salesTrend.length">
              <apexchart type="area" height="350" :options="salesOptions" :series="salesSeries" />
            </div>
          </v-card-text>
        </v-card>
        <v-dialog v-model="showCustomPicker" max-width="400">
          <v-card title="Select Custom Range">
            <v-card-text>
              <v-text-field v-model="customDates.start" label="Start Date" type="date" variant="outlined" density="compact" class="mb-2"/>
              <v-text-field v-model="customDates.end" label="End Date" type="date" variant="outlined" density="compact"/>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="text" @click="showCustomPicker = false">Cancel</v-btn>
              <v-btn color="primary" @click="fetchCustomStats">Apply</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg overflow-hidden">
          <v-card-title class="text-subtitle-1 font-weight-bold py-4 px-6 border-b">
            Best Sellers
          </v-card-title>
          <v-card-text class="pa-4">
            <div v-if="loading" class="d-flex justify-center align-center" style="height: 350px;">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <div v-else-if="stats.bestSellers && stats.bestSellers.length > 0">
              <apexchart type="bar" height="350" :options="bestSellerOptions" :series="bestSellerSeries" />
            </div>
            <div v-else class="d-flex justify-center align-center text-grey" style="height: 350px;">
              No sales data available.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-card {
  transition: transform 0.2s;
}
.v-card:hover {
  transform: translateY(-4px);
}
.border-b {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
</style>