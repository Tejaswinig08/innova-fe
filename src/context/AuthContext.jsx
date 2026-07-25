import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token and fetch user profile
  useEffect(() => {
    const token = localStorage.getItem("civiora-token");
    if (token) {
      authAPI
        .getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token expired or invalid — clear it
          localStorage.removeItem("civiora-token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem("civiora-token", data.token);
      setUser(data);
      return { ok: true, role: data.role };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async function register({ firstName, lastName, society, email, password, role, flat }) {
    try {
      const data = await authAPI.register({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        role,
        flat,
        society,
        title: role === "admin" ? "Society Secretary" : role === "security" ? "Security Guard" : undefined,
      });
      localStorage.setItem("civiora-token", data.token);
      setUser(data);
      return { ok: true, role: data.role };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  function logout() {
    localStorage.removeItem("civiora-token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
