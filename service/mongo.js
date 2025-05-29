import mongoose from "mongoose";

// Biến global để tránh kết nối lại trong các lần gọi serverless function
const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING;
const MONGODB_CONNECTION_TIMEOUT = 20000; // 20 giây
const MAX_RETRIES = 2; // Giảm số lần retry
const RETRY_INTERVAL = 500; // Giảm thời gian giữa các lần retry (ms)

// Đối tượng lưu trữ kết nối
let cachedConnection = null;

export async function dbConnect() {
  // Nếu đã có kết nối hoạt động, sử dụng lại
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Kiểm tra connection đang trong quá trình kết nối
  if (mongoose.connection.readyState === 2) {
    // Đang kết nối, đợi một chút
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
  }

  // Kết nối mới
  try {
    // Cấu hình kết nối
    const connectionOptions = {
      serverSelectionTimeoutMS: MONGODB_CONNECTION_TIMEOUT,
      socketTimeoutMS: MONGODB_CONNECTION_TIMEOUT,
      connectTimeoutMS: MONGODB_CONNECTION_TIMEOUT,
      maxPoolSize: 10,
      minPoolSize: 1,
    };

    // Thực hiện kết nối
    const conn = await mongoose.connect(MONGODB_URI, connectionOptions);
    cachedConnection = conn;

    return conn;
  } catch (error) {
    // Xử lý lỗi kết nối
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    throw new Error(`Không thể kết nối đến MongoDB: ${error.message}`);
  }
}
