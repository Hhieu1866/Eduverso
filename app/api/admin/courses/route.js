import { dbConnect } from "@/service/mongo";
import { Course } from "@/model/course-model";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { replaceMongoIdInArray } from "@/lib/convertData";
import mongoose from "mongoose";

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
    const user = await mongoose.models.User.findOne({
      email: session.user.email,
    });
    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền admin" },
        { status: 403 },
      );
    }

    // Lấy các tham số từ URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // Xây dựng query
    let query = {};

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { subtitle: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Thêm điều kiện lọc theo status nếu có
    if (
      status &&
      ["draft", "pending", "approved", "rejected"].includes(status)
    ) {
      query.status = status;
    }

    // Lấy tổng số khóa học theo điều kiện truy vấn (cho phân trang)
    const total = await Course.countDocuments(query);

    // Lấy danh sách khóa học với phân trang
    const courses = await Course.find(query)
      .populate("instructor", "firstName lastName email profilePicture")
      .populate("category", "title")
      .populate({
        path: "modules",
        model: "Module",
        populate: {
          path: "lessonIds",
          model: "Lesson",
        },
      })
      .populate({
        path: "quizSet",
        model: "Quizset",
        populate: {
          path: "quizIds",
          model: "Quiz",
        },
      })
      .sort({ modifiedOn: -1 }) // Mới nhất đầu tiên
      .skip(skip)
      .limit(limit)
      .lean();

    // Tính toán tổng số trang
    const totalPages = Math.ceil(total / limit);

    // Trả về dữ liệu
    return NextResponse.json({
      courses: replaceMongoIdInArray(courses),
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    return NextResponse.json(
      { error: "Lỗi server khi lấy danh sách khóa học" },
      { status: 500 },
    );
  }
}
