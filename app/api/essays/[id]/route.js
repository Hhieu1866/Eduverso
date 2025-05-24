import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Essay from "@/model/essay";
import { dbConnect } from "@/service/mongo";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const essay = await Essay.findById(id).lean();

    if (!essay) {
      return NextResponse.json(
        { error: "Không tìm thấy bài tự luận" },
        { status: 404 },
      );
    }

    // Chuyển đổi _id sang string để tránh lỗi serialization
    const responseData = {
      ...essay,
      _id: essay._id.toString(),
      id: essay._id.toString(),
      createdAt: essay.createdAt ? new Date(essay.createdAt).toISOString() : "",
      updatedAt: essay.updatedAt ? new Date(essay.updatedAt).toISOString() : "",
      createdBy: essay.createdBy ? essay.createdBy.toString() : null,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching essay:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy dữ liệu bài tự luận" },
      { status: 500 },
    );
  }
}
