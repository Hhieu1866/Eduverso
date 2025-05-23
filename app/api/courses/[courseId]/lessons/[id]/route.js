import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { Lesson } from "@/model/lesson.model";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const lessonId = params.id;

    if (!lessonId) {
      return NextResponse.json({ error: "Thiếu ID bài học" }, { status: 400 });
    }

    const lesson = await Lesson.findById(lessonId).lean();

    if (!lesson) {
      return NextResponse.json(
        { error: "Không tìm thấy bài học" },
        { status: 404 },
      );
    }

    // Chuyển _id thành id và trả về
    const result = {
      ...lesson,
      id: lesson._id.toString(),
      _id: lesson._id.toString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy thông tin bài học" },
      { status: 500 },
    );
  }
}
