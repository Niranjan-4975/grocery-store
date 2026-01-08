// composables/useAuth.ts
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../axios";
import { jwtDecode } from "jwt-decode";
import { useNotify } from "./useNotify";


// ✅ Singleton reactive state
const isAuthenticated = ref(false);
const user = ref<{ username: string; email: string; role: string } | null>(null);
const token = ref<string | null>(null);
const loading = ref(true);
const sessionTimeout = ref<any>(null);

export function useAuth() {
  const router = useRouter();
  const { notify } = useNotify();

  //1. Token refresh function
  async function refreshToken() {
    try {
      const data: any = await api.post('/auth/refresh');
      token.value = data.token;
      user.value = { username: data.userName, email: data.email, role: data.role };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user.value));
      setupTokenTimer(data.token);
      notify.success("Session extended successfully!");
    } catch (err: any) {
      notify.error("Failed to extend session. Please log in again.");
      logout();
    }
  }

  //2. Setup token expiration timer
  function setupTokenTimer(jwtToken: string) {
    if (sessionTimeout.value) clearTimeout(sessionTimeout.value);
    try {
      const decoded: any = jwtDecode(jwtToken);
      const expiryTime = decoded.exp * 1000;
      const timeLeft = expiryTime - Date.now();
      const role = String(user.value?.role);

      if (role.includes("ADMIN")) {
        const warningBuffer = 2 * 60 * 1000; // 5 minutes
        if (timeLeft > warningBuffer) {
          sessionTimeout.value = setTimeout( async () => {
            const extend = await notify.confirm(
              "Session Expiring",
              "Your session is about to expire in 2 minutes. Do you want to extend it?"
            );
            if (extend) {
              await refreshToken();
            } else {
              logout();
            }
          }, timeLeft - warningBuffer);
        } else{
          // Agar 2 min se kam bacha hai login karte waqt
          logout();
        }
      }
      else {
        if (timeLeft > 0) {
          sessionTimeout.value = setTimeout(() => {
            logout();
          }, timeLeft);
        } else {
          logout();
        }
      }
    } catch (err) {
      console.warn("Failed to decode token or set up timer.");
    }
  }

  async function initAuth() {
    if (isAuthenticated.value && token.value) {
        loading.value = false;
        return; 
    }
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    // Start by assuming the user is not authenticated
    isAuthenticated.value = false;
    loading.value = true;
    // If no token is saved, we are definitely not authenticated
    if (!savedToken || !savedUser) {
        token.value = null;
        user.value = null;
        loading.value = false;
        return;
    }
    // 1. Set local state immediately using saved data
    token.value = savedToken;
    user.value = JSON.parse(savedUser);
    try {
        // 2. Call the backend's fast validation endpoint
        const response: any = await api.get('/auth/check');
        // 3. SUCCESS: If the backend returns 200 OK, the token is valid and active.
        // The backend response body contains { email: "...", roles: ["..."] }
        // We ensure isAuthenticated is true and update user state with fresh data
        isAuthenticated.value = true;
        setupTokenTimer(savedToken);
        // Optional: Update user state with fresh roles from the backend response
        user.value = {
            ...user.value,
            username: response.email,
            email: response.email,
            role: response.roles
        };
    } catch (error) {
      logout();
    } finally{
      loading.value = false;
    }
  }

  async function login(username: string, password: string): Promise<{ success: boolean; role?: string; error?:string;}> {
    try{
    //Call Spring Boot Endpoint
      const data: any = await api.post('/auth/login', {
        email: username,
        password: password
      });
    // Update State
      token.value = data.token;
      const role = data.role;
      user.value = { username: data.userName, email: data.email, role: role};
      isAuthenticated.value = true;
    // Save to Local Storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",JSON.stringify(user.value));
      setupTokenTimer(data.token);
      return {success: true, role: role};
    } catch (err: any){
      console.error(err);
      return {success: false};
    }
  }

  function logout() {
    if (sessionTimeout.value) clearTimeout(sessionTimeout.value);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("app_theme");
    token.value = null;
    user.value = null;
    isAuthenticated.value = false;
    // ✅ central navigation after logout
    router.push("/login").catch(() => {});
  }

  return { isAuthenticated, user, token, loading, initAuth, login, logout };
}
