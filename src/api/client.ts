import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  withCredentials: true, // ok with CORS_ALLOW_CREDENTIALS=True
});

// read token from localStorage (if using DRF TokenAuth)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Token ${token}`;
  // optional: send country for pricing
  config.headers["X-Country-Code"] = "IN";
  return config;
});

export default api;
