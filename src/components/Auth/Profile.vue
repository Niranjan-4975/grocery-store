<template>
  <v-container class="py-6">
    <v-row v-if="loading" justify="center" class="mt-10">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>
    <v-row v-else justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6" elevation="4" rounded="xl">
          <!-- Avatar + Name -->
          <div class="d-flex align-center flex-column text-center mb-6">
            <v-avatar size="96" color="deep-purple accent-4">
              <span class="white--text text-h5">{{ userInitials }}</span>
            </v-avatar>
            <h2 class="mt-3">{{ userName }}</h2>
            <p class="text-subtitle-1 text-grey">{{ userEmail }}</p>
          </div>

          <!-- User Info -->
          <v-list lines="two" density="comfortable">
            <v-list-item>
              <v-list-item-title>Email</v-list-item-title>
              <v-list-item-subtitle>{{ userEmail }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Phone</v-list-item-title>
              <v-list-item-subtitle>{{ userPhone }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Address</v-list-item-title>
              <v-list-item-subtitle>{{ userAddress }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Location</v-list-item-title>
              <v-list-item-subtitle>{{ userCity }} - {{ userPincode }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <!-- Actions -->
          <div class="d-flex justify-space-between mt-6">
            <v-btn color="primary" variant="elevated" @click="openEditDialog">Edit Profile</v-btn>
            <v-btn color="error" variant="elevated" @click="handleLogout">Logout</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    
    <!----Edit Profile Pop Up Dialog-->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>Edit Profile</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field v-model="editedName" label="Name" outlined dense/>
          <v-text-field v-model="editedEmail" label="Email" outlined dense/>
          <v-text-field v-model="editedPhone" label="Phone" outlined dense/>
          <v-textarea v-model="editedAddress" label="Address" outlined dense rows="1"/>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="editedCity" label="City" outlined dense />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="editedPincode" label="Pincode" outlined dense />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text color="error" variant="elevated" @click="editDialog = false">Cancel</v-btn>
          <v-btn color="success" variant="elevated" @click="saveEdit" :loading="saving">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted} from "vue";
import { useAuth } from "../../composables/useAuth";
import api from "../../axios";

const loading = ref(true);
const saving = ref(false);

// State
const userName = ref("");
const userEmail = ref("");
const userPhone = ref("");
const userAddress = ref("");
const userCity = ref("");
const userPincode = ref("");

// Edit dialog state
const editDialog = ref(false);
const editedName = ref("");
const editedEmail = ref("");
const editedPhone = ref("");
const editedAddress = ref("");
const editedCity = ref("");
const editedPincode = ref("");

const userInitials = computed(() =>
  userName.value ? userName.value.split(" ").map((n) => n[0]).join("").toUpperCase(): "U"
);

//1. Fetch Profile (GET /user/me)
onMounted(async () => {
  try {
    // We use the standard 'Authorization' header
    const response = await api.get("/users/me");
    // Map backend fields
    const data = response.data;
    userName.value = data.fullName;
    userEmail.value = data.email;
    userPhone.value = data.mobile;
    userAddress.value = data.addressLine;
    userCity.value = data.city || "";
    userPincode.value = data.pinCode || ""
  } catch (error) {
      console.error("Fetch Error", error);
      logout();
      // Optional: fail silently or show error
  } finally {
      loading.value = false;
  }
});

// --- 2. UPDATE PROFILE (PUT /user/update-profile) ---
const saveEdit = async () => {
  saving.value = true;
  try {
    // ⚠️ PAYLOAD MUST MATCH 'UpdateUserRequest.java'
    const payload = {
      fullName: editedName.value,
      email: editedEmail.value,
      mobile: editedPhone.value,      // check if Java expects 'mobile' or 'mobileNumber'
      addressLine: editedAddress.value,
      city: editedCity.value,
      pinCode: editedPincode.value 
    };
    await api.put("/users/update-profile", payload);
    // Update UI immediately
    userName.value = editedName.value;
    userEmail.value = editedEmail.value;
    userPhone.value = editedPhone.value;
    userAddress.value = editedAddress.value;
    userCity.value = editedCity.value;
    userPincode.value = editedPincode.value;
    alert("Profile updated successfully!");
    editDialog.value = false;
  } catch (error) {
    console.error("Update Error", error);
    alert("Failed to update profile.");
  } finally {
    saving.value = false;
  }
};

const openEditDialog = () => {
    editedName.value = userName.value;
    editedEmail.value = userEmail.value;
    editedPhone.value = userPhone.value;
    editedAddress.value = userAddress.value;
    editedCity.value = userCity.value;
    editedPincode.value = userPincode.value;
    editDialog.value = true;
};
const {logout} = useAuth();
const handleLogout = () => {
  logout();
};
</script>
