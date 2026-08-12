import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("interiorrhub_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("interiorrhub_token");
      localStorage.removeItem("interiorrhub_refresh_token");
      // Redirect to login using window.location so it works outside React context if needed
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
