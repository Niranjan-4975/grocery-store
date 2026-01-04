<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { useAuth } from "./composables/useAuth";
import { useTheme } from "vuetify";
import { useToastStore } from "./stores/toastStore";

const { loading, initAuth } = useAuth();
const theme = useTheme();
const toastStore = useToastStore();

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
      <v-snackbar
        v-model="toastStore.show"
        :color="toastStore.type === 'success' ? 'success' : 'error'"
        location="bottom middle"
        :timeout="toastStore.timeout"
        elevation="24"
        >
        <div class="d-flex align-center">
          <v-icon start :icon="toastStore.type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'"></v-icon>
          {{ toastStore.message }}
        </div>
        <template v-slot:actions>
          <v-btn icon="mdi-close" variant="text" @click="toastStore.show = false"></v-btn>
        </template>
      </v-snackbar>
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
