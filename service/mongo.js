/**
 * Tiện ích quản lý kết nối MongoDB
 * Đảm bảo một kết nối duy nhất và tái sử dụng trong môi trường serverless
 */
import mongoose from "mongoose";

// Cấu hình kết nối
const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING;
const CONNECTION_OPTIONS = {
  serverSelectionTimeoutMS: 20000, // 20 giây
  socketTimeoutMS: 45000, // 45 giây
  connectTimeoutMS: 15000, // 15 giây
  maxPoolSize: 10, // Tối đa 10 kết nối đồng thời
  minPoolSize: 2, // Duy trì ít nhất 2 kết nối
  maxIdleTimeMS: 60000, // Đóng kết nối sau 60 giây không hoạt động
  family: 4, // Ưu tiên IPv4
  autoIndex: process.env.NODE_ENV !== "production", // Tắt auto index trong production
};

// Biến global cho kết nối
let isConnecting = false;
let connectionPromise = null;

/**
 * Kết nối đến MongoDB và trả về kết nối
 * @returns {Promise<mongoose.Connection>} Kết nối MongoDB
 */
export async function dbConnect() {
  // Nếu đã kết nối, sử dụng lại
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Nếu đang có yêu cầu kết nối, đợi nó hoàn thành
  if (isConnecting && connectionPromise) {
    try {
      await connectionPromise;
      return mongoose.connection;
    } catch (error) {
      // Nếu yêu cầu kết nối đang đợi bị lỗi, tiếp tục và thử kết nối mới
      isConnecting = false;
      connectionPromise = null;
    }
  }

  try {
    // Đánh dấu đang kết nối
    isConnecting = true;

    // Tạo promise kết nối mới
    connectionPromise = mongoose.connect(MONGODB_URI, CONNECTION_OPTIONS);

    // Đợi kết nối hoàn thành
    await connectionPromise;

    // Xử lý sự kiện để log khi kết nối bị ngắt
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Will reconnect on next request.");
      isConnecting = false;
      connectionPromise = null;
    });

    // Đánh dấu đã kết nối thành công
    isConnecting = false;

    return mongoose.connection;
  } catch (error) {
    // Đánh dấu kết nối thất bại
    isConnecting = false;
    connectionPromise = null;

    // Log lỗi cụ thể để dễ debug
    console.error(`MongoDB connection error: ${error.message}`);

    if (error.name === "MongoServerSelectionError") {
      console.error(
        "MongoDB server selection timeout. Check server availability or connection string.",
      );
    }

    // Ném lỗi để component gọi xử lý
    throw new Error(`Không thể kết nối đến MongoDB: ${error.message}`);
  }
}
