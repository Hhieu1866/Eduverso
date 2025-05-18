import { dbConnect } from "@/service/mongo";
import { User } from "@/model/user-model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email không được cung cấp" },
        { status: 400 }
      );
    }

    // Kết nối đến MongoDB
    await dbConnect();

    // Tìm user theo email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Trả về role của người dùng
    return NextResponse.json({
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra role người dùng:", error);
    return NextResponse.json(
      { error: "Lỗi server khi kiểm tra role" },
      { status: 500 }
    );
  }
} 