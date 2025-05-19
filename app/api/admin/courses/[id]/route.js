import { dbConnect } from "@/service/mongo";
import { Course } from "@/model/course-model";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { replaceMongoIdInObject } from "@/lib/convertData";
import mongoose from "mongoose";
import { User } from "@/model/user-model";

// Cập nhật trạng thái duyệt của khóa học
export async function PATCH(request, { params }) {
  try {
    // Lấy ID khóa học từ params
    const { id: courseId } = params;

    // Kiểm tra courseId có tồn tại và hợp lệ
    if (!courseId) {
      return NextResponse.json(
        { error: "ID khóa học không được cung cấp" },
        { status: 400 },
      );
    }

    // Kiểm tra xem ID có phải là một MongoDB ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: "ID khóa học không hợp lệ" },
        { status: 400 },
      );
    }

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

    // Kiểm tra role của người dùng gửi request
    const adminUser = await User.findOne({ email: session.user.email });
    if (adminUser?.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền admin" },
        { status: 403 },
      );
    }

    // Lấy dữ liệu từ body request
    const data = await request.json();

    // Kiểm tra action để xác định loại thao tác
    const { action, reason } = data;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Hành động không hợp lệ" },
        { status: 400 },
      );
    }

    // Kiểm tra khóa học có tồn tại không
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: "Không tìm thấy khóa học" },
        { status: 404 },
      );
    }

    // Thực hiện cập nhật trạng thái
    let updateData = {};

    if (action === "approve") {
      updateData = {
        status: "approved",
        rejectionReason: "",
        modifiedOn: new Date(),
      };
    } else if (action === "reject") {
      // Khi từ chối, yêu cầu lý do
      if (!reason) {
        return NextResponse.json(
          { error: "Cần cung cấp lý do từ chối" },
          { status: 400 },
        );
      }

      updateData = {
        status: "rejected",
        rejectionReason: reason,
        modifiedOn: new Date(),
      };
    }

    // Cập nhật khóa học
    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
    }).lean();

    // Trả về dữ liệu cập nhật
    return NextResponse.json({
      message:
        action === "approve" ? "Đã duyệt khóa học" : "Đã từ chối khóa học",
      course: replaceMongoIdInObject(updatedCourse),
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái khóa học:", error);
    return NextResponse.json(
      { error: "Lỗi server khi cập nhật trạng thái khóa học" },
      { status: 500 },
    );
  }
}
