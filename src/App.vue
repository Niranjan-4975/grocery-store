<script setup lang="ts">
import { RouterView } from "vue-router";
import { useAuth } from "./composables/useAuth";
import Applayout from "./components/common/Applayout.vue";

const { loading } = useAuth();
</script>

<template>
  <div v-if="loading" class="loading-screen">
    Loading...
  </div>

  <RouterView v-else v-slot="{ Component, route }">
    <component v-if="route.meta.layout === 'none'" :is="Component" />
    <Applayout v-else>
      <component :is="Component" />
    </Applayout>
  </RouterView>
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
