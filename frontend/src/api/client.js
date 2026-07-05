import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Centralized error interceptor wrapper for easy debugging
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Network Error Matrix:",
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

export default API;
