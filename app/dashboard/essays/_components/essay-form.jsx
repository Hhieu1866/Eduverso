"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createEssay, updateEssay } from "@/app/actions/essay";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { UploadDropzone } from "@/components/file-upload";
import { Download, Eye, Trash2, FileText, File } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { formatFileSize } from "@/app/lib/format-file-size";
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

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Tiêu đề không được để trống",
  }),
  description: z.string().min(1, {
    message: "Nội dung không được để trống",
  }),
  fileUrl: z.string().optional(),
  fileSize: z.number().optional(),
});

function getFileIcon(doc) {
  const name = doc?.name?.toLowerCase() || "";
  const type = doc?.fileType?.toLowerCase() || "";
  if (name.endsWith(".pdf") || type.includes("pdf")) {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  if (
    name.endsWith(".ppt") ||
    name.endsWith(".pptx") ||
    type.includes("presentation") ||
    type.includes("powerpoint")
  ) {
    return <FileText className="h-5 w-5 text-orange-500" />;
  }
  if (
    name.endsWith(".xls") ||
    name.endsWith(".xlsx") ||
    type.includes("excel") ||
    type.includes("spreadsheet")
  ) {
    return <FileText className="h-5 w-5 text-emerald-600" />;
  }
  if (
    name.endsWith(".doc") ||
    name.endsWith(".docx") ||
    type.includes("word") ||
    type.includes("doc")
  ) {
    return <FileText className="h-5 w-5 text-blue-600" />;
  }
  if (name.endsWith(".txt") || type.includes("text")) {
    return <FileText className="h-5 w-5 text-gray-600" />;
  }
  if (name.endsWith(".csv") || type.includes("csv")) {
    return <FileText className="h-5 w-5 text-green-500" />;
  }
  if (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".gif") ||
    type.includes("image")
  ) {
    return <File className="h-5 w-5 text-purple-500" />;
  }
  if (
    name.endsWith(".zip") ||
    name.endsWith(".rar") ||
    type.includes("archive")
  ) {
    return <File className="h-5 w-5 text-yellow-600" />;
  }
  return <File className="h-5 w-5 text-gray-500" />;
}

