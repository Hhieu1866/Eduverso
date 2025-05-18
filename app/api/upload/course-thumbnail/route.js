import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { Course } from "@/model/course-model";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/service/mongo";

export async function POST(request) {
  try {
    // Đảm bảo kết nối MongoDB trước khi thực hiện các thao tác với database
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get("file");
    const courseId = formData.get("courseId");

    if (!file || !courseId) {
      return NextResponse.json(
        { error: "Thiếu file hoặc courseId" },
        { status: 400 },
      );
    }

    // Kiểm tra kiểu file
    if (!file.type.includes("image/")) {
      return NextResponse.json(
        { error: "Vui lòng tải lên tệp hình ảnh" },
        { status: 400 },
      );
    }

    // Lấy thông tin khóa học
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: "Không tìm thấy khóa học" },
        { status: 404 },
      );
    }

    // Nếu khóa học đã có thumbnail từ Vercel Blob, xóa nó
    if (
      course.thumbnailUrl &&
      course.thumbnailUrl.includes("vercel-storage.com")
    ) {
      try {
        await del(course.thumbnailUrl);
      } catch (error) {
        console.error("Lỗi khi xóa thumbnail cũ:", error);
        // Tiếp tục xử lý ngay cả khi xóa thất bại
      }
    }

    // Tạo tên file độc đáo bằng cách thêm mã khóa học và timestamp
    const fileName = `thumbnail-${courseId}-${Date.now()}`;

    // Upload ảnh lên Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Cập nhật URL thumbnail trong database
    await Course.findByIdAndUpdate(courseId, {
      $set: { thumbnail: file.name, thumbnailUrl: blob.url },
    });

    // Revalidate các đường dẫn để hiển thị ảnh mới
    revalidatePath(`/dashboard/courses/${courseId}`);
    revalidatePath("/dashboard/courses");

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật ảnh thumbnail",
      url: blob.url,
    });
  } catch (error) {
    console.error("Lỗi khi xử lý tải lên thumbnail:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi xử lý tải lên" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    // Đảm bảo kết nối MongoDB trước khi thực hiện các thao tác với database
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Thiếu courseId" }, { status: 400 });
    }

    // Lấy thông tin khóa học
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: "Không tìm thấy khóa học" },
        { status: 404 },
      );
    }

    // Nếu khóa học đã có thumbnail từ Vercel Blob, xóa nó
    if (
      course.thumbnailUrl &&
      course.thumbnailUrl.includes("vercel-storage.com")
    ) {
      try {
        await del(course.thumbnailUrl);
      } catch (error) {
        console.error("Lỗi khi xóa thumbnail:", error);
        // Tiếp tục xử lý ngay cả khi xóa thất bại
      }
    }

    // Cập nhật URL thumbnail trong database thành null
    await Course.findByIdAndUpdate(courseId, {
      $set: { thumbnail: null, thumbnailUrl: null },
    });

    // Revalidate các đường dẫn để hiển thị ảnh mới
    revalidatePath(`/dashboard/courses/${courseId}`);
    revalidatePath("/dashboard/courses");

    return NextResponse.json({
      success: true,
      message: "Đã xóa ảnh thumbnail",
    });
  } catch (error) {
    console.error("Lỗi khi xóa thumbnail:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi xử lý xóa thumbnail" },
      { status: 500 },
    );
  }
}
