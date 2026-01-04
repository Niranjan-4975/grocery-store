<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { useAuth } from "./composables/useAuth";
import { useTheme } from "vuetify";
import { useToastStore } from "./stores/toastStore";

const { loading, initAuth } = useAuth();
const theme = useTheme();
const toastStore = useToastStore();

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return 'mdi-check-circle';
    case 'error':   return 'mdi-alert-octagon';
    case 'warning': return 'mdi-alert';
    default:        return 'mdi-information-outline';
  }
};
onMounted(()=>{
  const savedTheme = localStorage.getItem('app_theme');
  if (savedTheme) {
    theme.global.name.value = savedTheme;
  } else {
    theme.global.name.value = 'light';
  }
  initAuth();
});
</script>

<template>
  <v-app>
    <div v-if="loading" class="loading-screen">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <span class="ml-3">Loading...</span>
    </div>
    <template v-else>
      <RouterView />
      <v-snackbar v-model="toastStore.show" :color="toastStore.type" location="bottom middle"
        :timeout="toastStore.timeout" elevation="24">
        <div class="d-flex align-center">
          <v-icon start :icon="getIcon(toastStore.type)"></v-icon>
          {{ toastStore.message }}
        </div>
        <template v-slot:actions>
          <v-btn icon="mdi-close" variant="text" @click="toastStore.show = false"></v-btn>
        </template>
      </v-snackbar>
      <v-dialog v-model="toastStore.confirmShow" max-width="450px" persist>
        <v-card rounded="lg">
          <v-card-title class="bg-grey-lighten-4 py-4 d-flex align-center">
            <v-icon color="warning" class="mr-2">mdi-alert</v-icon>
            <span class="text-h6">{{ toastStore.confirmTitle }}</span>
          </v-card-title>
          <v-card-text class="pa-6 text-body-1">
            {{ toastStore.confirmMessage }}
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn 
              variant="text" 
              color="grey-darken-1" 
              @click="toastStore.handleConfirm(false)"
            >
              Cancel
            </v-btn>
            <v-btn 
              variant="flat" 
              color="red-darken-1" 
              class="px-6" 
              @click="toastStore.handleConfirm(true)"
            >
              Confirm
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-app>
</template>

<style>
.loading-screen {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  font-size: 1.2rem;
}
</style>
