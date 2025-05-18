import { NextResponse } from "next/server";
import { Category } from "@/model/category-model";
import { dbConnect } from "@/service/mongo";
import { revalidatePath } from "next/cache";
import { getCategories } from "@/queries/categories";

export async function GET(request) {
  try {
    // Kết nối đến database
    await dbConnect();

    // Lấy danh sách categories từ cơ sở dữ liệu
    const categories = await getCategories();

    // Trả về danh sách categories dưới dạng JSON
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách categories:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy danh sách categories" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    // Đảm bảo có dữ liệu hợp lệ từ request
    const data = await request.json().catch((err) => {
      console.error("Invalid JSON in request:", err);
      throw new Error("Dữ liệu không hợp lệ");
    });

    if (!data || !data.title) {
      return NextResponse.json(
        { error: "Tiêu đề danh mục là bắt buộc" },
        { status: 400 },
      );
    }

    // Kiểm tra xem danh mục đã tồn tại chưa
    const existingCategory = await Category.findOne({
      title: data.title,
    }).lean();
    if (existingCategory) {
      return NextResponse.json(
        { error: "Danh mục này đã tồn tại" },
        { status: 409 },
      );
    }

    // Chuẩn bị dữ liệu category với các trường cần thiết
    const categoryData = {
      title: data.title,
      description: data.description || "",
      thumbnail: data.thumbnail || "default-category.jpg",
    };

    // Tạo danh mục mới
    const newCategory = new Category(categoryData);
    const savedCategory = await newCategory.save();

    // Convert to plain object to avoid serialization issues
    const categoryObject = savedCategory.toObject();

    // Revalidate các đường dẫn liên quan
    revalidatePath("/dashboard/courses");

    return NextResponse.json(categoryObject, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi tạo danh mục" },
      { status: 500 },
    );
  }
}
