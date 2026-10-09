import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../api.js";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export const home = (u) => (u.role === "admin" ? "/admin/dashboard" : "/student/home");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      const timeout = window.setTimeout(() => setLoading(false), 650);
      return () => window.clearTimeout(timeout);
    }
    api("/auth/me").then(setUser).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  // path: "/auth/login" | "/auth/student-login" | "/auth/signup"
  const authenticate = async (path, body, remember = true) => {
    const { token, user } = await api(path, { method: "POST", body });
    setToken(token, remember);
    setUser(user);
    return user;
  };
  const logout = () => { setToken(null); setUser(null); };

  return <Ctx.Provider value={{ user, loading, authenticate, logout }}>{children}</Ctx.Provider>;
}
