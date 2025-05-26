"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Download,
  UploadCloud,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  getStudentEssaySubmission,
  submitEssay,
} from "@/app/actions/essaySubmission";
import FileUpload from "@/components/file-upload";
import { toast } from "sonner";
import { Alert } from "@/components/ui/alert";

export const EssayList = ({ courseId, essays = [] }) => {
  const router = useRouter();
  const [submissions, setSubmissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingEssay, setIsSubmittingEssay] = useState(false);
  const [filesForServerSubmit, setFilesForServerSubmit] = useState({});
  const [showUploadSection, setShowUploadSection] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        const results = {};
        for (const essay of essays) {
          const submission = await getStudentEssaySubmission(
            essay._id,
            courseId,
          );
          results[essay._id] = submission;
        }
        setSubmissions(results);
      } catch (error) {
        console.error("Lỗi khi lấy bài nộp:", error);
        toast.error("Lỗi khi tải thông tin bài nộp.");
      } finally {
        setIsLoading(false);
      }
    };

    if (essays.length > 0) {
      fetchSubmissions();
    } else {
      setIsLoading(false);
    }
  }, [courseId, essays]);

  const handleApiUploadComplete = async (uploadedApiFiles, essayId) => {
    try {
      setIsSubmittingEssay(true);
      console.log(
        "Files sau khi upload:",
        JSON.stringify(uploadedApiFiles, null, 2),
      );

      // Đảm bảo dùng đúng cấu trúc dữ liệu cho submitEssay
      const submissionResult = await submitEssay(essayId, courseId, {
        submittedFiles: uploadedApiFiles,
        content: "",
      });
      console.log(
        "Kết quả nộp bài:",
        JSON.stringify(submissionResult, null, 2),
      );

      // Cập nhật state khi nộp bài thành công
      setSubmissions((prev) => ({
        ...prev,
        [essayId]: submissionResult,
      }));
      toast.success("Nộp bài thành công!");
    } catch (error) {
      console.error("Lỗi khi nộp bài:", error);
      toast.error(error.message || "Nộp bài thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmittingEssay(false);
    }
  };

  const handleConfirmSubmitEssay = async (essayId) => {
    const currentSubmission = submissions[essayId];
    if (currentSubmission && currentSubmission.status === "approved") {
      toast.info("Bài làm đã được duyệt, không thể nộp lại.");
      return;
    }

    const filesToActualSubmit = filesForServerSubmit[essayId];

    if (!filesToActualSubmit || filesToActualSubmit.length === 0) {
      toast.error("Vui lòng tải lên ít nhất một file trước khi nộp.");
      return;
    }

    setIsSubmittingEssay(true);
    try {
      const newSubmission = await submitEssay(essayId, courseId, {
        submittedFiles: filesToActualSubmit,
      });
      setSubmissions((prev) => ({ ...prev, [essayId]: newSubmission }));
      setFilesForServerSubmit((prev) => ({ ...prev, [essayId]: [] }));
      setShowUploadSection(null);
      toast.success("Nộp bài làm thành công!");
      router.refresh();
    } catch (error) {
      console.error("Lỗi khi nộp bài:", error);
      toast.error(error.message || "Đã xảy ra lỗi khi nộp bài.");
    } finally {
      setIsSubmittingEssay(false);
    }
  };

  const getStatusBadge = (essayId) => {
    const submission = submissions[essayId];
    if (!submission) return <Badge variant="outline">Chưa nộp</Badge>;
    if (submission.status === "pending")
      return (
        <Badge className="inline-flex bg-yellow-500 hover:bg-yellow-500/90">
          Chờ duyệt
        </Badge>
      );
    if (submission.status === "graded")
      return (
        <Badge className="inline-flex bg-green-600 hover:bg-green-600/90">
          Đã chấm ({submission.grade}/10)
        </Badge>
      );
    if (submission.status === "returned")
      return (
        <Badge className="inline-flex bg-blue-600 hover:bg-blue-600/90">
          Đã trả lại
        </Badge>
      );
    if (submission.status === "approved")
      return (
        <Badge className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-600/90">
          <CheckCircle className="h-3 w-3" /> Đã duyệt
        </Badge>
      );
    if (submission.status === "rejected")
      return (
        <Badge className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-600/90">
          <XCircle className="h-3 w-3" /> Bị từ chối
        </Badge>
      );
    return <Badge variant="outline">Chưa nộp</Badge>;
  };

  const handleDownloadInstructorFile = (fileUrl, fileName) => {
    if (!fileUrl) {
      toast.error("Không tìm thấy URL của file.");
      return;
    }
    try {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName || "tai_lieu_dinh_kem";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Bắt đầu tải tài liệu...");
    } catch (error) {
      toast.error("Lỗi khi tải tài liệu.");
      console.error("Download error:", error);
    }
  };

  const handleDownloadSubmittedFile = (fileUrl, fileName) => {
    if (!fileUrl) {
      toast.error("Không tìm thấy URL của file.");
      return;
    }
    window.open(fileUrl, "_blank");
  };

  // Hàm nhận diện icon file giống lesson editor
  function getFileIcon(doc) {
    return (
      <Paperclip className="h-5 w-5 flex-shrink-0 align-middle text-primary" />
    );
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  if (essays.length === 0)
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Khóa học này không có bài tự luận.
        </p>
      </div>
    );

  return (
    <div className="divide-y divide-border">
      {essays.map((essay) => {
        const submission = submissions[essay._id];
        const canSubmit =
          !submission ||
          submission.status === "rejected" ||
          submission.status === "pending";
        const isApproved = submission?.status === "approved";
        const filesReadyForServer = filesForServerSubmit[essay._id] || [];

        return (
          <div key={essay._id} className="space-y-4 p-4">
            <div className="space-y-2">
              <h4 className="text-base font-semibold text-primary">
                {essay.title}
              </h4>
              <div>{getStatusBadge(essay._id)}</div>
            </div>

            <div>
              <p className="text-sm text-colors-navy">
                <b>Đề bài</b>: {essay.description}
              </p>
            </div>

            {essay.documents && essay.documents.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Tài liệu đính kèm từ giảng viên:
                </p>
                <ul className="space-y-2">
                  {essay.documents.map((doc, index) => (
                    <li
                      key={doc.fileUrl || doc.name || index}
                      className="flex items-center justify-between rounded-md border bg-background p-2.5 shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {getFileIcon(doc)}
                        <span className="truncate text-sm" title={doc.name}>
                          {doc.name}{" "}
                          {doc.fileSize
                            ? `(${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB)`
                            : ""}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadInstructorFile(doc.fileUrl, doc.name)
                        }
                      >
                        <Download className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(isApproved || submission?.status === "rejected") && (
              <Alert
                variant={isApproved ? "success" : "destructive"}
                className={
                  isApproved
                    ? "mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-800"
                    : "mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-red-800"
                }
              >
                <div className="mb-1 text-base font-semibold">
                  {isApproved
                    ? "Bài làm đã được duyệt!"
                    : "Bài làm đã bị từ chối!"}
                </div>
                <div className="mb-2 text-sm">
                  {isApproved
                    ? "Bạn đã hoàn thành xuất sắc bài tự luận này."
                    : "Vui lòng xem lại phản hồi từ giảng viên."}
                </div>
                {submission?.feedbackFromInstructor && (
                  <>
                    <div className="mb-1 mt-2 text-xs font-medium opacity-80">
                      Phản hồi từ giảng viên
                    </div>
                    <div className="whitespace-pre-line rounded bg-white/60 p-1 text-sm shadow-inner">
                      {submission.feedbackFromInstructor}
                    </div>
                  </>
                )}
              </Alert>
            )}

            {submission?.submittedFiles &&
              submission.submittedFiles.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Bài làm đã nộp:
                  </p>
                  <ul className="space-y-2">
                    {submission.submittedFiles.map((file, index) => (
                      <li
                        key={file.fileUrl || file.name || index}
                        className="flex items-center justify-between rounded-md border bg-background p-2.5 shadow-sm"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Paperclip className="h-5 w-5 flex-shrink-0 text-primary" />
                          <span className="truncate text-sm" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadSubmittedFile(file.fileUrl, file.name)
                          }
                        >
                          <Download className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {canSubmit && !isApproved && (
              <div className="mt-6">
                {!showUploadSection || showUploadSection !== essay._id ? (
                  <Button
                    onClick={() => {
                      setShowUploadSection(essay._id);
                      setFilesForServerSubmit((prev) => ({
                        ...prev,
                        [essay._id]: [],
                      }));
                    }}
                    className="w-full"
                    variant={submission ? "secondary" : "default"}
                  >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {submission ? "Nộp lại bài làm" : "Nộp bài làm"}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <h5 className="text-md text-center font-semibold">
                      {submission?.status === "rejected"
                        ? "Nộp lại bài làm (Các file cũ sẽ được thay thế)"
                        : submission?.status === "pending"
                          ? "Cập nhật bài làm (Các file cũ sẽ được thay thế)"
                          : "Tải lên bài làm của bạn"}
                    </h5>
                    <FileUpload
                      endpoint="essay-submission"
                      essayId={essay._id}
                      onUploadComplete={(uploadedApiFiles) =>
                        handleApiUploadComplete(uploadedApiFiles, essay._id)
                      }
                      multiple={true}
                      maxFiles={10}
                      maxSize={15 * 1024 * 1024}
                      accept={{
                        "application/pdf": [".pdf"],
                        "application/msword": [".doc"],
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                          [".docx"],
                        "application/vnd.ms-excel": [".xls"],
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                          [".xlsx"],
                        "application/vnd.ms-powerpoint": [".ppt"],
                        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                          [".pptx"],
                      }}
                      description={`Nộp các file bài làm (chỉ chấp nhận .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf) cho: ${essay.title}`}
                    />

                    {filesReadyForServer.length > 0 && (
                      <div className="mt-4 rounded-md border bg-green-50 p-3">
                        <p className="text-sm font-medium text-green-700">
                          {filesReadyForServer.length} file đã được tải lên và
                          sẵn sàng để nộp.
                        </p>
                        <ul className="list-inside list-disc pl-2 text-sm text-green-600">
                          {filesReadyForServer.map((f, i) => (
                            <li key={f.fileUrl || f.name || i}>{f.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowUploadSection(null)}
                        disabled={isSubmittingEssay}
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={() => handleConfirmSubmitEssay(essay._id)}
                        disabled={
                          isSubmittingEssay || filesReadyForServer.length === 0
                        }
                        className="min-w-[120px]"
                      >
                        {isSubmittingEssay ? (
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Xác nhận nộp
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
