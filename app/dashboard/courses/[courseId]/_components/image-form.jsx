"use client";

import { useEffect, useState } from "react";

// import axios from "axios";
import { ImageIcon, Pencil, PlusCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import * as z from "zod";

import { UploadDropzone } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  imageUrl: z.string().min(1, {
    message: "Image is required",
  }),
});

export const ImageForm = ({ initialData, courseId }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  // Kiểm tra xem imageUrl có hợp lệ hay không
  const hasValidImage =
    initialData?.imageUrl &&
    initialData.imageUrl !== "undefined" &&
    !initialData.imageUrl.includes("undefined");

  // Mặc định isEditing = true nếu chưa có ảnh hợp lệ
  const [isEditing, setIsEditing] = useState(!hasValidImage);

  useEffect(() => {
    if (file) {
      uploadFile();
    }
  }, [file]);

  const uploadFile = async () => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file[0]);
      formData.append("courseId", courseId);

      const response = await fetch("/api/upload/course-thumbnail", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Cập nhật URL trên giao diện
        initialData.imageUrl = result.url;
        initialData.thumbnailUrl = result.url;

        toast.success("Đã cập nhật ảnh thumbnail");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error || "Lỗi khi tải lên ảnh");
      }
    } catch (e) {
      toast.error(e.message || "Lỗi khi tải lên ảnh");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(
        `/api/upload/course-thumbnail?courseId=${courseId}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (response.ok) {
        // Cập nhật UI
        initialData.imageUrl = null;
        initialData.thumbnailUrl = null;

        toast.success("Đã xóa ảnh thumbnail");
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Lỗi khi xóa ảnh");
      }
    } catch (e) {
      toast.error(e.message || "Lỗi khi xóa ảnh");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleEdit = () => setIsEditing((current) => !current);

  // Cập nhật logic xác định đường dẫn ảnh
  const getImageUrl = () => {
    // Nếu có URL từ Vercel Blob, ưu tiên sử dụng
    if (initialData.thumbnailUrl) {
      return initialData.thumbnailUrl;
    }

    // Nếu có đường dẫn ảnh từ thư mục public
    if (
      initialData.thumbnail &&
      !initialData.thumbnail.includes("undefined")
    ) {
      return `/assets/images/courses/${initialData.thumbnail}`;
    }

    // Nếu có imageUrl cũ (không phải từ Blob)
    if (initialData.imageUrl && !initialData.imageUrl.includes("undefined")) {
      // Kiểm tra xem imageUrl có phải đường dẫn đầy đủ không (bắt đầu bằng http hoặc /)
      if (
        initialData.imageUrl.startsWith("http") ||
        initialData.imageUrl.startsWith("/")
      ) {
        return initialData.imageUrl;
      } else {
        return `/assets/images/courses/${initialData.imageUrl}`;
      }
    }

    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="mt-6 border bg-gray-50 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        <span>Course Image</span>
        <div className="flex gap-2">
          {hasValidImage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>

              {!isEditing && (
                <Button variant="outline" size="sm" onClick={toggleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Change
                </Button>
              )}
            </>
          )}

          {isEditing && (
            <Button variant="outline" size="sm" onClick={toggleEdit}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Chỉ hiển thị ảnh khi có đường dẫn hợp lệ */}
      {hasValidImage && !isEditing && (
        <div className="relative aspect-video mt-2">
          <Image
            alt="Course thumbnail"
            fill
            className="object-cover rounded-md"
            src={imageUrl}
          />
        </div>
      )}

      {/* Hiển thị placeholder khi không có ảnh hợp lệ và không trong chế độ chỉnh sửa */}
      {!hasValidImage && !isEditing && (
        <div
          className="relative aspect-video mt-2 bg-slate-200 rounded-md overflow-hidden cursor-pointer"
          onClick={toggleEdit}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <ImageIcon className="h-12 w-12 mx-auto text-slate-500 mb-2" />
              <p className="text-slate-500 text-sm">Chưa có ảnh khóa học</p>
              <p className="text-slate-400 text-xs mt-1">
                Nhấn vào đây để tải lên ảnh
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Khuyến nghị sử dụng ảnh tỷ lệ 16:9
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị UploadDropzone khi ở chế độ chỉnh sửa */}
      {isEditing && (
        <div>
          <UploadDropzone
            onUpload={(file) => setFile(file)}
            isUploading={isUploading}
          />
          <div className="text-xs text-muted-foreground mt-4">
            16:9 aspect ratio recommended
          </div>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa ảnh thumbnail</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa ảnh thumbnail này không? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteImage}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa ảnh"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
