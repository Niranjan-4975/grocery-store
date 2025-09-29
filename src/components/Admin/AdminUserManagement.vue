<script setup lang="ts">
import { ref } from 'vue';

// --- Mock Data ---
interface Purchase {
  orderId: string;
  date: string;
  totalAmount: number;
  products: { name: string; qty: number }[];
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: boolean;
  purchases: Purchase[];
}

const users = ref<User[]>([
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'User',
    status: true,
    purchases: [
      { orderId: 'ORD001', date: '2025-09-25', totalAmount: 160, products: [{ name: 'Tomatoes', qty: 2 }] },
    ],
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: false,
    purchases: [
      { orderId: 'ORD002', date: '2025-09-24', totalAmount: 120, products: [{ name: 'Bread', qty: 2 }] },
    ],
  },
]);

// --- Dialog State ---
const dialog = ref(false);
const selectedUser = ref<User | null>(null);

// --- Functions ---
function toggleStatus(user: User) {
  const index = users.value.findIndex(u => u.id === user.id);
  if (index !== -1 && users.value[index]){
     users.value[index].status = !users.value[index].status;
  }
}

function viewPurchaseHistory(user: User) {
  selectedUser.value = user;
  dialog.value = true;
}
</script>

<template>
  <v-container fluid>
    <!-- Users Table -->
    <v-row>
      <v-col cols="12">
        <v-data-table
          :items="users"
          :headers="[
            { text: 'Name', value: 'name' },
            { text: 'Email', value: 'email' },
            { text: 'Role', value: 'role' },
            { text: 'Status', value: 'status' },
            { text: 'Actions', value: 'actions', sortable: false }
          ]"
        >
          <template #item.status="{ item }">
            <v-chip :color="item.status ? 'green' : 'red'" small>
              {{ item.status ? 'Active' : 'Blocked' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn small color="primary" @click="toggleStatus(item)">
              {{ item.status ? 'Block' : 'Unblock' }}
            </v-btn>
            <v-btn small color="secondary" @click="viewPurchaseHistory(item)">
              History
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Purchase History Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card v-if="selectedUser">
        <v-card-title>{{ selectedUser.name }} - Purchase History</v-card-title>
        <v-card-text>
          <v-data-table
            :items="selectedUser.purchases"
            :headers="[
              { text: 'Order ID', value: 'orderId' },
              { text: 'Date', value: 'date' },
              { text: 'Total Amount', value: 'totalAmount' },
              { text: 'Products', value: 'products', sortable: false }
            ]"
          >
            <template #item.products="{ item }">
              <v-list dense>
                <v-list-item v-for="p in item.products" :key="p.name">
                  <v-list-item-content>{{ p.name }} ({{ p.qty }})</v-list-item-content>
                </v-list-item>
              </v-list>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Close</v-btn>
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
