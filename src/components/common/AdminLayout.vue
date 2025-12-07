<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterView, useRouter, useRoute } from "vue-router";
import { useAuth } from "../../composables/useAuth.ts";

// Auth
const { user, logout } = useAuth();
const router = useRouter();
const route = useRoute();

// Responsive
const isMobile = ref(window.innerWidth <= 768);
function handleResize() {
  isMobile.value = window.innerWidth <= 768;
}
onMounted(() => window.addEventListener("resize", handleResize));
onUnmounted(() => window.removeEventListener("resize", handleResize));

// Drawer toggle
const drawer = ref(!isMobile.value);
function toggleDrawer() {
  drawer.value = !drawer.value;
}

// Admin menu
const adminMenu = [
  { name: "Dashboard", path: "" },
  { name: "Users", path: "users" },
  { name: "Products", path: "products" },
  { name: "Categories", path: "categories" },
  { name: "Orders", path: "orders" },
  { name: "Reports", path: "reports" },
  { name: "Settings", path: "settings" }
];


// User initials for avatar
const userInitials = computed(() => {
  if (!user.value?.username) return "AD";
  return user.value.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
});

function navigate(path: string) {
  router.push(path ? `/admin/${path}`: "/admin");
}

function handleLogout() {
  logout();
}
</script>

<template>
  <v-app>
    <!-- Topbar -->
    <v-app-bar app color="primary" dark>
      <v-btn icon @click="toggleDrawer" v-if="isMobile">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-app-bar-title>Admin Panel</v-app-bar-title>
      <v-spacer></v-spacer>

      <!-- Profile menu -->
      <v-menu offset-y bottom>
        <template #activator="{ props }">
          <v-avatar v-bind="props" size="36" color="deep-purple accent-4" class="cursor-pointer">
            <span class="white--text">{{ userInitials }}</span>
          </v-avatar>
        </template>
        <v-list>
          <v-list-item @click="$router.push({name: 'AdminProfile'})" prepend-icon="mdi-account">
            <v-list-item-title>My Profile</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleLogout" prepend-icon="mdi-logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Sidebar -->
    <v-navigation-drawer app v-model="drawer" :temporary="isMobile">
      <v-list dense nav>
        <v-list-item
          v-for="(item, i) in adminMenu"
          :key="i"
          @click="navigate(item.path); isMobile && (drawer = false)"
          :class="{ 'active-link': route.path === `/admin/${item.path}` || (item.path === '' && route.path === '/admin') }"
        >
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main content -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
.active-link {
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
