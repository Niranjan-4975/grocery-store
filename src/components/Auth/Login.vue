<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../../composables/useAuth";


const router = useRouter();
const { login } = useAuth();
const activeTab = ref("login");

// ---------------- Login form state ----------------
const loginUsername = ref("");
const loginPassword = ref("");
const loginErrors = ref<{ username?: string; password?: string }>({});

function validateLogin() {
  loginErrors.value = {};
  if (!loginUsername.value.trim()) loginErrors.value.username = "Username required";
  if (!loginPassword.value.trim()) loginErrors.value.password = "Password required";
  return Object.keys(loginErrors.value).length === 0;
}
function handleLogin() {
  if (!validateLogin()) return;
  const result = login(loginUsername.value, loginPassword.value);
  console.log("value of result", result)
  if (!result.success) {
    alert("Invalid credentials!");
    return;
  }
  console.log("handleLogin called")
  // Redirect based on role
  if (result.role === "admin") {
    router.push("/admin").catch(()=>{});
    console.log("Role checked!! -- admin")
  }else{
    console.log("Role checked -- customer")
    router.push("/home").catch(()=>{});
  }
}

// ---------------- Signup form state ----------------
const signupEmail = ref("");
const signupUsername = ref("");
const signupPassword = ref("");
const signupConfirm = ref("");
const signupErrors = ref<{ email?: string; username?: string; password?: string; confirm?: string }>({});

function validateSignup() {
  signupErrors.value = {};
  if (!signupEmail.value.trim()) signupErrors.value.email = "Email required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.value)) signupErrors.value.email = "Invalid email";
  if (!signupUsername.value.trim()) signupErrors.value.username = "Username required";
  if (!signupPassword.value) signupErrors.value.password = "Password required";
  if (signupConfirm.value !== signupPassword.value) signupErrors.value.confirm = "Passwords must match";
  return Object.keys(signupErrors.value).length === 0;
}
function handleSignup() {
  if (!validateSignup()) return;
  // fake signup success
  alert("Signup successful! Please login.");
  activeTab.value = "login";
}
</script>

<template>
  <div class="auth-page">
    <v-card class="auth-card" elevation="6">
      <v-tabs v-model="activeTab" grow>
        <v-tab value="login">Login</v-tab>
        <v-tab value="signup">Sign Up</v-tab>
      </v-tabs>
      <v-divider></v-divider>
      <v-window v-model="activeTab" class="pa-6">
        <!-- Login -->
        <v-window-item value="login">
          <h2 class="text-h5 mb-4">Welcome Back</h2>
          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="loginUsername"
              label="Email or Username"
              prepend-inner-icon="mdi-account"
              outlined dense
              :error="Boolean(loginErrors.username)"
              :error-messages="loginErrors.username ? [loginErrors.username] : []"
            />
            <v-text-field
              v-model="loginPassword"
              type="password"
              label="Password"
              prepend-inner-icon="mdi-lock"
              outlined dense
              :error="Boolean(loginErrors.password)"
              :error-messages="loginErrors.password ? [loginErrors.password] : []"
            />
            <v-btn type="submit" color="primary" block class="mt-4">Login</v-btn>
          </v-form>
        </v-window-item>
        <!-- Signup -->
        <v-window-item value="signup">
          <h2 class="text-h5 mb-4">Create Account</h2>
          <v-form @submit.prevent="handleSignup">
            <v-text-field
              v-model="signupEmail"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              outlined dense
              :error="Boolean(signupErrors.email)"
              :error-messages="signupErrors.email ? [signupErrors.email] : []"
            />
            <v-text-field
              v-model="signupUsername"
              label="Username"
              prepend-inner-icon="mdi-account"
              outlined dense
              :error="Boolean(signupErrors.username)"
              :error-messages="signupErrors.username ? [signupErrors.username] : []"
            />
            <v-text-field
              v-model="signupPassword"
              type="password"
              label="Password"
              prepend-inner-icon="mdi-lock"
              outlined dense
              :error="Boolean(signupErrors.password)"
              :error-messages="signupErrors.password ? [signupErrors.password] : []"
            />
            <v-text-field
              v-model="signupConfirm"
              type="password"
              label="Confirm Password"
              prepend-inner-icon="mdi-lock-check"
              outlined dense
              :error="Boolean(signupErrors.confirm)"
              :error-messages="signupErrors.confirm ? [signupErrors.confirm] : []"
            />
            <v-btn type="submit" color="success" block class="mt-4">Sign Up</v-btn>
          </v-form>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);
  padding: 16px;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  overflow: hidden;
}
</style>
