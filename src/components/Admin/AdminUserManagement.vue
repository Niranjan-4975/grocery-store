<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// State
const users  = ref();
const loading = ref(false);
const search = ref("");

// --- Dialog State ---
const historyDialog = ref(false);
const roleDialog = ref(false);
const createUserDialog = ref(false); // ✅ NEW: State for Add User Dialog

const selectedUser = ref<any>(null);
const selectedRole = ref("");

// ✅ NEW STATE: For creating a new user
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

// 1. Fetch Users from backend (with sort fix)
async function fetchUsers() {
    loading.value = true;
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('http://localhost:8080/api/admin/getusers', {
            headers: { "user-payload": token },
            params: { 
                size: 100, 
                sort: 'fullName,asc' // ✅ FIX: Corrected sort attribute
            } 
        });
        users.value = response.data.content;
    } catch (error){
        console.error("Error fetching users", error);
    } finally {
        loading.value = false;
    }
}

// --- 2. BLOCK / ACTIVATE USER ---
async function toggleStatus(user: any) {
    if (user.accountStatus === 'DELETED') {
        alert("Cannot modify a DELETED account.");
        return;
    } 
    const token = localStorage.getItem('token'); 
    let newStatus;
    let actionVerb;
    if (user.accountStatus === 'ACTIVE') {
        newStatus = 'INACTIVE'; 
        actionVerb = 'Inactivate';
    } else if(user.accountStatus === 'INACTIVE'){
        newStatus = 'ACTIVE'; 
        actionVerb = 'Activate';
    } else {
        newStatus = 'SUSPENDED';
        actionVerb = 'Suspend';
    }

    if(!confirm(`Are you sure you want to ${actionVerb} this user?`)) return;

    try {
        await axios.patch(`http://localhost:8080/api/admin/users/${user.id}`, 
            { accountStatus: newStatus },
            { headers: { "user-payload": token } }
        );
        user.accountStatus = newStatus;
        alert(`User ${newStatus} successfully`);
    } catch (error) {
        alert("Failed to update status");
        console.error(error);
    }
}

// --- 3. CHANGE ROLE ---
function openRoleDialog(user: any) {
    selectedUser.value = user;
    const currentRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'ROLE_CUSTOMER';
    selectedRole.value = currentRole.replace('ROLE_', '');
    roleDialog.value = true;
}

async function updateRole() {
    if(!selectedUser.value) return;
    const token = localStorage.getItem('token');
    const apiRole = `${selectedRole.value}`; 
    try {
        await axios.patch(`http://localhost:8080/api/admin/users/${selectedUser.value.id}`,
            { roles: [apiRole] }, 
            { headers: { "user-payload": token } }
        );
        alert("Role Updated Successfully");
        roleDialog.value = false;
        fetchUsers();
    } catch (error) {
        console.error(error);
        alert("Failed to update role");
    }
}

// ✅ NEW FUNCTION: Handle User Creation
async function handleCreateUser() {
    // Basic validation
    if (!newUser.value.email || !newUser.value.password || !newUser.value.fullName) {
        alert("Please fill all required fields.");
        return;
    }
    const token = localStorage.getItem('token');   
    try {
        // Construct payload, adding roles as an array (required by AdminCreateRequest DTO)
        const payload = {
            ...newUser.value,
            roles: [`${newUser.value.role}`]
        };
        await axios.post('http://localhost:8080/api/admin/create-user', 
            payload, {
                headers: { "user-payload": token }
            }); 
        alert("User created successfully!");
        createUserDialog.value = false;
        // Clear form
        newUser.value = { fullName: '', email: '', password: '', mobile: '',
        addressLine: '', city: '', pinCode: '', role: 'CUSTOMER' }; 
        fetchUsers(); // Refresh the list 
    } catch (error: any) {
        console.error("User creation failed:", error);
        alert("Creation Failed: " + (error.response?.data?.message || "Check server logs."));
    }
}
// --- 4. VIEW HISTORY (Placeholder) ---
function viewPurchaseHistory(user: any) {
    selectedUser.value = user;
    historyDialog.value = true;
}
// Load on mount
onMounted(() => {
    fetchUsers();
});
// Vuetify 3 Headers (Title & Key)
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Full Name', key: 'fullName' }, 
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'roles' },
  { title: 'Status', key: 'accountStatus' },
  { title: 'Actions', key: 'actions', sortable: false }
];
</script>

