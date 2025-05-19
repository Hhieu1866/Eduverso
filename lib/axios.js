import axios from "axios";
import { toast } from "sonner";

// Tạo một instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Tăng lên 60 giây để tránh các yêu cầu bị timeout
});

// Interceptor xử lý request
axiosInstance.interceptors.request.use(
  (config) => {
    // Thêm cấu hình retry
    config.retry = config.retry || 3;
    config.retryDelay = config.retryDelay || 1000;
    config.currentRetryAttempt = config.currentRetryAttempt || 0;

    // Log thông tin request để debug (chỉ khi không phải là retry)
    if (config.currentRetryAttempt === 0) {
      console.log(
        `Axios Request: ${config.method?.toUpperCase() || "GET"} ${config.url}`,
        {
          params: config.params,
          data: config.data,
        },
      );
    }

    return config;
  },
  (error) => {
    console.error("Lỗi trong quá trình tạo request:", error);
    return Promise.reject(error);
  },
);

// Interceptor xử lý response
axiosInstance.interceptors.response.use(
  (response) => {
    // Log thông tin response thành công
    console.log(
      `Axios Response: ${response.status} từ ${response.config.url}`,
      {
        data: response.data,
      },
    );

    // Trả về dữ liệu từ response
    return response.data;
  },
  async (error) => {
    const originalConfig = error.config;

    // Không thử lại cho các requests POST/PUT/DELETE hoặc có response status khác 5xx/timeout
    const shouldRetry =
      originalConfig &&
      originalConfig.retry > 0 &&
      originalConfig.currentRetryAttempt < originalConfig.retry &&
      (!error.response || // Network error
        error.response.status >= 500 || // Server error
        error.code === "ECONNABORTED" || // Timeout
        error.code === "ERR_NETWORK"); // Network error

    if (shouldRetry) {
      originalConfig.currentRetryAttempt += 1;
      const retryDelay =
        originalConfig.retryDelay * originalConfig.currentRetryAttempt;

      console.log(
        `Retry request attempt ${originalConfig.currentRetryAttempt}/${originalConfig.retry} sau ${retryDelay}ms: ${originalConfig.url}`,
      );

      // Đợi trước khi thử lại
      await new Promise((resolve) => setTimeout(resolve, retryDelay));

      // Thử lại request
      return axiosInstance(originalConfig);
    }

    // Log lỗi chi tiết
    const errorDetails = {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: originalConfig?.url,
      method: originalConfig?.method,
    };

    // Log lỗi với thông tin chi tiết
    console.error("Axios Error:", errorDetails);

    // Không hiển thị toast lỗi tự động để tránh xung đột
    // Để component tự xử lý hiển thị lỗi

    return Promise.reject(error);
  },
);

export default axiosInstance;
