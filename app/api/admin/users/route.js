import { dbConnect } from "@/service/mongo";
import { User } from "@/model/user-model";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { replaceMongoIdInArray } from "@/lib/convertData";
import bcrypt from "bcryptjs";

export async function GET(request) {
  try {
    // Kiểm tra xác thực và quyền admin
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Không được phép truy cập" }, { status: 401 });
    }

    // Kết nối đến MongoDB
    await dbConnect();

    // Kiểm tra role của người dùng
    const user = await User.findOne({ email: session.user.email });
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền admin" }, { status: 403 });
    }

    // Lấy các tham số từ URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const skip = (page - 1) * limit;

    // Xây dựng query
    let query = {};

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Thêm điều kiện lọc theo role nếu có
    if (role) {
      query.role = role;
    }

    // Lấy tổng số người dùng theo điều kiện truy vấn (cho phân trang)
    const total = await User.countDocuments(query);

    // Lấy danh sách người dùng với phân trang
    const users = await User.find(query)
      .sort({ createdAt: -1 }) // Mới nhất đầu tiên
      .skip(skip)
      .limit(limit)
      .lean();

    // Tính toán tổng số trang
    const totalPages = Math.ceil(total / limit);

    // Trả về dữ liệu
    return NextResponse.json({
      users: replaceMongoIdInArray(users),
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return NextResponse.json(
      { error: "Lỗi server khi lấy danh sách người dùng" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Kiểm tra xác thực và quyền admin
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Không được phép truy cập" }, { status: 401 });
    }

    // Kết nối đến MongoDB
    await dbConnect();

    // Kiểm tra role của người dùng
    const adminUser = await User.findOne({ email: session.user.email });
    if (adminUser?.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền admin" }, { status: 403 });
    }

    // Lấy dữ liệu từ body request
    const data = await request.json();
    const { email, password, firstName, lastName } = data;

    // Validate dữ liệu đầu vào
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 400 }
      );
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName: firstName || "",
      lastName: lastName || "",
      role: "user",
      createdAt: new Date()
    });

    // Trả về người dùng đã tạo (không bao gồm mật khẩu)
    const userWithoutPassword = await User.findById(newUser._id).lean();
    
    return NextResponse.json({
      message: "Tạo người dùng thành công",
      user: replaceMongoIdInArray([userWithoutPassword])[0]
    });
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    return NextResponse.json(
      { error: "Lỗi server khi tạo người dùng" },
      { status: 500 }
    );
  }
} 