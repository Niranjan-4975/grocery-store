// composables/useAuth.ts
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

// ✅ Singleton reactive state
const isAuthenticated = ref(false);
const user = ref<{ username: string; email: string; role: string } | null>(null);
const token = ref<string | null>(null);
const loading = ref(true);

export function useAuth() {
  const router = useRouter();
  function initAuth() {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
      isAuthenticated.value = true;
    } else {
      token.value = null;
      user.value = null;
      isAuthenticated.value = false;
    }

    loading.value = false;
  }

async function login(username: string, password: string): Promise<{ success: boolean; role?: string; error?:string;}> {
  try{
    //Call Spring Boot Endpoint
    const response = await axios.post('http://localhost:8080/api/auth/login', {
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
    console.error("Login API Error:", err);
      // Return failure so the UI can show an alert
      return { success: false, error: err.response?.data?.message || "Login failed" };
  }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    token.value = null;
    user.value = null;
    isAuthenticated.value = false;
    // ✅ central navigation after logout
    router.push("/login").catch(() => {});
  }

  return { isAuthenticated, user, token, loading, initAuth, login, logout };
}
