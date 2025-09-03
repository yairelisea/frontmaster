import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

// Headers para pruebas
api.interceptors.request.use((config) => {
  const uid = import.meta.env.VITE_FAKE_USER_ID;
  const asAdmin = String(import.meta.env.VITE_ADMIN_HEADER) === "true";
  if (uid) config.headers["x-user-id"] = uid;
  if (asAdmin) config.headers["x-admin"] = "true";
  return config;
});

