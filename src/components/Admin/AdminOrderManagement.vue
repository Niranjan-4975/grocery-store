<script setup lang="ts">
import { ref } from 'vue';

// --- Mock Data ---
interface Order {
  id: number;
  orderId: string;
  user: string;
  products: { name: string; qty: number }[];
  totalAmount: number;
  status: string;
  date: string;
}

const orders = ref<Order[]>([
  {
    id: 1,
    orderId: 'ORD001',
    user: 'John Doe',
    products: [
      { name: 'Tomatoes', qty: 2 },
      { name: 'Milk', qty: 1 },
    ],
    totalAmount: 160,
    status: 'Pending',
    date: '2025-09-25',
  },
  {
    id: 2,
    orderId: 'ORD002',
    user: 'Jane Smith',
    products: [
      { name: 'Bread', qty: 2 },
      { name: 'Butter', qty: 1 },
    ],
    totalAmount: 120,
    status: 'Shipped',
    date: '2025-09-24',
  },
]);

// --- Dialog State ---
const dialog = ref(false);
const selectedOrder = ref<Order | null>(null);
const updatedStatus = ref('');

// --- Status Options ---
const statusOptions = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

// --- Functions ---
function openOrderDialog(order: Order) {
  selectedOrder.value = { ...order };
  updatedStatus.value = order.status;
  dialog.value = true;
}

function updateOrderStatus() {
  if (selectedOrder.value && updatedStatus.value) {
    const index = orders.value.findIndex(o => o.id === selectedOrder.value!.id);
    if (index !== -1 && orders.value[index]){
      orders.value[index].status = updatedStatus.value;
    }
  }
  dialog.value = false;
}

function generateInvoice(order: Order) {
  alert(`Invoice for ${order.orderId} generated! (Mock)`);
}
</script>

<template>
  <v-container fluid>
    <!-- Orders Table -->
    <v-row>
      <v-col cols="12">
        <v-data-table
          :items="orders"
          :headers="[
            { text: 'Order ID', value: 'orderId' },
            { text: 'User', value: 'user' },
            { text: 'Products', value: 'products', sortable: false },
            { text: 'Total Amount', value: 'totalAmount' },
            { text: 'Status', value: 'status' },
            { text: 'Date', value: 'date' },
            { text: 'Actions', value: 'actions', sortable: false }
          ]"
        >
          <template #item.products="{ item }">
            <v-list dense>
              <v-list-item v-for="p in item.products" :key="p.name">
                <v-list-item-content>
                  {{ p.name }} ({{ p.qty }})
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </template>

          <template #item.status="{ item }">
            <v-chip :color="item.status === 'Pending' ? 'orange' : item.status === 'Shipped' ? 'blue' : item.status === 'Delivered' ? 'green' : 'red'" small>
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn icon @click="openOrderDialog(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="green" @click="generateInvoice(item)">
              <v-icon>mdi-file-pdf-box</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Order Details / Status Update Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card v-if="selectedOrder">
        <v-card-title>Order Details: {{ selectedOrder.orderId }}</v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item v-for="p in selectedOrder.products" :key="p.name">
              <v-list-item-content>{{ p.name }} ({{ p.qty }})</v-list-item-content>
            </v-list-item>
          </v-list>
          <v-text-field v-model="selectedOrder.user" label="User" disabled />
          <v-text-field v-model="selectedOrder.totalAmount" label="Total Amount" disabled />
          <v-select v-model="updatedStatus" :items="statusOptions" label="Update Status" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="success" @click="updateOrderStatus">Save</v-btn>
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
