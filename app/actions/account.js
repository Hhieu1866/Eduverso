"use server";

import { User } from "@/model/user-model";
import { validatePassword } from "@/queries/users";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/service/mongo";
import mongoose from "mongoose";

export async function updateUserInfo(email, updatedData) {
  try {
    console.log("Bắt đầu cập nhật thông tin người dùng:", {
      email,
      updatedData,
    });

    // Đảm bảo kết nối MongoDB trước khi thực hiện thao tác
    const conn = await dbConnect();
    console.log(
      "Trạng thái kết nối MongoDB:",
      mongoose.connection.readyState,
      "Giải thích: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting",
    );

    // Tìm user trước khi cập nhật
    const user = await User.findOne({ email });
    console.log(
      "Thông tin người dùng trước khi cập nhật:",
      user ? "Đã tìm thấy" : "Không tìm thấy",
    );

    if (!user) {
      throw new Error("Không tìm thấy người dùng với email này");
    }

    // Thay đổi từ findOneAndUpdate sang updateOne giống như cách làm trong API upload avatar
    const result = await User.updateOne({ email }, { $set: updatedData });

    console.log("Kết quả cập nhật:", result);

    if (result.modifiedCount === 0) {
      console.log("Không có thay đổi nào được cập nhật");
    }

    revalidatePath("/account");
    return { success: true, message: "Đã cập nhật thông tin người dùng" };
  } catch (error) {
    console.error("Lỗi chi tiết khi cập nhật thông tin người dùng:", error);
    console.error("Stack trace:", error.stack);
    return {
      success: false,
      message: error.message || "Không thể cập nhật thông tin người dùng",
    };
  }
}
// End method

export async function changePassword(email, oldPassword, newPassword) {
  try {
    console.log("Bắt đầu thay đổi mật khẩu cho email:", email);

    // Đảm bảo kết nối MongoDB trước khi thực hiện thao tác
    const conn = await dbConnect();
    console.log(
      "Trạng thái kết nối MongoDB:",
      mongoose.connection.readyState,
      "Giải thích: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting",
    );

    const isMatch = await validatePassword(email, oldPassword);
    console.log(
      "Kết quả kiểm tra mật khẩu cũ:",
      isMatch ? "Chính xác" : "Không chính xác",
    );

    if (!isMatch) {
      return { success: false, message: "Mật khẩu hiện tại không chính xác" };
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 5);
    console.log("Đã hash mật khẩu mới");

    // Thay đổi từ findOneAndUpdate sang updateOne
    const result = await User.updateOne(
      { email },
      { $set: { password: hashedPassword } },
    );

    console.log("Kết quả cập nhật mật khẩu:", result);

    if (result.modifiedCount === 0) {
      console.log("Không có thay đổi nào được cập nhật cho mật khẩu");
      return { success: false, message: "Không thể cập nhật mật khẩu" };
    }

    revalidatePath("/account");
    return { success: true, message: "Đã cập nhật mật khẩu thành công" };
  } catch (error) {
    console.error("Lỗi chi tiết khi đổi mật khẩu:", error);
    console.error("Stack trace:", error.stack);
    return {
      success: false,
      message: error.message || "Không thể đổi mật khẩu",
    };
  }
}
