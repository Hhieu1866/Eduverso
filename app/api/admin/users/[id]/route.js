import { dbConnect } from "@/service/mongo";
import { User } from "@/model/user-model";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { replaceMongoIdInObject } from "@/lib/convertData";
import mongoose from "mongoose";

export async function PATCH(request, { params }) {
  try {
    // Đảm bảo params được await trước khi sử dụng
    const { id: userId } = params;

    // Kiểm tra userId có tồn tại và hợp lệ
    if (!userId) {
      return NextResponse.json(
        { error: "ID người dùng không được cung cấp" },
        { status: 400 },
      );
    }

    // Kiểm tra xem ID có phải là một MongoDB ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "ID người dùng không hợp lệ" },
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

    // Chỉ cho phép cập nhật một số trường nhất định (ở đây là role)
    const { role } = data;

    if (!role) {
      return NextResponse.json(
        { error: "Thiếu thông tin vai trò" },
        { status: 400 },
      );
    }

    // Kiểm tra vai trò hợp lệ - Cập nhật danh sách vai trò phù hợp với UI
    const validRoles = ["admin", "instructor", "student"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Vai trò không hợp lệ" },
        { status: 400 },
      );
    }

    // Tìm và cập nhật người dùng, sử dụng mongoose.Types.ObjectId để đảm bảo ID hợp lệ
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 },
      );
    }

    // Trả về người dùng đã cập nhật
    return NextResponse.json({
      message: "Cập nhật quyền thành công",
      user: replaceMongoIdInObject(updatedUser),
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật quyền người dùng:", error);
    return NextResponse.json(
      { error: "Lỗi server khi cập nhật quyền người dùng" },
      { status: 500 },
    );
  }
}

// Thêm phương thức DELETE để xử lý yêu cầu xóa người dùng
export async function DELETE(request, { params }) {
  try {
    // Đảm bảo params được await trước khi sử dụng
    const { id: userId } = params;

    // Kiểm tra userId có tồn tại và hợp lệ
    if (!userId) {
      return NextResponse.json(
        { error: "ID người dùng không được cung cấp" },
        { status: 400 },
      );
    }

    // Kiểm tra xem ID có phải là một MongoDB ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "ID người dùng không hợp lệ" },
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

    // Tìm và xóa người dùng, sử dụng mongoose.Types.ObjectId để đảm bảo ID hợp lệ
    const deletedUser = await User.findByIdAndDelete(userId).lean();

    if (!deletedUser) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 },
      );
    }

    // Trả về thông báo thành công
    return NextResponse.json({
      message: "Xóa người dùng thành công",
      user: replaceMongoIdInObject(deletedUser),
    });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    return NextResponse.json(
      { error: "Lỗi server khi xóa người dùng" },
      { status: 500 },
    );
  }
}
