<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { useAuth } from "./composables/useAuth";
import Applayout from "./components/common/Applayout.vue";

const { loading, initAuth } = useAuth();

onMounted(()=>{
  initAuth();
});
</script>

<template>
  <div v-if="loading" class="loading-screen">
    Loading...
  </div>
  <RouterView v-else/>
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
