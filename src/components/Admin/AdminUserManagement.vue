<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../../axios';
import { useNotify } from '../../composables/useNotify';

// notify composable
const { notify } = useNotify();
   
// --- State ---
const users = ref<any[]>([]);
const loading = ref(false);
const search = ref("");

// Pagination State
const page = ref(1);
const itemsPerPage = ref(10);
const totalUsers = ref(0);

// --- Dialog State ---
const roleDialog = ref(false);
const createUserDialog = ref(false);
const historyDialog = ref(false);
const userOrders = ref<any[]>([]);
const loadingOrders = ref(false);

const selectedUser = ref<any>(null);
const selectedRole = ref("");

const newUser = ref({
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    addressLine: '',
    city: '',
    pinCode: '',
    role: 'ROLE_CUSTOMER' // Default role
});

// --- Utility Functions ---
function getStatusColor(status: string) {
    switch (status) {
        case 'ACTIVE': return 'success';
        case 'INACTIVE': return 'warning';
        case 'SUSPENDED': return 'error';
        case 'DELETED': return 'grey';
        default: return 'info';
    }
}

// 1. Fetch Users
async function fetchUsers() {
  loading.value = true;
  try {
    const response: any = await api.get('/admin/getusers', {
      params: {
        page: page.value - 1,
        size: itemsPerPage.value,
        search: search.value,
        sort: 'fullName,asc' 
      }
    });
    users.value = response.content;
    totalUsers.value = response.totalElements;
  } catch (error){
    return { success: false, message: "Failed to fetch users" };
  } finally {
    loading.value = false;
  }
}
let debounceTimer: any = null;
watch(search, (val) => {
  clearTimeout(debounceTimer);
  page.value = 1;
  if (!val){
    fetchUsers();
    return;
  }
  debounceTimer = setTimeout(() => {
    fetchUsers();
  }, 600);
});

// 2. Toggle Status (Block / Activate)
async function toggleStatus(user: any) {
    if (user.accountStatus === 'DELETED') return;
    
    const isActivating = user.accountStatus !== 'ACTIVE';
    const newStatus = isActivating ? 'ACTIVE' : 'INACTIVE';
    const actionVerb = isActivating ? 'Activate' : 'Deactivate';
    const confirm = await notify.confirm(
      "Account Status Change",
      `Are you sure you want to ${actionVerb} this user?`
    );

    if(!confirm) return;
    try {
        await api.patch(`/admin/users/${user.id}`, 
            { accountStatus: newStatus } 
        );
        user.accountStatus = newStatus;
    } catch (error) {
        console.error(error);
    }
}

// 3. Role Management
function openRoleDialog(user: any) {
    selectedUser.value = user;
    const currentRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'ROLE_CUSTOMER';
    // Handling both object role and string role
    selectedRole.value = currentRole.name ? currentRole.name : currentRole;
    roleDialog.value = true;
}

async function updateRole() {
    if(!selectedUser.value) return;
    try {
        await api.patch(`/admin/users/${selectedUser.value.id}`,
            { roles: [selectedRole.value] }
        );
        roleDialog.value = false;
        fetchUsers();
    } catch (error) {
        console.error(error);
    }
}

// 4. Create User (All DTO Fields Included)
async function handleCreateUser() {
    if (!newUser.value.email || !newUser.value.fullName || !newUser.value.password) {
      return notify.warning("Name, Email and Password are required!");
    }
    try {
      const payload = { 
        fullName: newUser.value.fullName,
        email: newUser.value.email,
        password: newUser.value.password,
        mobile: newUser.value.mobile,
        addressLine: newUser.value.addressLine,
        city: newUser.value.city,
        pinCode: newUser.value.pinCode,
        roles: [newUser.value.role] 
      };
      await api.post('/admin/create-user', payload); 
      createUserDialog.value = false;
      newUser.value = { fullName: '', email: '', password: '', mobile: '', addressLine: '', city: '', pinCode: '', role: 'ROLE_CUSTOMER' };
      fetchUsers(); 
    } catch (error: any) {
      console.error(error);
    }
}

async function viewPurchaseHistory(user: any) {
    selectedUser.value = user;
    historyDialog.value = true;
    loadingOrders.value = true;
    userOrders.value = [];
    try {
        const response: any = await api.get(`/admin/orders/user/${user.id}`);
        userOrders.value = response;
    } catch (error) {
        alert("Failed to fetch order history");
    } finally {
        loadingOrders.value = false;
    }
}
// Format Date for History
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString();
}

