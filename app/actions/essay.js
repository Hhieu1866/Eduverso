"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import Essay from "@/model/essay";
import { dbConnect } from "@/service/mongo";

// Tạo bài tự luận mới
export async function createEssay(values) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== "instructor") {
      throw new Error("Không có quyền thực hiện");
    }

    const essay = await Essay.create({
      ...values,
      createdBy: session.user.id,
    });

    revalidatePath("/dashboard/essays");
    return essay;
  } catch (error) {
    console.error("Lỗi khi tạo bài tự luận:", error);
    throw new Error("Đã xảy ra lỗi khi tạo bài tự luận");
  }
}

// Lấy danh sách bài tự luận
export async function getEssays() {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== "instructor") {
      throw new Error("Không có quyền truy cập");
    }

    const essays = await Essay.find({
      createdBy: session.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Chuẩn hóa dữ liệu
    return essays.map((essay) => ({
      ...essay,
      _id: essay._id.toString(),
      id: essay._id.toString(),
      createdAt: essay.createdAt ? new Date(essay.createdAt).toISOString() : "",
      updatedAt: essay.updatedAt ? new Date(essay.updatedAt).toISOString() : "",
      createdBy: essay.createdBy ? essay.createdBy.toString() : null,
      documents: Array.isArray(essay.documents) ? essay.documents : [],
    }));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài tự luận:", error);
    throw new Error("Đã xảy ra lỗi khi lấy danh sách bài tự luận");
  }
}

// Cập nhật bài tự luận
export async function updateEssay(essayId, values) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== "instructor") {
      throw new Error("Không có quyền thực hiện");
    }

    const essay = await Essay.findOneAndUpdate(
      { _id: essayId, createdBy: session.user.id },
      { $set: values },
      { new: true },
    );

    if (!essay) {
      throw new Error("Không tìm thấy bài tự luận");
    }

    revalidatePath("/dashboard/essays");
    revalidatePath(`/dashboard/essays/${essayId}`);
    return essay;
  } catch (error) {
    console.error("Lỗi khi cập nhật bài tự luận:", error);
    throw new Error("Đã xảy ra lỗi khi cập nhật bài tự luận");
  }
}

// Xóa bài tự luận
export async function deleteEssay(essayId) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== "instructor") {
      throw new Error("Không có quyền thực hiện");
    }

    const essay = await Essay.findOneAndDelete({
      _id: essayId,
      createdBy: session.user.id,
    });

    if (!essay) {
      throw new Error("Không tìm thấy bài tự luận");
    }

    revalidatePath("/dashboard/essays");
    return essay;
  } catch (error) {
    console.error("Lỗi khi xóa bài tự luận:", error);
    throw new Error("Đã xảy ra lỗi khi xóa bài tự luận");
  }
}
