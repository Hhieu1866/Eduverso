"use server";
import { signIn } from "@/auth";
import { dbConnect } from "@/service/mongo";
import { cookies } from "next/headers";
import { User } from "@/model/user-model";

export async function ceredntialLogin(formData) {
  try {
    // Lấy thông tin từ form
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return {
        error: "Vui lòng nhập đầy đủ email và mật khẩu",
      };
    }

    // Đảm bảo kết nối đến MongoDB trước khi signIn
    await dbConnect();

    // Thực hiện đăng nhập
    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Xử lý trường hợp không có response
    if (!response) {
      return {
        error: "Đã xảy ra lỗi trong quá trình đăng nhập",
      };
    }

    // Xử lý trường hợp có lỗi
    if (response.error) {
      // Map các thông báo lỗi thành thông báo thân thiện hơn
      if (
        response.error === "CredentialsSignin" ||
        response.error.includes("password") ||
        response.error.includes("mật khẩu")
      ) {
        return { error: "Email hoặc mật khẩu không chính xác" };
      }

      if (
        response.error.includes("User not found") ||
        response.error.includes("không tìm thấy") ||
        response.error.includes("not exist")
      ) {
        return { error: "Tài khoản không tồn tại" };
      }

      // Trường hợp lỗi khác
      return {
        error: response.error || "Đăng nhập thất bại, vui lòng thử lại",
      };
    }

    // Lưu lại thời gian đăng nhập
    (await cookies()).set("last_login", new Date().toISOString());

    // Lấy thông tin user để trả về role
    const user = await User.findOne({ email }).lean();

    // Trả về thành công với thông tin user đầy đủ
    return {
      ...response,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    // Xử lý các lỗi không mong muốn
    return {
      error: "Đăng nhập thất bại. Vui lòng thử lại sau.",
    };
  }
}
