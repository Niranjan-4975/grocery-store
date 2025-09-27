<template>
  <v-container class="py-6">
    <v-row justify="center">
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
          </v-list>

          <!-- Actions -->
          <div class="d-flex justify-space-between mt-6">
            <v-btn color="primary" variant="elevated" @click="editDialog = true">Edit Profile</v-btn>
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
                <v-text-field v-model="editedPhone" label="Phone" outlined dense/>
                <v-textarea v-model="editedAddress" label="Address" outlined dense/>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn color="error" variant="elevated" @click="cancelEdit">Cancel</v-btn>
                <v-btn color="success" variant="elevated" @click="saveEdit">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuth } from "../../composables/useAuth";

// Mock user data (replace later with API/auth store)
const userName = ref("Niranjan Dungahu");
const userEmail = ref("niranjan@example.com");
const userPhone = ref("+91 9876543210");
const userAddress = ref("Bangalore, India");

const userInitials = computed(() =>
  userName.value
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
);

//Edit Profile
const editDialog = ref(false);
const editedName = ref(userName.value);
const editedPhone = ref(userPhone.value);
const editedAddress = ref(userAddress.value);

const cancelEdit=()=>{
    editDialog.value = false;
    editedName.value = userName.value;
    editedPhone.value = userPhone.value;
    editedAddress.value = userAddress.value;
}
const saveEdit= ()=>{
    userName.value = editedName.value;
    userPhone.value = editedPhone.value;
    userAddress.value = editedAddress.value;
    editDialog.value = false;
    alert("Profile updated successfully!!!");
}

const {logout} = useAuth();
const handleLogout = () => {
  logout();
  // Replace with actual logout logic
};
</script>
