import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Essay from "@/model/essay";
import { getStudentEssaySubmission } from "@/app/actions/essaySubmission";
import { EssaySubmissionForm } from "./_components/essay-submission-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function EssayPage({ params }) {
  await dbConnect();
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  const courseId = params.id;
  const essayId = params.essayId;

  // Lấy thông tin bài tự luận
  const essay = await Essay.findById(essayId);

  if (!essay) {
    return notFound();
  }

  // Lấy bài nộp của học viên nếu có
  const submission = await getStudentEssaySubmission(essayId, courseId);

  return (
    <div className="container max-w-5xl py-6">
      <div className="mb-4">
        <Link href={`/courses/${courseId}/lesson`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại khóa học
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <FileText className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">{essay.title}</h1>
      </div>

      <div className="mb-8 rounded-lg border bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold">Đề bài</h2>
        <div className="whitespace-pre-line">{essay.description}</div>

        {essay.fileUrl && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-medium">Tài liệu tham khảo</h3>
            <a
              href={essay.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              <FileText className="mr-2 h-4 w-4" />
              Xem tài liệu
            </a>
          </div>
        )}
      </div>

      <Separator className="my-6" />

      <div>
        <h2 className="mb-4 text-xl font-bold">
          {submission ? "Bài làm của bạn" : "Nộp bài làm của bạn"}
        </h2>
        <div className="rounded-lg border bg-card p-6">
          <EssaySubmissionForm
            initialData={submission}
            essayId={essayId}
            courseId={courseId}
          />
        </div>
      </div>
    </div>
  );
}
