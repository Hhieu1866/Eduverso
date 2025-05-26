"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import FileUpload from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Download, Paperclip } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatFileSize } from "@/app/lib/format-file-size";

// Hàm nhận diện icon file
function getFileIcon(doc) {
  return <Paperclip className="h-5 w-5 text-primary" />;
}

// Dialog xác nhận xóa
function DeleteDialog({ open, onOpenChange, onDelete, isDeleting }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa tài liệu</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn
            tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Đang xóa..." : "Xóa tài liệu"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const DocumentUploadForm = ({
  initialData,
  courseId,
  moduleId,
  lessonId,
  onDocumentsChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [deleteDocumentUrl, setDeleteDocumentUrl] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  // Cập nhật state khi props thay đổi
  useEffect(() => {
    if (initialData?.documents && Array.isArray(initialData.documents)) {
      setDocuments(initialData.documents);
    }
  }, [initialData]);

  // Lấy lại dữ liệu tài liệu mới nhất từ server
  const fetchUpdatedLesson = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/lessons/${lessonId}`,
      );
      if (response.ok) {
        const updatedLesson = await response.json();
        if (updatedLesson.documents && Array.isArray(updatedLesson.documents)) {
          setDocuments(updatedLesson.documents);
        }
      }
    } catch (error) {
      // Có thể toast lỗi nếu cần
    }
  }, [courseId, lessonId]);

  // Upload file
  const handleUpload = useCallback(
    async (files) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File quá lớn. Vui lòng chọn file nhỏ hơn 10MB");
        return;
      }
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("lessonId", lessonId);
        formData.append("courseId", courseId);
        formData.append("moduleId", moduleId);
        const response = await fetch("/api/upload/course-documents", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (response.ok) {
          toast.success("Đã tải lên tài liệu thành công");
          await fetchUpdatedLesson();
          if (onDocumentsChange) onDocumentsChange();
        } else {
          toast.error(result.error || "Lỗi khi tải lên tài liệu");
        }
      } catch (error) {
        toast.error("Lỗi khi tải lên tài liệu");
      } finally {
        setIsUploading(false);
      }
    },
    [courseId, lessonId, moduleId, fetchUpdatedLesson, onDocumentsChange],
  );

  // confirm xóa
  const handleDeleteConfirm = useCallback((documentUrl) => {
    setDeleteDocumentUrl(documentUrl);
  }, []);

  // Xóa file
  const handleDelete = useCallback(async () => {
    if (!deleteDocumentUrl) return;
    try {
      setIsDeleting(true);
      const response = await fetch(
        `/api/upload/course-documents?lessonId=${lessonId}&documentUrl=${encodeURIComponent(deleteDocumentUrl)}&courseId=${courseId}&moduleId=${moduleId}`,
        { method: "DELETE" },
      );
      const result = await response.json();
      if (response.ok) {
        toast.success("Đã xóa tài liệu");
        setDeleteDocumentUrl(null);
        await fetchUpdatedLesson();
      } else {
        toast.error(result.error || "Lỗi khi xóa tài liệu");
      }
    } catch (error) {
      toast.error("Lỗi khi xóa tài liệu");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteDocumentUrl, lessonId, courseId, moduleId, fetchUpdatedLesson]);

  // tải xuống file
  const handleDownload = useCallback(
    async (fileUrl, fileName) => {
      try {
        if (isDownloading) return;
        setIsDownloading(true);
        const downloadUrl = `/api/upload/course-documents/download?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(fileName)}`;
        const downloadWindow = window.open(downloadUrl, "_blank");
        toast.success("Đã bắt đầu tải xuống");
        setTimeout(() => {
          setIsDownloading(false);
          try {
            if (downloadWindow && !downloadWindow.closed) {
              downloadWindow.close();
            }
          } catch (e) {}
        }, 2000);
      } catch (error) {
        toast.error("Không thể tải xuống tài liệu");
        setIsDownloading(false);
      }
    },
    [isDownloading],
  );

  const renderedDocuments = useMemo(
    () =>
      documents && documents.length > 0 ? (
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-medium">Tài liệu đã tải lên</h3>
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <Card key={index} className="bg-slate-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(doc)}
                      <div className="max-w-[200px]">
                        <p className="truncate text-sm font-medium">
                          {doc.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.fileSize || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownload(doc.fileUrl, doc.name)}
                        disabled={isDownloading}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteConfirm(doc.fileUrl)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 py-6 text-center text-sm text-muted-foreground">
          <p>Chưa có tài liệu nào được tải lên</p>
        </div>
      ),
    [documents, handleDownload, handleDeleteConfirm, isDownloading],
  );

  return (
    <div className="mt-6 rounded-md border p-4">
      <div className="flex items-center justify-between font-medium">
        <span>Tài liệu bài học</span>
      </div>
      <div className="mt-4">
        <FileUpload
          endpoint="course-documents"
          onUploadComplete={(files) => {
            handleUpload(files);
            // Đảm bảo UI cập nhật sau khi upload
            if (onDocumentsChange) onDocumentsChange();
            router.refresh();
          }}
          isUploading={isUploading}
          label="Tải lên tài liệu"
          description="PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX (max 10MB)"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          courseId={courseId}
          moduleId={moduleId}
          lessonId={lessonId}
        />
      </div>
      {renderedDocuments}
      <DeleteDialog
        open={!!deleteDocumentUrl}
        onOpenChange={(open) => !open && setDeleteDocumentUrl(null)}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
