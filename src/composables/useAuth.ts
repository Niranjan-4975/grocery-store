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
        // Optional: Update user state with fresh roles from the backend response
        user.value = {
            ...user.value,
            username: response.email,
            email: response.email,
            role: response.roles
        };
      } catch (error) {
        console.warn("Token validation failed or server is offline. Clearing session.");
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
    user.value = { username: data.userName, email: data.email, role: data.role };
    isAuthenticated.value = true;
    // Save to Local Storage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user",JSON.stringify(user.value));
    return {success: true, role: user.value.role};
  } catch (err: any){
      return {success: false};
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
