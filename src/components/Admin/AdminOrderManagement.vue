<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../../axios';

// --- Reactive State ---
const orders = ref<Order[]>([]);
const loading = ref(false);
const dialog = ref(false);
const selectedOrder = ref<Order | null>(null);
const updatedStatus = ref('');
const selected = ref<number[]>([]); 
const search = ref('');

// Pagination State
const page = ref(1);
const itemsPerPage = ref(10);
const totalOrders = ref(0);
// --- Status Options ---
const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'OUTFORDELIVERY', 'DELIVERED', 'CANCELLED'];

// --- Orders Interface ---
interface Order {
  id: number;
  userId: number;
  orderId: string | null;
  user: { fullName: string };
  shippingAddress: string;
  paymentMethod: string;
  items: { productName: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  orderDate: string;
}

// 1. Fetch all orders
async function fetchOrders() {
  loading.value = true;
  try {
    const response: any = await api.get(`/admin/orders/all`, {
      params: {
        page: page.value - 1,
        size: itemsPerPage.value,
        search: search.value
      }
    });
    orders.value = response.content;
    totalOrders.value = response.totalElements;
  } catch (error) {
    console.error('Error fetching orders:', error);
  } finally {
    loading.value = false;
  }
}
let debounceTimer: any = null;
watch(search, (val) => {
  clearTimeout(debounceTimer);
  page.value = 1;
  if (!val){
    fetchOrders();
    return;
  }
  debounceTimer = setTimeout(() => { fetchOrders();
  }, 500);
});

// 2. Single Update
async function updateOrderStatus() {
  if (!selectedOrder.value || !updatedStatus.value) return;
  try {
    const url = `/admin/orders/${selectedOrder.value.id}/status?status=${updatedStatus.value}`;
    await api.patch(url);
    dialog.value = false;
    fetchOrders();
  }catch (error) {}
}

// 3. Bulk Update
async function bulkUpdate(newStatus: string) {
  if (selected.value.length === 0) return;
  try {
    const payload = { ids: selected.value, status: newStatus };
    await api.patch(`/admin/orders/bulk-status`, payload);
    selected.value = []; 
    fetchOrders();
  } catch (error) {}
}

onMounted(fetchOrders);

// --- Helpers ---
function openOrderDialog(order: Order) {
  selectedOrder.value = { ...order };
  updatedStatus.value = order.status;
  dialog.value = true;
}

function statusColor(status: string) {
  switch(status){
    case "PENDING": return "orange";
    case "PROCESSING": return "blue";
    case "SHIPPED": return "indigo";
    case "DELIVERED": return "green";
    case "CANCELLED": return "red";
    default: return "grey";
  }
}

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Customer', key: 'user.fullName' },
  { title: 'Payment', key: 'paymentMethod' },
  { title: 'Total Amount', key: 'totalAmount' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4 align-center">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h2 class="text-h5 font-weight-bold text-high-emphasis mb-4">Order Management</h2>
        <v-chip color="primary" variant="tonal" label>Total Orders: {{ orders.length }}</v-chip>
      </v-col>
    </v-row>

    <v-row class="mb-4 align-center">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search orders..."
          variant="outlined"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="8" v-if="selected.length > 0">
        <v-card color="blue-lighten-5" class="pa-1 d-flex align-center border rounded-lg">
          <span class="mx-4 text-subtitle-2 text-blue-darken-3 font-weight-bold">{{ selected.length }} selected</span>
          <v-spacer></v-spacer>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn color="primary" v-bind="props" size="small" append-icon="mdi-chevron-down">Bulk Action</v-btn>
            </template>
            <v-list density="compact">
              <v-list-item v-for="status in statusOptions" :key="status" @click="bulkUpdate(status)">
                <v-list-item-title>{{ status }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="1">
      <v-data-table-server v-model="selected" v-model:page="page" v-model:items-per-page="itemsPerPage"
        :items-length="totalOrders" :headers="headers" :items-per-page-options="[10, 25, 50, 100]"
        :items="orders" :loading="loading"
        @update:options="fetchOrders" show-select hover
      >
        <template #item.totalAmount="{ item }">
          ₹{{ item.totalAmount?.toFixed(2) }}
        </template>

        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" size="small" variant="flat">{{ item.status }}</v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end">
            <v-tooltip text="Update Status" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon="mdi-pencil" variant="text" size="small" color="primary" @click="openOrderDialog(item)"></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Export Invoice (PDF)" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon="mdi-file-pdf-box" variant="text" size="small" color="green"></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card rounded="lg">
        <v-card-title class="bg-primary text-white">Update Order #{{ selectedOrder?.id }}</v-card-title>
        <v-card-text class="pt-4">
          <p class="mb-4"><strong>Customer:</strong> {{ selectedOrder?.user?.fullName }}</p>
          <v-select
            v-model="updatedStatus"
            :items="statusOptions"
            label="Set Status"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="success" variant="elevated" @click="updateOrderStatus">Save Changes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.v-data-table {
  margin-top: 10px;
}
</style>