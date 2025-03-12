import axios from 'axios';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000,
});

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const secretKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_SECRET_KEY;
//     if (secretKey) {
//       config.headers['Authorization'] = `Bearer ${secretKey}`;
//     } else {
//       console.warn("⚠️ Warning: Missing Flutterwave Secret Key!", secretKey);
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

axiosInstance.interceptors.response.use(
    (response) => response.data, 
    (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Unauthorized! Please check your API key.");
        } else if (error.response.status === 403) {
          toast.error("Forbidden! You don’t have permission.");
        } else {
          toast.error(error.response.data.message || "Something went wrong!");
        }
      } else if (error.request) {
        toast.error("Network error! Please try again.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      
      return Promise.reject(error);
    }
  );
  

export default axiosInstance;