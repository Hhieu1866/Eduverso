"use server";

import { EssayForm } from "../../_components/essay-form";
import { dbConnect } from "@/service/mongo";
import Essay from "@/model/essay";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

export default async function EditEssayPage({ params }) {
  await dbConnect();
  const session = await auth();

  if (!session?.user || session.user.role !== "instructor") {
    return notFound();
  }

  const essay = await Essay.findOne({
    _id: params.id,
    createdBy: session.user.id,
  }).lean();

  if (!essay) {
    return notFound();
  }

  // Đơn giản hóa dữ liệu thành plain object, tương tự như lesson editor
  const essayData = {
    _id: essay._id.toString(),
    id: essay._id.toString(),
    title: essay.title || "",
    description: essay.description || "",
    fileUrl: essay.fileUrl || "",
    fileSize: typeof essay.fileSize === "number" ? essay.fileSize : 0,
    createdAt: essay.createdAt ? new Date(essay.createdAt).toISOString() : "",
    updatedAt: essay.updatedAt ? new Date(essay.updatedAt).toISOString() : "",
    documents: Array.isArray(essay.documents) ? essay.documents : [],
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Chỉnh sửa bài tự luận</h1>
      <div className="rounded-md border bg-card p-6">
        <EssayForm initialData={essayData} />
      </div>
    </div>
  );
}