onMounted(fetchUsers);

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Full Name', key: 'fullName' }, 
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'roles', sortable: false },
  { title: 'Status', key: 'accountStatus' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const }
];
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4 align-center">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h2 class="text-h5 font-weight-bold text-high-emphasis mb-4">User Management</h2>
        <v-btn color="success" prepend-icon="mdi-plus" @click="createUserDialog = true">Add New User</v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search users..."
          variant="outlined"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <v-card elevation="1">
      <v-data-table-server
        v-model:page="page" v-model:items-per-page="itemsPerPage" :headers="headers" 
        :items="users" :items-length="totalUsers" :items-per-page-options="[10, 25, 50, 100]"
        :loading="loading" @update:options="fetchUsers" hover>
        <template #item.roles="{ item }">
          <v-chip color="blue-lighten-1" text-color="blue-darken-4" size="x-small" class="mr-1 font-weight-bold" v-for="role in item.roles" :key="role">
            {{ role.name || role }}
          </v-chip>
        </template>

        <template #item.accountStatus="{ item }">
          <v-chip :color="getStatusColor(item.accountStatus)" size="small" variant="flat">
            {{ item.accountStatus }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end">
            <v-tooltip text="Change Role" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon="mdi-account-cog" variant="text" size="small" color="primary" @click="openRoleDialog(item)"></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Purchase History" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon="mdi-history" variant="text" size="small" color="secondary" @click="viewPurchaseHistory(item)"></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="item.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'" location="top">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props" 
                  :icon="item.accountStatus === 'ACTIVE' ? 'mdi-block-helper' : 'mdi-check-circle'" 
                  variant="text" 
                  size="small" 
                  :color="item.accountStatus === 'ACTIVE' ? 'warning' : 'success'" 
                  @click="toggleStatus(item)"
                  :disabled="item.accountStatus === 'DELETED'"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="createUserDialog" max-width="700px" persistent>
      <v-card rounded="lg">
        <v-card-title class="bg-success text-white">Create New User</v-card-title>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12" md="6"><v-text-field v-model="newUser.fullName" label="Full Name*" variant="outlined" density="compact"/></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="newUser.email" label="Email Address*" variant="outlined" density="compact"/></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="newUser.password" label="Password*" type="password" variant="outlined" density="compact"/></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="newUser.mobile" label="Mobile" variant="outlined" density="compact"/></v-col>
            
            <v-divider class="my-2 w-100"></v-divider>
            <v-col cols="12" class="text-subtitle-2">Address Details</v-col>
            
            <v-col cols="12"><v-text-field v-model="newUser.addressLine" label="Address Line" variant="outlined" density="compact"/></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="newUser.city" label="City" variant="outlined" density="compact"/></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="newUser.pinCode" label="Pin Code" variant="outlined" density="compact"/></v-col>
            
            <v-col cols="12">
              <v-select v-model="newUser.role" :items="['ROLE_ADMIN', 'ROLE_CUSTOMER']" label="Role*" variant="outlined" density="compact"/>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="createUserDialog = false">Cancel</v-btn>
          <v-btn color="success" variant="elevated" @click="handleCreateUser">Create User</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="roleDialog" max-width="400">
        <v-card rounded="lg">
            <v-card-title class="bg-primary text-white">Update Role</v-card-title>
            <v-card-text class="pt-4">
                <v-select
                    v-model="selectedRole"
                    :items="['ROLE_ADMIN', 'ROLE_CUSTOMER']"
                    label="Select New Role"
                    variant="outlined"
                    density="compact"
                ></v-select>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="roleDialog = false">Cancel</v-btn>
                <v-btn color="primary" variant="elevated" @click="updateRole">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="historyDialog" max-width="800px">
        <v-card rounded="lg">
            <v-card-title class="bg-secondary text-white d-flex justify-space-between align-center">
                <span>Order History: {{ selectedUser?.fullName }}</span>
                <v-btn icon="mdi-close" variant="text" @click="historyDialog = false"></v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
                <div v-if="loadingOrders" class="text-center pa-10">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </div>
                <v-list v-else-if="userOrders.length > 0" lines="three">
                    <v-list-item v-for="order in userOrders" :key="order.id" :subtitle="'Total: ₹' + order.totalAmount">
                        <template v-slot:prepend>
                            <v-icon color="primary">mdi-package-variant-closed</v-icon>
                        </template>
                        <v-list-item-title class="font-weight-bold">Order #{{ order.id }} - {{ formatDate(order.orderDate) }}</v-list-item-title>
                        <v-list-item-subtitle>
                            Status: <v-chip size="x-small" :color="getStatusColor(order.status)" class="ml-1">{{ order.status }}</v-chip> | 
                            Method: {{ order.paymentMethod }}
                        </v-list-item-subtitle>
                        <div class="text-caption text-grey mt-1">
                            Items: <span v-for="item in order.items" :key="item.id">{{ item.productName }} (x{{ item.quantity }}), </span>
                        </div>
                        <v-divider class="mt-2"></v-divider>
                    </v-list-item>
                </v-list>
                <div v-else class="text-center pa-10 text-grey">
                    <v-icon size="48">mdi-cart-off</v-icon>
                    <p>No orders found for this user.</p>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="secondary" variant="text" @click="historyDialog = false">Close</v-btn>
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