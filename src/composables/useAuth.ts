// composables/useAuth.ts
import { ref } from "vue";
import router from "../router";

const isAuthenticated = ref(false);
const token = ref<string | null>(null);
const loading = ref(true); // 🔹 add loading state

export function useAuth() {
  function initAuth() {
    const saved = localStorage.getItem("token");
    if (saved) {
      token.value = saved;
      isAuthenticated.value = true;
    } else {
      token.value = null;
      isAuthenticated.value = false;
    }
    loading.value = false;
  }

  function login(fakeToken: string) {
    localStorage.setItem("token", fakeToken);
    token.value = fakeToken;
    isAuthenticated.value = true;
  }

  async function logout() {
    localStorage.removeItem("token");
    token.value = null;
    isAuthenticated.value = false;
    await router.push("/login");
  }

  return { isAuthenticated, token, loading, initAuth, login, logout };
}
