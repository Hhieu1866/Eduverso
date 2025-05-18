import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Lấy path cần revalidate từ query params
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { message: "Missing path parameter" },
        { status: 400 },
      );
    }

    // Revalidate đường dẫn được yêu cầu
    revalidatePath(path);

    // Revalidate thêm một số đường dẫn quan trọng có thể cần cập nhật
    // Điều này đảm bảo sidebar và các thành phần khác cùng được cập nhật
    if (path.includes("/courses/")) {
      // Nếu đang ở trang khóa học, revalidate cả trang danh sách khóa học
      revalidatePath("/courses");
      revalidatePath("/dashboard");
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path,
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { message: "Error revalidating", error: error.message },
      { status: 500 },
    );
  }
}
