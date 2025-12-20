<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// --- State ---
const users = ref<any[]>([]);
const loading = ref(false);
const search = ref("");

// --- Dialog State ---
const historyDialog = ref(false);
const roleDialog = ref(false);
const createUserDialog = ref(false);

const selectedUser = ref<any>(null);
const selectedRole = ref("");

// ✅ NEW USER STATE: Matching your AdminCreateRequest.java DTO
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
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('http://localhost:8080/api/admin/getusers', {
            headers: { "user-payload": token },
            params: { size: 100, sort: 'fullName,asc' } 
        });
        users.value = response.data.content;
    } catch (error){
        console.error("Error fetching users", error);
    } finally {
        loading.value = false;
    }
}

// 2. Toggle Status (Block / Activate)
async function toggleStatus(user: any) {
    if (user.accountStatus === 'DELETED') return;
    
    const token = localStorage.getItem('token'); 
    const isActivating = user.accountStatus !== 'ACTIVE';
    const newStatus = isActivating ? 'ACTIVE' : 'INACTIVE';
    const actionVerb = isActivating ? 'Activate' : 'Deactivate';

    if(!confirm(`Are you sure you want to ${actionVerb} this user?`)) return;

    try {
        await axios.patch(`http://localhost:8080/api/admin/users/${user.id}`, 
            { accountStatus: newStatus },
            { headers: { "user-payload": token } }
        );
        user.accountStatus = newStatus;
        alert(`User updated to ${newStatus}`);
    } catch (error) {
        alert("Failed to update status");
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
    const token = localStorage.getItem('token');
    try {
        await axios.patch(`http://localhost:8080/api/admin/users/${selectedUser.value.id}`,
            { roles: [selectedRole.value] }, 
            { headers: { "user-payload": token } }
        );
        alert("Role Updated Successfully");
        roleDialog.value = false;
        fetchUsers();
    } catch (error) {
        alert("Failed to update role");
    }
}

// 4. Create User (All DTO Fields Included)
async function handleCreateUser() {
    if (!newUser.value.email || !newUser.value.fullName || !newUser.value.password) {
        alert("Name, Email and Password are required!");
        return;
    }

    const token = localStorage.getItem('token');   
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

        await axios.post('http://localhost:8080/api/admin/create-user', payload, {
            headers: { "user-payload": token }
        }); 

        alert("User created successfully!");
        createUserDialog.value = false;
        
        // Reset form
        newUser.value = { fullName: '', email: '', password: '', mobile: '', addressLine: '', city: '', pinCode: '', role: 'ROLE_CUSTOMER' };
        fetchUsers(); 
    } catch (error: any) {
        alert("Creation Failed: " + (error.response?.data?.message || "Check backend logs"));
    }
}

function viewPurchaseHistory(user: any) {
    selectedUser.value = user;
    historyDialog.value = true;
}

onMounted(fetchUsers);

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Full Name', key: 'fullName' }, 
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'roles' },
  { title: 'Status', key: 'accountStatus' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4 align-center">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h2 class="text-h5 font-weight-bold">User Management</h2>
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
      <v-data-table :headers="headers" :items="users" :search="search" :loading="loading" hover>
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
      </v-data-table>
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

    <v-dialog v-model="historyDialog" max-width="600">
        <v-card rounded="lg">
            <v-card-title>Order History: {{ selectedUser?.fullName }}</v-card-title>
            <v-card-text>
                 <v-alert type="info" variant="tonal">Real-time order tracking coming soon.</v-alert>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="historyDialog = false">Close</v-btn>
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