<template>
  <v-container fluid>
    <v-card flat>
        <v-card-title class="d-flex justify-space-between align-center">
          User Management
          <v-btn color="success" @click="createUserDialog = true" prepend-icon="mdi-plus">
              Add New User
          </v-btn>
        </v-card-title>
        <v-card-text>
            <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Search Users"
                single-line
                hide-details
                class="mb-4"
            ></v-text-field>
            <v-data-table
                :headers="headers"
                :items="users"
                :search="search"
                :loading="loading"
                hover
            >
                <template #item.roles="{ item }">
                     <v-chip color="blue" size="small" class="mr-1" v-for="role in item.roles" :key="role">
                        {{ role.name ? role.name : role }}
                     </v-chip>
                </template>
                <template #item.accountStatus="{ item }">
                    <v-chip :color="getStatusColor(item.accountStatus)" size="small">
                        {{ item.accountStatus }}
                    </v-chip>
                </template>
                <template #item.actions="{ item }">
                    <div class="d-flex flex-column" style="gap: 4px;">
                        <div class="d-flex" style="gap: 4px;">
                            <v-btn 
                                size="x-small" 
                                :color="item.accountStatus === 'ACTIVE' ? 'warning' : 'success'" 
                                @click="toggleStatus(item)"
                                :disabled="item.accountStatus === 'DELETED'"
                            >
                                {{ item.accountStatus === 'ACTIVE' ? 'Inactivate' : 'Activate' }}
                            </v-btn>
                            <v-btn size="x-small" color="primary" variant="tonal" @click="openRoleDialog(item)">
                                Role
                            </v-btn>
                        </div>
                        <v-btn 
                            size="x-small" 
                            color="secondary" 
                            variant="flat"
                            @click="viewPurchaseHistory(item)"
                        >
                            Order History
                        </v-btn>
                    </div>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>

    <v-dialog v-model="createUserDialog" max-width="600">
    <v-card>
        <v-card-title>Create New User</v-card-title>
        <v-card-text>
            <v-text-field v-model="newUser.fullName" label="Full Name" required></v-text-field>
            <v-text-field v-model="newUser.email" label="Email" type="email" required></v-text-field>
            <v-text-field v-model="newUser.password" label="Password (Required)" type="password" required></v-text-field>
            <v-text-field v-model="newUser.mobile" label="Mobile Number" hint="Optional"></v-text-field>
            <v-divider class="my-4"></v-divider>
            <v-text-field v-model="newUser.addressLine" label="Address Line" hint="Optional"></v-text-field>
            <v-row dense>
                <v-col cols="6">
                    <v-text-field v-model="newUser.city" label="City" hint="Optional"></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model="newUser.pinCode" label="Pincode" hint="Optional"></v-text-field>
                </v-col>
            </v-row>
            <v-select 
                v-model="newUser.role" 
                :items="['ROLE_ADMIN', 'ROLE_CUSTOMER']" 
                label="Role" 
                required
            ></v-select>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="createUserDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="handleCreateUser">Create</v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>

    <v-dialog v-model="roleDialog" max-width="400">
        <v-card>
            <v-card-title>Change Role</v-card-title>
            <v-card-text>
                <p class="mb-2">Select new role for <strong>{{ selectedUser?.fullName }}</strong></p>
                <v-select
                    v-model="selectedRole"
                    :items="['ROLE_ADMIN', 'ROLE_CUSTOMER']"
                    label="Role"
                    outlined dense
                ></v-select>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn text @click="roleDialog = false">Cancel</v-btn>
                <v-btn color="primary" @click="updateRole">Update</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="historyDialog" max-width="600">
        <v-card>
            <v-card-title>History: {{ selectedUser?.fullName }}</v-card-title>
            <v-card-text>
                 <v-alert type="info" variant="tonal">
                    Order History API not connected yet.
                 </v-alert>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="historyDialog = false">Close</v-btn>
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