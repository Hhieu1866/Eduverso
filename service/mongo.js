import mongoose from "mongoose";

const MONGODB_CONNECTION_TIMEOUT = 30000; // Tăng timeout lên 30 giây
const MAX_RETRIES = 3; // Số lần thử lại kết nối tối đa
const RETRY_INTERVAL = 1000; // Khoảng thời gian giữa các lần thử lại (ms)

export async function dbConnect() {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Kiểm tra trạng thái kết nối hiện tại
      if (mongoose.connection.readyState === 1) {
        // Đã kết nối và hoạt động bình thường
        return mongoose.connection;
      } else if (mongoose.connection.readyState !== 0) {
        // readyState 2: đang kết nối, 3: đang ngắt kết nối
        console.log(
          `MongoDB đang trong trạng thái chuyển tiếp (${mongoose.connection.readyState}), đợi hoàn tất...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      // Nếu đang có kết nối cũ đã bị đóng (readyState 0) sau khi restart server
      if (
        mongoose.connection.readyState === 0 &&
        mongoose.connection._hasOpened
      ) {
        // Reset kết nối để tránh lỗi khi restart server
        console.log("Kết nối cũ đã bị đóng, thiết lập lại kết nối...");
        mongoose.connection.removeAllListeners();
        mongoose.connections.forEach((conn) => {
          conn.removeAllListeners();
        });
        // Đảm bảo đóng kết nối cũ nếu còn mở
        try {
          await mongoose.connection.close();
        } catch (e) {
          // Bỏ qua lỗi khi đóng kết nối không thành công
        }
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

      // Kết nối mới
      console.log(
        `Đang kết nối MongoDB... (lần thử ${retries + 1}/${MAX_RETRIES})`,
      );

      const conn = await mongoose.connect(
        String(process.env.MONGODB_CONNECTION_STRING),
        connectionOptions,
      );

      // Thêm sự kiện để theo dõi kết nối
      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected");
      });

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
