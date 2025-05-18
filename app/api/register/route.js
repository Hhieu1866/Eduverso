import { dbConnect } from "@/service/mongo";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/model/user-model";

export const POST = async (request) => {
  try {
    const { firstName, lastName, email, password, userRole } =
      await request.json();

    // Validate dữ liệu đầu vào
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        {
          message: "Vui lòng điền đầy đủ thông tin",
        },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          message: "Email không hợp lệ",
        },
        { status: 400 },
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Mật khẩu phải có ít nhất 8 ký tự",
        },
        { status: 400 },
      );
    }

    // Kiểm tra mật khẩu có đủ độ phức tạp
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password,
    );

    if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
      return NextResponse.json(
        {
          message:
            "Mật khẩu phải bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt",
        },
        { status: 400 },
      );
    }

    // Kết nối database
    await dbConnect();

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          message: "Email đã được sử dụng",
        },
        { status: 400 },
      );
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới (mặc định là 'student')
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: userRole || "student",
    };

    // Lưu vào database
    await User.create(newUser);

    return NextResponse.json(
      {
        message: "Tạo tài khoản thành công",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      {
        message: "Có lỗi xảy ra, vui lòng thử lại sau",
      },
      { status: 500 },
    );
  }
};
