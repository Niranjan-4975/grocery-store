<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useTheme } from 'vuetify';
import api from '../../axios';

const theme = useTheme();
const loading = ref(false);

const settings = ref({
    storeName: '',
    storeAddress: '',
    storeContact: '',
    // Dropdown items
    paymentMethodsList: ['Cash on Delivery', 'UPI', 'Credit Card'],
    deliveryOptionsList: ['Standard', 'Express'],
    // Selected values
    selectedPaymentMethods: [],
    selectedDeliveryOptions: [],
    deliveryFee: 0,
    darkMode: false,
    primaryColor: '#3f51b5'
});

// ✅ Theme & Chart Sync Function
function applyTheme(isDark: boolean, color: string) {
    // 1. Vuetify Theme Switch
    theme.global.name.value = isDark ? 'dark' : 'light';
    
    // 2. Primary Color update
    if (theme.themes.value.light) theme.themes.value.light.colors.primary = color;
    if (theme.themes.value.dark) theme.themes.value.dark.colors.primary = color;

    // 3. LocalStorage mein save karein taaki Dashboard ke charts ise pick kar sakein
    localStorage.setItem('app_theme', isDark ? 'dark' : 'light');
}

async function loadSettings() {
    try {
        const response: any = await api.get(`/admin/settings`,);
        if (response) {
            settings.value = { ...settings.value, ...response };
            settings.value.selectedPaymentMethods = response.paymentMethods || [];
            settings.value.selectedDeliveryOptions = response.deliveryOptions || [];
            
            // Initial theme apply
            applyTheme(settings.value.darkMode, settings.value.primaryColor);
        }
    } catch (error) { console.error("Error loading settings:", error); }
}

async function saveSettings() {
    loading.value = true;
    try {
        const payload = {
            ...settings.value,
            paymentMethods: settings.value.selectedPaymentMethods,
            deliveryOptions: settings.value.selectedDeliveryOptions
        };
        await api.put(`/admin/settings`, payload,);
        applyTheme(settings.value.darkMode, settings.value.primaryColor);
    } catch (error) { console.error }
    finally { loading.value = false; }
}

// ✅ Live Preview Watchers
watch(() => settings.value.darkMode, (val) => theme.global.name.value = val ? 'dark' : 'light');
watch(() => settings.value.primaryColor, (val) => {
    if (theme.themes.value.light) theme.themes.value.light.colors.primary = val;
    if (theme.themes.value.dark) theme.themes.value.dark.colors.primary = val;
});

onMounted(loadSettings);
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold text-high-emphasis">Store & Theme Settings</h2>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="bg-primary text-on-primary py-3 font-weight-bold">
            <v-icon start>mdi-store</v-icon> Store Details
          </v-card-title>
          <v-card-text class="pt-4">
            <v-text-field v-model="settings.storeName" label="Store Name" variant="outlined" density="compact" />
            <v-textarea v-model="settings.storeAddress" label="Address" rows="2" variant="outlined" density="compact" />
            <v-text-field v-model="settings.storeContact" label="Contact Number" variant="outlined" density="compact" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="bg-primary text-on-primary py-3 font-weight-bold">
            <v-icon start>mdi-truck-delivery</v-icon> Logistics & Payments
          </v-card-title>
          <v-card-text class="pt-4">
            <v-select 
              v-model="settings.selectedPaymentMethods" 
              :items="settings.paymentMethodsList" 
              label="Payment Methods" 
              multiple 
              chips 
              variant="outlined" 
              density="compact" 
            />
            <v-select 
              v-model="settings.selectedDeliveryOptions" 
              :items="settings.deliveryOptionsList" 
              label="Delivery Options" 
              multiple 
              chips 
              variant="outlined" 
              density="compact" 
            />
            <v-text-field 
              v-model="settings.deliveryFee" 
              label="Delivery Fee (₹)" 
              type="number" 
              variant="outlined" 
              density="compact" 
              prepend-inner-icon="mdi-currency-inr"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="bg-primary text-on-primary py-3 font-weight-bold">
            <v-icon start>mdi-palette</v-icon> Appearance (Live Preview)
          </v-card-title>
          <v-card-text class="pt-4">
            <v-switch 
                v-model="settings.darkMode" 
                :label="settings.darkMode ? 'Dark Mode On' : 'Light Mode On'" 
                color="primary" 
                inset
            />
            
            <div class="mb-2 font-weight-bold text-high-emphasis">Primary Brand Color</div>
            <v-color-picker 
                v-model="settings.primaryColor" 
                mode="hexa" 
                hide-inputs 
                show-swatches 
                elevation="0"
                width="100%"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-btn 
      color="primary" 
      class="mt-6" 
      size="large" 
      @click="saveSettings" 
      :loading="loading" 
      prepend-icon="mdi-content-save-check"
    >
      Save All Configurations
    </v-btn>
  </v-container>
</template>