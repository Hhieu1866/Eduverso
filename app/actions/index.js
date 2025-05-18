"use server";
import { signIn } from "@/auth";
import { dbConnect } from "@/service/mongo";

export async function ceredntialLogin(formData) {
  try {
    // Đảm bảo kết nối đến MongoDB trước
    await dbConnect();

    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return {
        error: "Vui lòng nhập đầy đủ email và mật khẩu",
      };
    }

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!response) {
      return {
        error: "Đã xảy ra lỗi trong quá trình đăng nhập",
      };
    }

    if (response.error) {
      // Xử lý các loại lỗi khác nhau
      if (response.error === "CredentialsSignin") {
        return {
          error: "Email hoặc mật khẩu không chính xác",
        };
      }

      if (response.error.includes("password")) {
        return {
          error: "Mật khẩu không chính xác",
        };
      }

      if (
        response.error.includes("User not found") ||
        response.error.includes("không tìm thấy")
      ) {
        return {
          error: "Tài khoản không tồn tại",
        };
      }

      return {
        error: response.error || "Đăng nhập thất bại, vui lòng thử lại",
      };
    }

    return response;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);

    // Kiểm tra thông báo lỗi cụ thể
    const errorMessage = error.message || "";

    if (
      errorMessage.includes("password") ||
      errorMessage.includes("mật khẩu")
    ) {
      return {
        error: "Mật khẩu không chính xác",
      };
    }

    if (
      errorMessage.includes("User not found") ||
      errorMessage.includes("không tìm thấy") ||
      errorMessage.includes("not exist")
    ) {
      return {
        error: "Tài khoản không tồn tại",
      };
    }

    return {
      error:
        "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập của bạn.",
    };
  }
}
