// composables/useAuth.ts
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../axios";

// ✅ Singleton reactive state
const isAuthenticated = ref(false);
const user = ref<{ username: string; email: string; role: string } | null>(null);
const token = ref<string | null>(null);
const loading = ref(true);

export function useAuth() {
  const router = useRouter();
  async function initAuth() {
    // --- FIX: Skip validation if state is already loaded from the LOGIN function ---
    if (isAuthenticated.value && token.value) {
        // If the state is already authenticated by the 'login' function, 
        // we trust it and stop the expensive validation check.
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
        const response = await api.get('/auth/check');
        // 3. SUCCESS: If the backend returns 200 OK, the token is valid and active.
        // The backend response body contains { email: "...", roles: ["..."] }
        // We ensure isAuthenticated is true and update user state with fresh data
        isAuthenticated.value = true;
        // Optional: Update user state with fresh roles from the backend response
        user.value = {
            ...user.value,
            username: response.data.email,
            email: response.data.email,
            role: response.data.roles[0].authority // Assuming single primary role, or adjust as needed
        };
      } catch (error) {
        // 4. FAILURE: Backend returned 401 (Expired/Invalid) or a Network Error (Server down)
        console.warn("Token validation failed or server is offline. Clearing session.");
        // Clear all local storage data, forcing a login screen redirect
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        token.value = null;
        user.value = null;
        isAuthenticated.value = false;
      } finally{
        loading.value = false;
      }
  }

async function login(username: string, password: string): Promise<{ success: boolean; role?: string; error?:string;}> {
  try{
    //Call Spring Boot Endpoint
    const response = await api.post('/auth/login', {
      email: username,
      password: password
    });
    // Extract data)
    const data = response.data;
    // Update State
    token.value = data.token;
    user.value = { username: data.userName, email: data.email, role: data.role };
    isAuthenticated.value = true;
    // Save to Local Storage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user",JSON.stringify(user.value));

    return {success: true, role: data.role};
  } catch (err: any){
      // Priority 1: Check if the custom error message is in the response data
      const customMessage = err.response?.data?.message;
      // Priority 2: Fallback to the generic error message
      const fallbackMessage = err.message;
      return { 
        success: false, 
        // Return the custom message if available, otherwise fallback
        error: customMessage || fallbackMessage || "Login failed" 
      };
  }
  }

  function logout() {
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
