import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import EssaySubmission from "@/model/essaySubmission";
import Essay from "@/model/essay";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Download, Paperclip } from "lucide-react";
import { GradingForm } from "./_components/grading-form";
import { Badge } from "@/components/ui/badge";

// Helper function to get status badge (can be moved to a shared util if used elsewhere)
const getStatusBadge = (status, grade) => {
  if (status === "pending")
    return (
      <Badge className="bg-yellow-500 hover:bg-yellow-500/90">Chờ duyệt</Badge>
    );
  if (status === "graded")
    return (
      <Badge className="bg-green-600 hover:bg-green-600/90">
        Đã chấm ({grade}/10)
      </Badge>
    );
  if (status === "returned")
    return (
      <Badge className="bg-blue-600 hover:bg-blue-600/90">Đã trả lại</Badge>
    );
  if (status === "approved")
    return (
      <Badge className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-600/90">
        Đã duyệt
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge className="flex items-center gap-1 bg-red-600 hover:bg-red-600/90">
        Bị từ chối
      </Badge>
    );
  return <Badge variant="outline">Không rõ</Badge>;
};

export default async function GradeSubmissionPage({ params }) {
  await dbConnect();
  const session = await auth();

  if (!session?.user || session.user.role !== "instructor") {
    return notFound();
  }

  const submission = await EssaySubmission.findById(params.id)
    .populate("studentId", "name email")
    .populate("essayId", "title") // Chỉ cần title của essay
    .populate("courseId", "title") // Chỉ cần title của course
    .lean(); // Sử dụng lean() để lấy plain JavaScript object

  if (!submission) {
    return notFound();
  }

  // Kiểm tra quyền chấm điểm (giảng viên phải là người tạo bài tự luận)
  // Vì đã .lean(), essayId là một ObjectId, cần query lại Essay model
  const essay = await Essay.findById(submission.essayId).lean();

  if (!essay || essay.createdBy.toString() !== session.user.id) {
    // Nếu không tìm thấy essay hoặc giảng viên không phải người tạo
    return notFound();
  }

  // Dữ liệu đã là plain object nhờ .lean(), không cần JSON.parse(JSON.stringify) nữa
  // Chỉ cần chuyển đổi ObjectId sang string nếu cần thiết cho component con
  const submissionDataForForm = {
    ...submission,
    _id: submission._id.toString(),
    essayId: submission.essayId.toString(),
    studentId: submission.studentId._id.toString(),
    courseId: submission.courseId._id.toString(),
  };

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/essays/${submission.essayId?._id || submission.essayId}/submissions`}
          >
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold md:text-2xl">
            Chấm điểm: {submission.essayId.title}
          </h1>
        </div>
        {getStatusBadge(submission.status, submission.grade)}
      </div>

      <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
        <h2 class="mb-4 border-b pb-2 text-lg font-semibold">
          Thông tin bài nộp
        </h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">
              Khóa học
            </h3>
            <p className="text-base font-semibold text-primary">
              {submission.courseId.title}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">
              Học viên
            </h3>
            <p className="text-base font-medium">{submission.studentId.name}</p>
            <p className="text-sm text-muted-foreground">
              {submission.studentId.email}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground">
              Ngày nộp
            </h3>
            <p className="text-base font-medium">
              {new Date(submission.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {submission.gradedAt && (
            <div>
              <h3 className="text-xs font-medium uppercase text-muted-foreground">
                Ngày chấm
              </h3>
              <p className="text-base font-medium">
                {new Date(submission.gradedAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>

        {submission.submittedFiles && submission.submittedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              File bài làm đã nộp:
            </h3>
            <ul className="space-y-2">
              {submission.submittedFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-md border bg-muted/50 p-3 transition-all hover:bg-muted/80"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Paperclip className="h-5 w-5 flex-shrink-0 text-primary" />
                    <span
                      className="truncate text-sm font-medium"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                    {file.fileSize && (
                      <span className="text-xs text-muted-foreground">
                        ({(file.fileSize / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    )}
                  </div>
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.name} // Trình duyệt sẽ cố gắng tải với tên này
                  >
                    <Button variant="outline" size="sm">
                      <Download className="mr-1.5 h-4 w-4" />
                      Tải xuống
                    </Button>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(!submission.submittedFiles ||
          submission.submittedFiles.length === 0) && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              File bài làm đã nộp:
            </h3>
            <div className="text-sm italic text-muted-foreground">
              Không có tài liệu nào được gửi.
            </div>
          </div>
        )}

        {submission.content && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Nội dung bài làm (nếu có):
            </h3>
            <div className="prose prose-sm max-w-none whitespace-pre-line rounded-md border bg-muted/50 p-4">
              {submission.content}
            </div>
          </div>
        )}

        {submission.feedbackFromInstructor && (
          <div className="mt-6">
            <h3 className="${submission.status === 'rejected' ? 'text-destructive' : (submission.status === 'approved' ? 'text-emerald-600' : 'text-muted-foreground')} mb-1 text-sm font-semibold">
              Phản hồi của bạn trước đó:
            </h3>
            <div
              className={`whitespace-pre-line rounded-md border p-3 text-sm ${
                submission.status === "rejected"
                  ? "border-destructive/50 bg-destructive/5 text-destructive"
                  : submission.status === "approved"
                    ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-700"
                    : "bg-muted/50"
              } `}
            >
              {submission.feedbackFromInstructor}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Đánh giá và phản hồi</h2>
        <GradingForm initialData={submissionDataForForm} />
      </div>
    </div>
  );
}
