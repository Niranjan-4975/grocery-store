<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth} from "../../composables/useAuth";
import api from "../../axios";
import { useNotify } from "../../composables/useNotify";


const router = useRouter();
const { login } = useAuth();
const { notify } = useNotify();
const activeTab = ref("login");
const isSubmitting = ref(false);

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

// ✅ NEW STATE FOR CUSTOM DIALOG
const showStatusDialog = ref(false);
const statusDialogMessage = ref("");
const statusDialogTitle = ref("")

async function handleLogin() {
  if (!validateLogin()) return notify.warning("Please fill in all required fields.");
  isSubmitting.value = true;
  const result = await login(loginUsername.value, loginPassword.value);
  console.log("value of result", result);
  if (result.success) {
    console.log("handleLogin called")
    const roleString = String(result.role);
    if (roleString.includes("ROLE_ADMIN") || roleString.includes("[ROLE_ADMIN]")) {
    router.push("/admin").catch(()=>{});
    }else{
      console.log("Role checked -- customer")
      router.push("/home").catch(()=>{});
    }
  }
  isSubmitting.value = false;
}

// ---------------- Signup form state ----------------
const signupEmail = ref(""); 
const signupUsername = ref("");
const signupPassword = ref("");
const signupMobile = ref("");
const signupAddress = ref("");
const signupCity = ref("");
const signupPin = ref("");
const signupConfirm = ref("");
const signupErrors = ref<{ email?: string; username?: string; password?: string; 
  confirm?: string; mobile?: string; address?: string; city?: string; pin?: string;}>({});

function validateSignup() {
  signupErrors.value = {};

  if (!signupEmail.value.trim()) signupErrors.value.email = "Email required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.value)) signupErrors.value.email = "Invalid email";

  if (!signupUsername.value.trim()) signupErrors.value.username = "Username required";
  if (!signupPassword.value) signupErrors.value.password = "Password required";
  if (signupConfirm.value !== signupPassword.value) signupErrors.value.confirm = "Passwords must match";

  if(!signupMobile.value){
     signupErrors.value.mobile = "Mobile No Required";
    } else if (!/^\d{10}$/.test(signupMobile.value)){
     signupErrors.value.mobile = "Mobile must be 10 digits";
  }

  if (!signupAddress.value || !signupAddress.value.trim()){ signupErrors.value.address = "Address required";}
  if (!signupCity.value || !signupCity.value.trim()){ signupErrors.value.city = "City required"}
  if (!signupPin.value) {
    signupErrors.value.pin = "Pincode required";
  } else if (!/^\d{6}$/.test(signupPin.value)) {
    // ^\d{6}$ checks for exactly 6 digits. Adjust to 5 if using US Zip codes.
    signupErrors.value.pin = "Pincode must be 6 digits";
  }
  return Object.keys(signupErrors.value).length === 0;
}

async function handleSignup() {
  if (!validateSignup()) return notify.warning("Please fill in all required fields.");
  //2. Start Loading
  isSubmitting.value = true;
  const payload = {
    fullName: signupUsername.value,
    email: signupEmail.value,
    password: signupPassword.value,
    mobile: signupMobile.value,
    addressLine: signupAddress.value,
    city: signupCity.value,
    pinCode: signupPin.value
  }
  try{
    //3. Make the API Call
    const response: any = await api.post('/auth/register',payload);
    //4. Sucess
    console.log("Signup Response: ", response);
    activeTab.value = "login";
  }catch (error: any){
    return { success: false};
  }finally {
    // 6. Stop Loading
    isSubmitting.value = false;
  }
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
              label="Email"
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
              :error-messages="loginErrors.password && !loginErrors.username? [loginErrors.password] : []"
            />
            <v-btn type="submit" color="primary" block class="mt-4">Login</v-btn>
          </v-form>
        </v-window-item>
        <!-- Signup -->
        <v-window-item value="signup">
          <h2 class="text-h5 mb-4">Create Account</h2>
          <v-form @submit.prevent="handleSignup">
            <v-text-field
              v-model="signupUsername"
              label="Username"
              prepend-inner-icon="mdi-account"
              outlined dense
              :error="Boolean(signupErrors.username)"
              :error-messages="signupErrors.username ? [signupErrors.username] : []"
            />
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
              v-model="signupPassword"
              type="password"
              label="Password"
              prepend-inner-icon="mdi-lock"
              outlined dense
              :error="Boolean(signupErrors.password)"
              :error-messages="signupErrors.password ? [signupErrors.password] : []"
            />
            <v-text-field
              v-model="signupMobile"
              label="Mobile No"
              prepend-inner-icon="mdi-cellphone"
              outlined dense
              type="tel"
              :error="Boolean(signupErrors.mobile)"
              :error-messages="signupErrors.mobile ? [signupErrors.mobile] : []"
            />
            <v-text-field
              v-model="signupAddress"
              label="Address Line"
              prepend-inner-icon="mdi-map-marker"
              outlined dense
              :error="Boolean(signupErrors.address)"
              :error-messages="signupErrors.address ? [signupErrors.address] : []"
            />
            <v-text-field
              v-model="signupCity"
              label="City"
              prepend-inner-icon="mdi-city"
              outlined dense
              :error="Boolean(signupErrors.city)"
              :error-messages="signupErrors.city ? [signupErrors.city] : []"
            />
            <v-text-field
              v-model="signupPin"
              label="Pincode"
              prepend-inner-icon="mdi-map-marker-radius"
              outlined dense
              type="number"
              :error="Boolean(signupErrors.pin)"
              :error-messages="signupErrors.pin ? [signupErrors.pin] : []"
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
    <v-dialog v-model="showStatusDialog" max-width="450">
      <v-card>
        <v-card-title class="text-h5 error--text">
          <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
          {{ statusDialogTitle }}
        </v-card-title>
        <v-card-text class="pt-4">
          {{ statusDialogMessage }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
            <v-btn color="primary" text @click="showStatusDialog = false">
            Close
            </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
