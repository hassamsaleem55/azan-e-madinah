import axios from "axios";

const url = "http://localhost:8000/api";
// const url = "https://azanemadinah.com/api";

const axiosInstance = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token and active role
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    const activeRoleId = localStorage.getItem("active_role_id");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (activeRoleId) {
      config.headers['X-Active-Role'] = activeRoleId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("active_role_id");
      localStorage.removeItem("active_role");
      
      // Redirect to login page
      // window.location.href = "/admin-portal/signin";
    }
    
    // Handle errors globally
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
