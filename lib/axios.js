/**
 * Cấu hình và tiện ích Axios được tùy chỉnh cho ứng dụng
 */
import axios from "axios";

// Kiểm tra môi trường để chỉ hiển thị log trong development
const isDev = process.env.NODE_ENV === "development";

// Hàm tiện ích để log có điều kiện dựa trên môi trường
const conditionalLog = (type, message, data) => {
  if (!isDev) return;

  switch (type) {
    case "error":
      console.error(message, data);
      break;
    case "warn":
      console.warn(message, data);
      break;
    default:
      console.log(message, data);
  }
};

/**
 * Tạo một instance Axios tùy chỉnh với cấu hình mặc định
 */
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 giây
});

// Interceptor xử lý request
axiosInstance.interceptors.request.use(
  (config) => {
    conditionalLog(
      "info",
      `Axios Request: ${config.method?.toUpperCase()} ${config.url}`,
      {
        params: config.params,
        data: config.data,
      },
    );
    return config;
  },
  (error) => {
    conditionalLog("error", "Lỗi trong quá trình tạo request:", error);
    return Promise.reject(error);
  },
);

// Interceptor xử lý response
axiosInstance.interceptors.response.use(
  (response) => {
    conditionalLog(
      "info",
      `Axios Response: ${response.status} từ ${response.config.url}`,
      {
        data: response.data,
      },
    );
    return response.data;
  },
  (error) => {
    conditionalLog("error", "Axios Error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    return Promise.reject(error);
  },
);

export default axiosInstance;
