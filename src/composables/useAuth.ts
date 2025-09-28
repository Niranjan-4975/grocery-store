// composables/useAuth.ts
import { ref } from "vue";
import { useRouter } from "vue-router";


const users = [
  { username: "admin@abc.com", password: "admin123", role: "admin" },
  { username: "customer@abc.com", password: "cust123", role: "customer" },
];

// ✅ Singleton reactive state
const isAuthenticated = ref(false);
const user = ref<{ username: string; role: string } | null>(null);
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

  function login(username: string, password: string): { success: boolean; role?: string } {
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (!foundUser) return { success: false };

    token.value = "mock-token-" + foundUser.username;
    user.value = { username: foundUser.username, role: foundUser.role };
    isAuthenticated.value = true;

    localStorage.setItem("token", token.value);
    localStorage.setItem("user", JSON.stringify(user.value));

    return { success: true, role: foundUser.role };
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