// Dialog xác nhận xóa file
function DeleteFileDialog({ open, onOpenChange, onDelete, isDeleting }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa tài liệu</AlertDialogTitle>
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
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function EssayForm({ initialData }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [currentEssay, setCurrentEssay] = useState(initialData);
  const [documents, setDocuments] = useState(initialData?.documents || []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      fileUrl: "",
      fileSize: 0,
    },
  });

  // Cập nhật form khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        fileUrl: initialData.fileUrl || "",
        fileSize: initialData.fileSize || 0,
      });
      setCurrentEssay(initialData);
      setDocuments(initialData.documents || []);
    }
  }, [initialData, form]);

  // Fetch dữ liệu essay mới nhất từ server
  const fetchUpdatedEssay = useCallback(async () => {
    if (!initialData?.id) return;

    try {
      const response = await fetch(`/api/essays/${initialData.id}`);
      if (response.ok) {
        const updatedEssay = await response.json();
        setCurrentEssay(updatedEssay);
        form.reset({
          title: updatedEssay.title || "",
          description: updatedEssay.description || "",
          fileUrl: updatedEssay.fileUrl || "",
          fileSize: updatedEssay.fileSize || 0,
        });
        setDocuments(updatedEssay.documents || []);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu bài tự luận:", error);
    }
  }, [initialData?.id, form]);

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await updateEssay(initialData._id, values);
        toast.success("Đã lưu bài tự luận thành công");
      } else {
        await createEssay(values);
        toast.success("Đã tạo bài tự luận thành công");
      }
      router.refresh();
    } catch (error) {
      toast.error(error?.message || "Đã xảy ra lỗi khi lưu bài tự luận");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý upload file
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
        if (initialData?._id) {
          formData.append("essayId", initialData._id);
        }
        const response = await fetch("/api/upload/essay-files", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (response.ok && data.document) {
          // Thêm file mới vào danh sách file hiện tại
          setDocuments((prevDocuments) => [...prevDocuments, data.document]);
          toast.success("Đã tải lên tài liệu thành công");

          // Fetch lại dữ liệu từ server để đảm bảo đồng bộ
          await fetchUpdatedEssay();
        } else {
          toast.error(data.error || "Lỗi khi tải lên tài liệu");
        }
      } catch (error) {
        toast.error(error?.message || "Lỗi khi tải lên tài liệu");
      } finally {
        setIsUploading(false);
      }
    },
    [initialData, fetchUpdatedEssay],
  );

  // Xóa file đính kèm
  const handleDeleteFile = useCallback(
    async (fileUrl) => {
      if (!initialData?._id || !fileUrl) return;
      try {
        setIsDeleting(true);
        const response = await fetch(
          `/api/upload/essay-files?essayId=${initialData._id}&documentUrl=${encodeURIComponent(fileUrl)}`,
          { method: "DELETE" },
        );
        if (response.ok) {
          // Xóa file khỏi danh sách hiện tại
          setDocuments((prevDocuments) =>
            prevDocuments.filter((doc) => doc.fileUrl !== fileUrl),
          );
          toast.success("Đã xóa tài liệu thành công");

          // Fetch lại dữ liệu từ server để đảm bảo đồng bộ
          await fetchUpdatedEssay();
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Lỗi khi xóa tài liệu");
        }
      } catch (error) {
        toast.error(error?.message || "Lỗi khi xóa tài liệu");
      } finally {
        setIsDeleting(false);
        setShowDeleteDialog(false);
        setFileToDelete(null);
      }
    },
    [initialData, fetchUpdatedEssay],
  );

  // Tải xuống file
  const handleDownload = useCallback(async (fileUrl, fileName) => {
    try {
      if (!fileUrl) return;

      if (fileUrl.includes("vercel-storage.com")) {
        // Đối với file trên Vercel Blob Storage, sử dụng API download của chúng ta
        const name = fileName || fileUrl.split("/").pop();
        const downloadUrl = `/api/upload/essay-files/download?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(name)}`;
        window.open(downloadUrl, "_blank");
      } else {
        // Đối với file khác, mở trực tiếp URL
        window.open(fileUrl, "_blank");
      }

      toast.success("Đã bắt đầu tải xuống");
    } catch (error) {
      toast.error("Không thể tải xuống tài liệu");
      console.error("Download error:", error);
    }
  }, []);

  const openDeleteDialog = useCallback((fileUrl) => {
    setFileToDelete(fileUrl);
    setShowDeleteDialog(true);
  }, []);

  const renderedDocuments = useMemo(
    () =>
      documents && documents.length > 0 ? (
        <div className="mt-4 space-y-2">
          {documents.map((doc, idx) => (
            <Card key={idx} className="bg-slate-50">
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  {getFileIcon(doc)}
                  <div>
                    <p className="max-w-[200px] truncate text-sm font-medium">
                      {doc.name}
                    </p>
                    {doc.fileSize > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.fileSize)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDownload(doc.fileUrl, doc.name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => openDeleteDialog(doc.fileUrl)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null,
    [documents, handleDownload, openDeleteDialog],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tiêu đề bài tự luận" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập nội dung, yêu cầu bài tự luận"
                  {...field}
                  rows={6}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fileUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tài liệu (tùy chọn)</FormLabel>
              <FormControl>
                <UploadDropzone
                  onUpload={handleUpload}
                  isUploading={isUploading}
                  label="Tải lên tài liệu"
                  description="PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX (tối đa 10MB)"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                />
              </FormControl>
              {renderedDocuments}
              <FormDescription>
                Bạn có thể đính kèm nhiều tài liệu tham khảo cho bài tự luận
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/essays")}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isUploading || isDeleting}
          >
            {initialData ? "Lưu" : "Tạo mới"}
          </Button>
        </div>
      </form>

      {/* Dialog xác nhận xóa file */}
      <DeleteFileDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDelete={() => handleDeleteFile(fileToDelete)}
        isDeleting={isDeleting}
      />
    </Form>
  );
}
