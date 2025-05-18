import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/service/mongo";
import { Enrollment } from "@/model/enrollment-model";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    // Kiểm tra xác thực người dùng
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để đăng ký khóa học" },
        { status: 401 },
      );
    }

    console.log("Session user data:", {
      id: session.user.id,
      email: session.user.email,
    });

    // Lấy thông tin khóa học từ request body
    const { courseId, checkOnly } = await request.json();
    if (!courseId) {
      return NextResponse.json(
        { error: "Thiếu thông tin khóa học" },
        { status: 400 },
      );
    }

    console.log(
      "Yêu cầu cho khóa học:",
      courseId,
      "checkOnly:",
      checkOnly ? true : false,
    );

    // Kết nối đến MongoDB
    await dbConnect();
    console.log("MongoDB đã kết nối, bắt đầu đăng ký khóa học");

    // Kiểm tra xem courseId có đúng định dạng ObjectId không
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.error("courseId không hợp lệ:", courseId);
      return NextResponse.json(
        { error: "ID khóa học không hợp lệ" },
        { status: 400 },
      );
    }

    // Tạo ObjectId từ chuỗi ID
    const courseObjectId = new mongoose.Types.ObjectId(courseId);
    const studentObjectId = new mongoose.Types.ObjectId(session.user.id);

    console.log("ObjectIds:", {
      course: courseObjectId.toString(),
      student: studentObjectId.toString(),
    });

    // Kiểm tra xem người dùng đã đăng ký khóa học này chưa
    const existingEnrollment = await Enrollment.findOne({
      course: courseObjectId,
      student: studentObjectId,
    });

    console.log(
      "Kiểm tra đăng ký hiện có:",
      existingEnrollment ? true : false,
    );

    // Nếu chỉ là yêu cầu kiểm tra, trả về kết quả không tạo đăng ký mới
    if (checkOnly) {
      return NextResponse.json(
        {
          success: true,
          isEnrolled: !!existingEnrollment,
          message: existingEnrollment
            ? "Đã đăng ký khóa học này"
            : "Chưa đăng ký khóa học này",
          enrollment: existingEnrollment,
        },
        { status: 200 },
      );
    }

    if (existingEnrollment) {
      return NextResponse.json(
        {
          success: true,
          isEnrolled: true,
          message: "Bạn đã đăng ký khóa học này rồi",
          enrollment: existingEnrollment,
        },
        { status: 200 },
      );
    }

    // Tạo đăng ký mới
    const newEnrollment = new Enrollment({
      course: courseObjectId,
      student: studentObjectId,
      method: "free", // Tất cả khóa học đều miễn phí
      enrollment_date: new Date(),
      status: "not-started",
    });

    // Lưu đăng ký
    const savedEnrollment = await newEnrollment.save();
    console.log("Đăng ký khóa học thành công, dữ liệu đã lưu:", {
      id: savedEnrollment._id.toString(),
      course: savedEnrollment.course.toString(),
      student: savedEnrollment.student.toString(),
      date: savedEnrollment.enrollment_date,
    });

    return NextResponse.json(
      {
        success: true,
        isEnrolled: true,
        message: "Đăng ký khóa học thành công",
        enrollment: savedEnrollment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Lỗi chi tiết khi đăng ký khóa học:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Có lỗi xảy ra khi đăng ký khóa học",
      },
      { status: 500 },
    );
  }
}
