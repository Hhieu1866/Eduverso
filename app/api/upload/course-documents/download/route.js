import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileUrl = searchParams.get("url");
    const fileName = searchParams.get("name");

    if (!fileUrl) {
      return NextResponse.json({ error: "URL không hợp lệ" }, { status: 400 });
    }

    // Lấy blob từ Vercel
    const blob = await fetch(fileUrl);
    console.log(
      "Status:",
      blob.status,
      "Content-Type:",
      blob.headers.get("content-type"),
    );

    if (!blob.ok) {
      return NextResponse.json(
        { error: "Không thể tải tài liệu" },
        { status: 404 },
      );
    }

    const fileData = await blob.arrayBuffer();
    let contentType =
      blob.headers.get("content-type") || "application/octet-stream";
    // Nếu là file docx thì ép content-type chuẩn
    if (fileName && fileName.endsWith(".docx")) {
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    // Tạo response với headers để force download
    const response = new NextResponse(fileData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName || "download")}`,
        "Content-Length": String(fileData.byteLength),
      },
    });

    return response;
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tải tài liệu" },
      { status: 500 },
    );
  }
}
