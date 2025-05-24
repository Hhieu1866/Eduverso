import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { put, del } from "@vercel/blob";
import { dbConnect } from "@/service/mongo"; // Nếu cần tương tác DB ở đây

// Helper function to generate a unique filename for Vercel Blob
const generateBlobName = (originalName, studentId, essayId) => {
  const timestamp = Date.now();
  const randomSuffix = uuidv4().slice(0, 8); // Thêm một chút ngẫu nhiên
  // Loại bỏ ký tự đặc biệt khỏi originalName để tránh lỗi URL
  const sanitizedOriginalName = originalName.replace(/[^a-zA-Z0-9_.-]/g, "_");
  return `essay-submissions/${studentId}/${essayId}/${timestamp}-${randomSuffix}-${sanitizedOriginalName}`;
};

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Không có quyền truy cập. Yêu cầu đăng nhập." },
        { status: 401 },
      );
    }
    // Giả sử studentId và essayId được gửi kèm trong formData hoặc query params
    // Trong ví dụ này, chúng ta sẽ cố gắng lấy từ formData
    const formData = await req.formData();
    const studentId = session.user.id; // Lấy studentId từ session là an toàn nhất
    const essayId = formData.get("essayId"); // Client cần gửi essayId

    if (!essayId) {
      return NextResponse.json(
        { error: "Thiếu thông tin essayId." },
        { status: 400 },
      );
    }

    const files = formData.getAll("files"); // "files" là key mà client gửi lên

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Không có file nào được tải lên." },
        { status: 400 },
      );
    }

    const uploadedFileObjects = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        console.warn("Một mục trong formData không phải là File:", file);
        continue; // Bỏ qua nếu không phải là file
      }

      const blobName = generateBlobName(file.name, studentId, essayId);

      const blob = await put(blobName, file, {
        access: "public", // Hoặc 'private' nếu cần signed URL để truy cập
        contentType: file.type,
        // cacheControlMaxAge: 31536000, // Cache 1 năm (tùy chọn)
        // addRandomSuffix: false, // Tắt nếu đã tự tạo suffix trong blobName
      });

      uploadedFileObjects.push({
        name: file.name,
        fileUrl: blob.url, // URL từ Vercel Blob
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(), // Lưu thời gian upload
      });
    }

    if (uploadedFileObjects.length === 0) {
      return NextResponse.json(
        { error: "Không có file hợp lệ nào được xử lý." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "Các file đã được tải lên thành công!",
        files: uploadedFileObjects,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Lỗi API upload bài làm tự luận:", error);
    // Check if the error is from Vercel Blob
    if (error.name === "BlobError") {
      return NextResponse.json(
        { error: `Lỗi từ Vercel Blob: ${error.message}` },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "Đã xảy ra lỗi trong quá trình upload file." },
      { status: 500 },
    );
  }
}
