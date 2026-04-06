import axios from "axios";

const resolveApiBaseUrl = () => {
  const fallback = "https://backend-projectmanagementsystem.onrender.com/api";
  const raw = (process.env.REACT_APP_API_BASE_URL || fallback).trim();
  const normalized = raw.replace(/\/+$/, "");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
