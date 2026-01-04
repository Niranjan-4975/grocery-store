<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../axios';

// --- State ---
const stats = ref<any>({
  lowStockProducts: [],
  bestSellers: []
});
const loading = ref(false);

// --- Range Selector State (Added for Logic Consistency) ---
const rangeOptions = [
  { title: 'Last 7 Days', value: '7' },
  { title: 'Last 15 Days', value: '15' },
  { title: 'Last Month', value: '30' },
  { title: 'Custom Range', value: 'custom' }
];
const selectedRange = ref('7');
const showCustomPicker = ref(false);
const customDates = ref({ start: '', end: '' });

// Fetch Reports Data
async function loadReportData(days = '7', start = '', end = '') {
  loading.value = true;
  try {
    const res = await api.get(`/admin/dashboard/stats`, {
      params: { range: days, startDate: start, endDate: end }
    });
    stats.value = res;
  } catch (error) {
    console.error("Failed to load report data", error);
  } finally {
    loading.value = false;
  }
}

// Handle range change
function onRangeChange() {
  if (selectedRange.value === 'custom') {
    showCustomPicker.value = true;
  } else {
    loadReportData(selectedRange.value);
  }
}

function applyCustomRange() {
  if (customDates.value.start && customDates.value.end) {
    showCustomPicker.value = false;
    loadReportData('custom', customDates.value.start, customDates.value.end);
  }
}

onMounted(() => {
  loadReportData();
});

// PDF Export Logic
async function downloadPDF() {
  try {
    const response = await api.get(`/admin/dashboard/reports/export-full`, {
      params: {
        range: selectedRange.value,
        startDate: customDates.value.start,
        endDate: customDates.value.end
      },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Dynamic filename based on range
    const filename = selectedRange.value === 'custom' 
      ? `Report_${customDates.value.start}_to_${customDates.value.end}.pdf`
      : `Business_Report_Last_${selectedRange.value}_Days.pdf`;
      
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert("Error generating full report PDF. Ensure the backend ReportService is running.");
  }
}
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4 align-center">
      <v-col cols="12" md="6">
        <h2 class="text-h5 font-weight-bold text-high-emphasis mb-4">Business Reports</h2>
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-md-end align-center gap-2">
        <div style="width: 200px;" class="mr-2">
          <v-select
            v-model="selectedRange"
            :items="rangeOptions"
            label="Report Period"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="onRangeChange"
          ></v-select>
        </div>
        <v-btn 
          color="success" 
          prepend-icon="mdi-download" 
          variant="elevated" 
          @click="downloadPDF"
          :loading="loading"
        >
          Export PDF
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card elevation="1" rounded="lg">
          <v-card-title class="bg-grey-lighten-4 py-3 font-weight-bold">
            <v-icon start color="error">mdi-alert-circle</v-icon>
            Low Stock Inventory Report
          </v-card-title>
          <v-data-table
            :items="stats.lowStockProducts"
            :loading="loading"
            :headers="[
              { title: 'Product Name', key: 'name' },
              { title: 'Category', key: 'category' },
              { title: 'Current Stock', key: 'stock' },
              { title: 'Action Status', key: 'status', sortable: false }
            ]"
            hover
          >
            <template #item.stock="{ item }">
              <v-chip :color="item.stock < 5 ? 'red' : 'orange'" variant="flat" size="small">
                {{ item.stock }} units left
              </v-chip>
            </template>
            <template #item.status>
              <v-chip color="error" variant="tonal" size="x-small" class="font-weight-bold">
                REPLENISH REQUIRED
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col cols="12">
        <v-card elevation="1" rounded="lg">
          <v-card-title class="bg-grey-lighten-4 py-3 font-weight-bold">
            <v-icon start color="success">mdi-trending-up</v-icon>
            Performance: Best Selling Products
          </v-card-title>
          <v-data-table
            :items="stats.bestSellers"
            :loading="loading"
            :headers="[
              { title: 'Product Name', key: 'product' },
              { title: 'Total Quantity Sold', key: 'soldQuantity' },
              { title: 'Sales Performance', key: 'performance', sortable: false },
            ]"
            hover
          >
            <template #item.performance="{ item }">
              <div class="d-flex align-center">
                <v-progress-linear 
                  :model-value="item.soldQuantity" 
                  max="100" 
                  height="10" 
                  color="success" 
                  rounded 
                  class="mr-2"
                ></v-progress-linear>
                <span class="text-caption font-weight-bold">{{ item.soldQuantity }}</span>
              </div>
            </template>
          </v-data-table>
        </v-card>          
      </v-col>
    </v-row>

    <v-dialog v-model="showCustomPicker" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="bg-primary text-white">Select Custom Dates</v-card-title>
        <v-card-text class="pt-4">
          <v-text-field v-model="customDates.start" type="date" label="Start Date" variant="outlined" density="compact" class="mb-4"></v-text-field>
          <v-text-field v-model="customDates.end" type="date" label="End Date" variant="outlined" density="compact"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCustomPicker = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="applyCustomRange">Fetch Report</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.v-card {
  padding: 0; /* Changed from 16px to 0 for better data-table integration */
}
.gap-2 {
  gap: 8px;
}
</style>