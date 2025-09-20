<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

// -- UI state
const isSignup = ref(false); // false => show Login panel (right), true => show Signup (left)
const router = useRouter();
// -- Responsive helper
const isMobile = ref(window.innerWidth <= 600);
function handleResize() {
  isMobile.value = window.innerWidth <= 600;
}
onMounted(() => window.addEventListener('resize', handleResize));
onUnmounted(() => window.removeEventListener('resize', handleResize));

// compute transform for topLayer depending on mode & screen size
const topTransform = computed(() => {
  if (isSignup.value) {
    // show left (signup) => translateX(0)
    return 'translateX(0)';
  } else {
    // show right (login)
    return isMobile.value ? 'translateX(-100%)' : 'translateX(-50%)';
  }
});

// ---------------- Login form state & validation ----------------
const loginUsername = ref('Niranjan@gmail.com');
const loginPassword = ref('password');
const loginErrors = ref<{ username?: string; password?: string }>({});

function validateLogin() {
  loginErrors.value = {};
  if (!loginUsername.value.trim()) loginErrors.value.username = 'Username is required';
  if (!loginPassword.value.trim()) loginErrors.value.password = 'Password is required';
  return Object.keys(loginErrors.value).length === 0;
}
function handleLogin() {
  if (!validateLogin()) return;
  // TODO: replace with real API call
  console.log('LOGIN OK', { username: loginUsername.value }, { password: loginPassword.value });
  router.push('/home');
}

// ---------------- Signup form state & validation ----------------
const signupEmail = ref('');
const signupUsername = ref('');
const signupPassword = ref('');
const signupConfirm = ref('');
const signupErrors = ref<{ email?: string; username?: string; password?: string; confirm?: string }>({});

function isEmailValid(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
function validateSignup() {
  signupErrors.value = {};
  if (!signupEmail.value.trim()) signupErrors.value.email = 'Email is required';
  else if (!isEmailValid(signupEmail.value.trim())) signupErrors.value.email = 'Invalid email';
  if (!signupUsername.value.trim()) signupErrors.value.username = 'Username is required';
  if (!signupPassword.value) signupErrors.value.password = 'Password is required';
  if (!signupConfirm.value) signupErrors.value.confirm = 'Confirm password';
  if (signupPassword.value && signupConfirm.value && signupPassword.value !== signupConfirm.value) {
    signupErrors.value.confirm = 'Passwords do not match';
  }
  return Object.keys(signupErrors.value).length === 0;
}
function handleSignup() {
  if (!validateSignup()) return;
  // TODO: replace with real API call
  console.log('SIGNUP OK', { email: signupEmail.value, username: signupUsername.value });
  if(signupEmail.value == "Niranjan@gmail.com" && signupPassword.value == "password") {
    isSignup.value = false;
    alert("Signup successful! Please log in.");
  }
}
// helpers to toggle
function showSignup() {
  isSignup.value = true;
}
function showLogin() {
  isSignup.value = false;
}
</script>
<template>
  <div class="auth-wrap">
    <!-- Background halves (behind the slider) -->
    <div class="back-left"></div>
    <div class="back-right"></div>
    <!-- Slider container -->
    <div class="slider">
      <div class="topLayer" :style="{ transform: topTransform }">
        <!-- Sign Up panel (left) -->
        <section class="panel left">
          <div class="content">
            <h2 class="title">Sign Up</h2>
            <form class="form" @submit.prevent="handleSignup" novalidate>
              <v-text-field
                v-model="signupEmail"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                outlined
                dense
                :error="Boolean(signupErrors.email)"
                :error-messages="signupErrors.email ? [signupErrors.email] : []"
              />
              <v-text-field
                v-model="signupUsername"
                label="Username"
                prepend-inner-icon="mdi-account"
                outlined
                dense
                :error="Boolean(signupErrors.username)"
                :error-messages="signupErrors.username ? [signupErrors.username] : []"
              />
              <v-text-field
                v-model="signupPassword"
                :type="'password'"
                label="Password"
                prepend-inner-icon="mdi-lock"
                outlined
                dense
                :error="Boolean(signupErrors.password)"
                :error-messages="signupErrors.password ? [signupErrors.password] : []"
              />
              <v-text-field
                v-model="signupConfirm"
                :type="'password'"
                label="Confirm Password"
                prepend-inner-icon="mdi-lock-check"
                outlined
                dense
                :error="Boolean(signupErrors.confirm)"
                :error-messages="signupErrors.confirm ? [signupErrors.confirm] : []"
              />
              <div class="form-actions">
                <v-btn type="submit" color="success" class="mr-3" block>Sign up</v-btn>
                <v-btn variant="text" class="off" @click.prevent="showLogin">Log In</v-btn>
              </div>
            </form>
          </div>
        </section>
        <!-- Login panel (right) -->
        <section class="panel right">
          <div class="content">
            <h2 class="title">Login</h2>
            <form class="form" @submit.prevent="handleLogin" novalidate>
              <v-text-field
                v-model="loginUsername"
                label="Username or Email"
                prepend-inner-icon="mdi-account"
                outlined
                dense
                :error="Boolean(loginErrors.username)"
                :error-messages="loginErrors.username ? [loginErrors.username] : []"
              />
              <v-text-field
                v-model="loginPassword"
                :type="'password'"
                label="Password"
                prepend-inner-icon="mdi-lock"
                outlined
                dense
                :error="Boolean(loginErrors.password)"
                :error-messages="loginErrors.password ? [loginErrors.password] : []"
              />
              <div class="form-actions">
                <v-btn type="submit" color="primary" class="mr-3" block>Log In</v-btn>
                <v-btn variant="text" class="off" @click.prevent="showSignup">Sign Up</v-btn>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container with single calm background */
.auth-wrap {
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);
  /* Example calm gradient; you can swap to solid if you like: 
     background: #f5f7fa; */
}

/* remove back-left and back-right completely */
.back-left,
.back-right {
  display: none;
}

/* Slider container */
.slider {
  position: relative;
  z-index: 2;
  width: min(880px, 96vw);
  max-width: 1000px;
  height: auto;
  overflow: hidden;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(23, 23, 23, 0.18);
  background: transparent;
}

/* The sliding layer (200% width) containing both panels */
.topLayer {
  width: 200%;
  display: flex;
  transition: transform 600ms cubic-bezier(.2,.9,.4,1);
  transform: translateX(-50%); /* default: show right panel (login) */
}

/* panels */
.panel {
  width: 50%;
  min-height: 420px;
  padding: 36px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
.left {
  background: rgba(44,48,52,0.95); /* dark left panel */
  color: #eaeaea; 
}
.right {
  background: #ffffff; /* light right panel */
  color: #212121;
  max-width: 50%; /* keep responsive */
}

/* Content inside each panel */
.content {
  width: 100%;
  max-width: 360px;
}
.title {
  margin: 0 0 16px;
  font-weight: 300;
  font-size: 2rem;
  text-align: left;
}
.left .title {
  color: #03A9F4;
}
.right .title {
  color: #673AB7;
}

/* forms */
.form {
  margin-top: 8px;
}
.v-text-field {
  margin-bottom: 12px;
}

/* form actions row */
.form-actions {
  display: flex;
  align-items: center;
  margin-top: 12px;
  gap: 12px;
}

/* off button style */
.off {
  color: inherit;
  text-transform: uppercase;
}

/* responsive */
@media (max-width: 600px) {
  .panel {
    width: 100%;
    padding: 28px;
  }
}
</style>

