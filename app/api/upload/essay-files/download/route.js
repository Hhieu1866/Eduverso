import { NextResponse } from "next/server";
import { auth } from "@/auth";
import path from "path";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const fileUrl = url.searchParams.get("url");
    const fileName = url.searchParams.get("name") || "document.pdf";

    if (!fileUrl) {
      return new Response("Missing file URL", { status: 400 });
    }

    try {
      // Tải file từ URL (Vercel Blob hoặc bất kỳ URL nào)
      const fileResponse = await fetch(fileUrl);

      if (!fileResponse.ok) {
        return new Response(
          `Failed to fetch file: ${fileResponse.statusText}`,
          {
            status: fileResponse.status,
          },
        );
      }

      // Lấy dữ liệu file
      const fileData = await fileResponse.arrayBuffer();

      // Xác định Content-Type từ URL hoặc tên file
      const ext = path.extname(fileName).toLowerCase();
      let contentType =
        fileResponse.headers.get("content-type") || "application/octet-stream";

      // Map các định dạng file phổ biến nếu content-type chưa được set đúng
      const contentTypeMap = {
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls": "application/vnd.ms-excel",
        ".xlsx":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".ppt": "application/vnd.ms-powerpoint",
        ".pptx":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".txt": "text/plain",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
      };

      if (ext in contentTypeMap) {
        contentType = contentTypeMap[ext];
      }

      // Tạo tên file để tải xuống từ URL hoặc tham số name
      const downloadName = fileName || path.basename(fileUrl);

      // Trả về file với header phù hợp cho việc tải xuống
      return new Response(fileData, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadName)}"`,
          "Content-Length": fileData.byteLength.toString(),
        },
      });
    } catch (error) {
      console.error("Error fetching file:", error);
      return new Response(`File fetch error: ${error.message}`, {
        status: 500,
      });
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    return new Response(`Internal Server Error: ${error.message}`, {
      status: 500,
    });
  }
}
