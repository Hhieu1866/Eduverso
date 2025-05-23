import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { Lesson } from "@/model/lesson.model";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/service/mongo";

export async function POST(request) {
  try {
    // Đảm bảo kết nối MongoDB trước khi thực hiện các thao tác với database
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get("file");
    const lessonId = formData.get("lessonId");
    const courseId = formData.get("courseId");
    const moduleId = formData.get("moduleId");

    if (!file || !lessonId || !courseId || !moduleId) {
      return NextResponse.json(
        { error: "Thiếu thông tin cần thiết" },
        { status: 400 },
      );
    }

    // Lấy thông tin bài học
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json(
        { error: "Không tìm thấy bài học" },
        { status: 404 },
      );
    }

    // Tạo tên file độc đáo bằng cách thêm mã bài học, tên file gốc và timestamp
    const fileName = `document-${lessonId}-${file.name.replace(/\s+/g, "-")}-${Date.now()}`;

    // Lấy loại file
    const fileType = file.type;
    // Lấy kích thước file (byte)
    const fileSize = file.size;

    // Upload file lên Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Chuẩn bị thông tin tài liệu mới
    const newDocument = {
      name: file.name,
      fileUrl: blob.url,
      fileType,
      fileSize,
      uploadedAt: new Date(),
    };

    // Cập nhật thông tin tài liệu trong lesson
    if (!lesson.documents) {
      lesson.documents = []; // Khởi tạo mảng nếu chưa có
    }

    // Thêm tài liệu mới vào mảng documents
    lesson.documents.push(newDocument);

    // Lưu thay đổi
    await lesson.save();

    // Revalidate đường dẫn
    revalidatePath(`/dashboard/courses/${courseId}/modules/${moduleId}`);
    revalidatePath(`/courses/${courseId}/lesson/${lessonId}`);

    return NextResponse.json({
      success: true,
      message: "Đã tải lên tài liệu",
      document: newDocument,
    });
  } catch (error) {
    console.error("Lỗi khi xử lý tải lên tài liệu:", error);
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
    const lessonId = searchParams.get("lessonId");
    const documentUrl = searchParams.get("documentUrl");
    const courseId = searchParams.get("courseId");
    const moduleId = searchParams.get("moduleId");

    if (!lessonId || !documentUrl || !courseId || !moduleId) {
      return NextResponse.json(
        { error: "Thiếu thông tin cần thiết" },
        { status: 400 },
      );
    }

    // Lấy thông tin bài học
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json(
        { error: "Không tìm thấy bài học" },
        { status: 404 },
      );
    }

    // Tìm tài liệu trong mảng documents
    const documentIndex = lesson.documents.findIndex(
      (doc) => doc.fileUrl === documentUrl,
    );

    if (documentIndex === -1) {
      return NextResponse.json(
        { error: "Không tìm thấy tài liệu" },
        { status: 404 },
      );
    }

    // Xóa file từ Vercel Blob
    if (documentUrl && documentUrl.includes("vercel-storage.com")) {
      try {
        await del(documentUrl);
      } catch (error) {
        console.error("Lỗi khi xóa tài liệu từ Blob:", error);
        // Tiếp tục xử lý ngay cả khi xóa thất bại
      }
    }

    // Xóa tài liệu khỏi mảng
    lesson.documents.splice(documentIndex, 1);

    // Lưu thay đổi
    await lesson.save();

    // Revalidate đường dẫn
    revalidatePath(`/dashboard/courses/${courseId}/modules/${moduleId}`);
    revalidatePath(`/courses/${courseId}/lesson/${lessonId}`);

    return NextResponse.json({
      success: true,
      message: "Đã xóa tài liệu",
    });
  } catch (error) {
    console.error("Lỗi khi xóa tài liệu:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi xử lý xóa tài liệu" },
      { status: 500 },
    );
  }
}
