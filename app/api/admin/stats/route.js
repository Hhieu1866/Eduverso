import { dbConnect } from "@/service/mongo";
import { User } from "@/model/user-model";
import { Course } from "@/model/course-model";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import mongoose from "mongoose";

/**
 * Kiểm tra collection có tồn tại trong database hay không
 * @param {string} collectionName - Tên collection cần kiểm tra
 * @returns {Promise<boolean>} Kết quả kiểm tra
 */
async function collectionExists(collectionName) {
  try {
    return !!mongoose.connection.collections[collectionName];
  } catch (error) {
    return false;
  }
}

/**
 * API endpoint trả về thống kê cho dashboard admin
 */
export async function GET(request) {
  try {
    // Kiểm tra xác thực và quyền admin
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Không được phép truy cập" },
        { status: 401 },
      );
    }

    // Kết nối đến MongoDB
    await dbConnect();

    // Kiểm tra role của người dùng
    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền admin" },
        { status: 403 },
      );
    }

    // Tính toán các số liệu thống kê
    const stats = {
      totalUsers: 0,
      totalInstructors: 0,
      totalStudents: 0,
      totalCourses: 0,
      totalWatches: 0,
      participationRate: 0,
    };

    // Lấy thống kê người dùng
    if (await collectionExists("users")) {
      try {
        stats.totalUsers = await User.countDocuments();
        stats.totalInstructors = await User.countDocuments({
          role: "instructor",
        });
        stats.totalStudents = await User.countDocuments({ role: "user" });
      } catch (error) {
        // Tiếp tục với dữ liệu mặc định nếu có lỗi
      }
    }

    // Lấy thống kê khóa học
    if (await collectionExists("courses")) {
      try {
        stats.totalCourses = await Course.countDocuments();
      } catch (error) {
        // Tiếp tục với dữ liệu mặc định nếu có lỗi
      }
    }

    // Lấy thống kê lượt xem
    if (await collectionExists("watches")) {
      try {
        const Watch =
          mongoose.models.Watch ||
          mongoose.model("Watch", new mongoose.Schema({}));
        stats.totalWatches = await Watch.countDocuments();
      } catch (error) {
        // Tiếp tục với dữ liệu mặc định nếu có lỗi
      }
    }

    // Tính toán tỷ lệ tham gia
    if (
      (await collectionExists("enrollments")) &&
      stats.totalUsers > 0 &&
      stats.totalCourses > 0
    ) {
      try {
        const Enrollment =
          mongoose.models.Enrollment ||
          mongoose.model("Enrollment", new mongoose.Schema({}));
        const totalEnrollments = await Enrollment.countDocuments();

        stats.participationRate = Math.min(
          100,
          Math.round(
            (totalEnrollments / (stats.totalUsers * stats.totalCourses)) * 100,
          ),
        );
      } catch (error) {
        stats.participationRate = 0;
      }
    }

    // Trả về dữ liệu thống kê
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: "Lỗi server khi lấy thống kê" },
      { status: 500 },
    );
  }
}
