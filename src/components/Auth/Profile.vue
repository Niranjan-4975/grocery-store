<template>
  <v-container class="py-6">
    <v-row v-if="loading" justify="center" class="mt-10">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>
    
    <v-row v-else justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6" elevation="4" rounded="xl">
          <div class="d-flex align-center flex-column text-center mb-6">
            <v-avatar size="96" color="deep-purple accent-4" elevation="4">
              <span class="white--text text-h4">{{ userInitials }}</span>
            </v-avatar>
            <h2 class="mt-4 font-weight-bold">{{ userName }}</h2>
            <p class="text-subtitle-1 text-grey">{{ userEmail }}</p>
          </div>

          <v-list lines="two" variant="flat" class="bg-transparent">
            <v-list-item prepend-icon="mdi-email-outline">
              <v-list-item-title class="text-caption text-grey">{{ $t('profile.email') }}</v-list-item-title>
              <v-list-item-subtitle class="text-body-1 font-weight-medium">{{ userEmail }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item prepend-icon="mdi-phone-outline">
              <v-list-item-title class="text-caption text-grey">{{ $t('profile.phone') }}</v-list-item-title>
              <v-list-item-subtitle class="text-body-1 font-weight-medium">{{ userPhone }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item prepend-icon="mdi-map-marker-outline">
              <v-list-item-title class="text-caption text-grey">{{ $t('profile.address') }}</v-list-item-title>
              <v-list-item-subtitle class="text-body-1 font-weight-medium">{{ userAddress }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item prepend-icon="mdi-city-variant-outline">
              <v-list-item-title class="text-caption text-grey">{{ $t('profile.location') }}</v-list-item-title>
              <v-list-item-subtitle class="text-body-1 font-weight-medium">{{ userCity }} - {{ userPincode }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-divider class="my-4"></v-divider>
          <div class="d-flex justify-space-between pt-2">
            <v-btn color="primary" rounded="pill" prepend-icon="mdi-account-edit" @click="openEditDialog">
              {{ $t('profile.update_profile') }}
            </v-btn>
            <v-btn color="error" variant="text" @click="handleLogout">
              {{ $t('nav.logout') }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    
    <v-dialog v-model="editDialog" max-width="500px" transition="dialog-bottom-transition">
      <v-card rounded="xl">
        <v-card-title class="pa-6 font-weight-bold">{{ $t('profile.update_profile') }}</v-card-title>
        <v-divider></v-divider>
        
        <v-card-text class="pa-6">
          <v-text-field v-model="editedName" :label="$t('profile.name')" variant="outlined" density="comfortable" />
          <v-text-field v-model="editedEmail" :label="$t('profile.email')" variant="outlined" density="comfortable" disabled />
          <v-text-field v-model="editedPhone" :label="$t('profile.phone')" variant="outlined" density="comfortable" />
          
          <v-textarea v-model="editedAddress" :label="$t('profile.address')" variant="outlined" rows="2" />
          
          <v-row>
            <v-col cols="7">
              <v-text-field v-model="editedCity" :label="$t('profile.city')" variant="outlined" />
            </v-col>
            <v-col cols="5">
              <v-text-field v-model="editedPincode" :label="$t('profile.pincode')" variant="outlined" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editDialog = false">{{ $t('profile.cancel') }}</v-btn>
          <v-btn color="success" variant="elevated" rounded="pill" class="px-6" @click="saveEdit" :loading="saving">
            {{ $t('profile.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted} from "vue";
import { useAuth } from "../../composables/useAuth";
import api from "../../axios";
import { useNotify } from "../../composables/useNotify";

const loading = ref(true);
const saving = ref(false);
const { notify } = useNotify();
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
    const response: any = await api.get("/users/me");
    const user = response.data || response; // ApiResponse wrapper handling
    userName.value = user.fullName;
    userEmail.value = user.email;
    userPhone.value = user.mobile;
    // ✅ Naya Logic: Addresses list se default uthao
    if (user.addresses && user.addresses.length > 0) {
      const addr = user.addresses[0]; // Backend se filter hokar sirf default wala hi aa raha hai
      userAddress.value = addr.flatHouseNo + (addr.area ? ", " + addr.area : "");
      userCity.value = addr.city;
      userPincode.value = addr.zipCode;
    } else {
      userAddress.value = "No address set";
    }
  } catch (error) {
    console.error("Fetch Error", error);
  } finally {
    loading.value = false;
  }
});

// --- 2. UPDATE PROFILE (PUT /user/update-profile) ---
const saveEdit = async () => {
  saving.value = true;
  try {
    const payload = {
      fullName: editedName.value,
      email: editedEmail.value,
      mobile: editedPhone.value,
      // ✅ Nayi table structure ke liye fields
      addressLine: editedAddress.value, 
      city: editedCity.value,
      pinCode: editedPincode.value 
    };
    
    await api.put("/users/update-profile", payload);
    
    // UI Update logic
    userName.value = editedName.value;
    userEmail.value = editedEmail.value;
    userPhone.value = editedPhone.value;
    userAddress.value = editedAddress.value;
    userCity.value = editedCity.value;
    userPincode.value = editedPincode.value;
    
    editDialog.value = false;
    notify.success("Profile & Default Address updated!");
  } catch (error) {
    notify.error("Update failed");
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
