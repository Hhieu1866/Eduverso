import mongoose from "mongoose";

const MONGODB_CONNECTION_TIMEOUT = 30000; // Tăng timeout lên 30 giây
const MAX_RETRIES = 3; // Số lần thử lại kết nối tối đa
const RETRY_INTERVAL = 1000; // Khoảng thời gian giữa các lần thử lại (ms)

export async function dbConnect() {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Kiểm tra xem đã kết nối chưa
      if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
      }

      // Cấu hình kết nối với timeout cao hơn
      const connectionOptions = {
        serverSelectionTimeoutMS: MONGODB_CONNECTION_TIMEOUT,
        socketTimeoutMS: MONGODB_CONNECTION_TIMEOUT,
        connectTimeoutMS: MONGODB_CONNECTION_TIMEOUT,
        heartbeatFrequencyMS: 10000, // Tăng tần suất heartbeat
        maxPoolSize: 10, // Giới hạn số lượng kết nối
        minPoolSize: 1, // Duy trì ít nhất 1 kết nối
      };

      // Kết nối mới nếu chưa kết nối
      console.log(
        `Đang kết nối MongoDB... (lần thử ${retries + 1}/${MAX_RETRIES})`,
      );
      const conn = await mongoose.connect(
        String(process.env.MONGODB_CONNECTION_STRING),
        connectionOptions,
      );
      console.log("Kết nối MongoDB thành công!");
      return conn;
    } catch (error) {
      retries++;
      console.error(
        `Lỗi kết nối MongoDB (lần thử ${retries}/${MAX_RETRIES}):`,
        error.message,
      );

      if (retries >= MAX_RETRIES) {
        console.error("Đã hết số lần thử lại. Stack trace:", error.stack);
        throw new Error(
          `Không thể kết nối đến MongoDB sau ${MAX_RETRIES} lần thử: ${error.message}`,
        );
      }

      // Đợi một khoảng thời gian trước khi thử lại
      console.log(`Đợi ${RETRY_INTERVAL}ms trước khi thử lại...`);
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_INTERVAL * retries),
      );
    }
  }
}
