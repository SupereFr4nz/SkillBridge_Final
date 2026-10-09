import { useCallback, useEffect, useState } from "react";

// Same-origin "/api" by default. Set VITE_API_URL (e.g. https://your-api.onrender.com/api) if the API lives elsewhere.
const BASE = import.meta.env.VITE_API_URL || "/api";
export const getToken = () => localStorage.getItem("sb_token") || sessionStorage.getItem("sb_token");
// "Remember me" keeps the login after the browser closes; otherwise it lasts for the tab only.
export const setToken = (t, remember = true) => {
  localStorage.removeItem("sb_token");
  sessionStorage.removeItem("sb_token");
  if (t) (remember ? localStorage : sessionStorage).setItem("sb_token", t);
};

export async function api(path, { method = "GET", body } = {}) {
  const token = getToken();
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token && !path.startsWith("/auth/")) {
    setToken(null);
    window.location.assign("/login");
  }
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

// const { data, reload } = useFetch("/students");  -> `data` is [] (or `initial`) until loaded
export function useFetch(path, initial = []) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState("");
  const reload = useCallback(
    () => api(path).then((d) => { setData(d); setError(""); }).catch((e) => setError(e.message)),
    [path]
  );
  useEffect(() => { reload(); }, [reload]);
  return { data, error, reload };
}
