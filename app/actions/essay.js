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

    const newEssay = await Essay.create({
      ...values,
      createdBy: session.user.id,
    });

    revalidatePath("/dashboard/essays");
    const plainEssay = newEssay.toObject();
    return {
      ...plainEssay,
      _id: plainEssay._id.toString(),
      id: plainEssay._id.toString(),
      createdAt: plainEssay.createdAt
        ? new Date(plainEssay.createdAt).toISOString()
        : "",
      updatedAt: plainEssay.updatedAt
        ? new Date(plainEssay.updatedAt).toISOString()
        : "",
      createdBy: plainEssay.createdBy ? plainEssay.createdBy.toString() : null,
      documents: Array.isArray(plainEssay.documents)
        ? plainEssay.documents.map((doc) => ({
            ...doc,
            _id: doc._id ? doc._id.toString() : undefined,
            uploadedAt: doc.uploadedAt
              ? new Date(doc.uploadedAt).toISOString()
              : "",
          }))
        : [],
    };
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
    const updatedEssayObject = essay.toObject();
    return {
      ...updatedEssayObject,
      _id: updatedEssayObject._id.toString(),
      id: updatedEssayObject._id.toString(),
      createdAt: updatedEssayObject.createdAt
        ? new Date(updatedEssayObject.createdAt).toISOString()
        : "",
      updatedAt: updatedEssayObject.updatedAt
        ? new Date(updatedEssayObject.updatedAt).toISOString()
        : "",
      createdBy: updatedEssayObject.createdBy
        ? updatedEssayObject.createdBy.toString()
        : null,
      documents: Array.isArray(updatedEssayObject.documents)
        ? updatedEssayObject.documents.map((doc) => ({
            ...doc,
            _id: doc._id ? doc._id.toString() : undefined,
            uploadedAt: doc.uploadedAt
              ? new Date(doc.uploadedAt).toISOString()
              : "",
          }))
        : [],
    };
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
    const deletedEssayObject = essay.toObject();
    return {
      ...deletedEssayObject,
      _id: deletedEssayObject._id.toString(),
      id: deletedEssayObject._id.toString(),
      createdAt: deletedEssayObject.createdAt
        ? new Date(deletedEssayObject.createdAt).toISOString()
        : "",
      updatedAt: deletedEssayObject.updatedAt
        ? new Date(deletedEssayObject.updatedAt).toISOString()
        : "",
      createdBy: deletedEssayObject.createdBy
        ? deletedEssayObject.createdBy.toString()
        : null,
      documents: Array.isArray(deletedEssayObject.documents)
        ? deletedEssayObject.documents.map((doc) => ({
            ...doc,
            _id: doc._id ? doc._id.toString() : undefined,
            uploadedAt: doc.uploadedAt
              ? new Date(doc.uploadedAt).toISOString()
              : "",
          }))
        : [],
    };
  } catch (error) {
    console.error("Lỗi khi xóa bài tự luận:", error);
    throw new Error("Đã xảy ra lỗi khi xóa bài tự luận");
  }
}
