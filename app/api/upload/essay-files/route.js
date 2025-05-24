import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import Essay from "@/model/essay";
import { dbConnect } from "@/service/mongo";
import fs from "fs/promises";
import { put, del } from "@vercel/blob";

// Kiểm tra thư mục tồn tại, nếu không thì tạo mới
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 401 },
      );
    }

    // Kiểm tra vai trò
    if (session.user.role !== "instructor") {
      return NextResponse.json(
        { error: "Chỉ giảng viên mới có quyền upload tài liệu" },
        { status: 403 },
      );
    }

    await dbConnect();

    const formData = await req.formData();
    const file = formData.get("file");
    const essayId = formData.get("essayId");

    if (!file || !essayId) {
      return NextResponse.json(
        { error: "Thiếu file hoặc essayId" },
        { status: 400 },
      );
    }

    // Kiểm tra kích thước file (tối đa 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File quá lớn, vui lòng chọn file nhỏ hơn 10MB" },
        { status: 400 },
      );
    }

    // Kiểm tra định dạng file
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Định dạng file không được hỗ trợ" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Lấy thông tin bài tự luận
    const essay = await Essay.findById(essayId);
    if (!essay) {
      return NextResponse.json(
        { error: "Không tìm thấy bài tự luận" },
        { status: 404 },
      );
    }

    if (essay.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa bài tự luận này" },
        { status: 403 },
      );
    }

    // Tạo tên file giống lesson editor
    const fileName = `document-${essayId}-${file.name.replace(/\s+/g, "-")}-${Date.now()}`;
    const fileType = file.type;
    const fileSize = file.size;

    // Upload file lên Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Chuẩn bị object document
    const newDocument = {
      name: file.name,
      fileUrl: blob.url,
      fileType,
      fileSize,
      uploadedAt: new Date(),
    };

    // Khởi tạo mảng documents nếu chưa có
    if (!essay.documents) essay.documents = [];

    // Thêm file mới vào mảng documents (không xóa file cũ)
    essay.documents.push(newDocument);
    await essay.save();

    return NextResponse.json({
      success: true,
      message: "Đã tải lên tài liệu",
      document: newDocument,
    });
  } catch (error) {
    console.error("Lỗi khi upload file:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi upload file" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 401 },
      );
    }

    // Kiểm tra vai trò
    if (session.user.role !== "instructor") {
      return NextResponse.json(
        { error: "Chỉ giảng viên mới có quyền xóa tài liệu" },
        { status: 403 },
      );
    }

    await dbConnect();

    const url = new URL(req.url);
    const essayId = url.searchParams.get("essayId");
    const documentUrl = url.searchParams.get("documentUrl");

    if (!essayId || !documentUrl) {
      return NextResponse.json(
        { error: "Thiếu thông tin essayId hoặc documentUrl" },
        { status: 400 },
      );
    }

    // Tìm essay
    const essay = await Essay.findById(essayId);
    if (!essay) {
      return NextResponse.json(
        { error: "Không tìm thấy bài tự luận" },
        { status: 404 },
      );
    }

    // Kiểm tra quyền
    if (essay.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa tài liệu này" },
        { status: 403 },
      );
    }

    // Xóa file trên blob nếu có
    if (documentUrl && documentUrl.includes("vercel-storage.com")) {
      try {
        await del(documentUrl);
      } catch {}
    }

    // Xóa document khỏi mảng
    essay.documents = (essay.documents || []).filter(
      (doc) => doc.fileUrl !== documentUrl,
    );
    await essay.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi khi xóa file:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xóa file" },
      { status: 500 },
    );
  }
}
