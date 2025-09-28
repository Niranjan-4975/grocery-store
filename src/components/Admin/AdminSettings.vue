<script setup lang="ts">
import { ref } from 'vue';

// --- Store Details ---
const storeName = ref('My Grocery Store');
const storeAddress = ref('123 Main Street, City, Country');
const storeContact = ref('+91 9876543210');

// --- Payment & Delivery ---
const paymentMethods = ref(['Cash on Delivery', 'UPI', 'Credit Card']);
const selectedPaymentMethods = ref(['Cash on Delivery']);
const deliveryOptions = ref(['Standard', 'Express']);
const selectedDeliveryOptions = ref(['Standard']);
const deliveryFee = ref(50);

// --- Theme Settings ---
const darkMode = ref(false);
const primaryColor = ref('#3f51b5');

// --- Functions ---
function saveSettings() {
  console.log('Settings saved', {
    storeName: storeName.value,
    storeAddress: storeAddress.value,
    storeContact: storeContact.value,
    selectedPaymentMethods: selectedPaymentMethods.value,
    selectedDeliveryOptions: selectedDeliveryOptions.value,
    deliveryFee: deliveryFee.value,
    darkMode: darkMode.value,
    primaryColor: primaryColor.value,
  });
  alert('Settings saved successfully! (Mock)');
}
</script>

<template>
  <v-container fluid>
    <v-row>
      <!-- Store Details -->
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title>Store Details</v-card-title>
          <v-card-text>
            <v-text-field v-model="storeName" label="Store Name" />
            <v-textarea v-model="storeAddress" label="Address" rows="2" />
            <v-text-field v-model="storeContact" label="Contact Number" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Payment & Delivery -->
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title>Payment & Delivery</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedPaymentMethods"
              :items="paymentMethods"
              label="Payment Methods"
              multiple
              chips
            />
            <v-select
              v-model="selectedDeliveryOptions"
              :items="deliveryOptions"
              label="Delivery Options"
              multiple
              chips
            />
            <v-text-field v-model="deliveryFee" label="Delivery Fee (₹)" type="number" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Theme Settings -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title>Theme Settings</v-card-title>
          <v-card-text>
            <v-switch v-model="darkMode" label="Dark Mode" />
            <v-color-picker v-model="primaryColor" mode="hexa" hide-canvas hide-inputs hide-mode-switch flat />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Save Button -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-btn color="success" @click="saveSettings">Save Settings</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-card {
  margin-bottom: 16px;
}
</style>
