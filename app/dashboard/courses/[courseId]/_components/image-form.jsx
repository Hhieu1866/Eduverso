"use client";

import { useEffect, useState } from "react";

// import axios from "axios";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import * as z from "zod";

import FileUpload from "@/components/file-upload";
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

// const formSchema = z.object({
//   imageUrl: z.string().min(1, {
//     message: "Image is required",
//   }),
// });

export const ImageForm = ({ initialData, courseId }) => {
  // State local cho ảnh
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.thumbnailUrl || "",
  );
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  // Kiểm tra xem imageUrl có hợp lệ hay không
  const hasValidImage =
    (imageUrl && imageUrl !== "undefined" && !imageUrl.includes("undefined")) ||
    (thumbnailUrl &&
      thumbnailUrl !== "undefined" &&
      !thumbnailUrl.includes("undefined"));

  // Mặc định isEditing = true nếu chưa có ảnh hợp lệ
  const [isEditing, setIsEditing] = useState(!hasValidImage);

  // Nếu initialData thay đổi (ví dụ khi đổi course), cập nhật lại state
  useEffect(() => {
    setImageUrl(initialData?.imageUrl || "");
    setThumbnailUrl(initialData?.thumbnailUrl || "");
  }, [initialData]);

  // Khi initialData đổi (ảnh mới về), tự động tắt chế độ chỉnh sửa
  useEffect(() => {
    if (
      (initialData?.thumbnailUrl &&
        initialData.thumbnailUrl !== "" &&
        initialData.thumbnailUrl !== "undefined") ||
      (initialData?.imageUrl &&
        initialData.imageUrl !== "" &&
        initialData.imageUrl !== "undefined")
    ) {
      setIsEditing(false);
    }
  }, [initialData?.thumbnailUrl, initialData?.imageUrl]);

  useEffect(() => {
    if (file) {
      uploadFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setImageUrl(result.url);
        setThumbnailUrl(result.url);
        toast.success("Đã cập nhật ảnh thumbnail");
        setIsEditing(false);
        // Gọi revalidate API cho path động trước khi refresh
        await fetch(`/api/revalidate?path=/dashboard/courses/${courseId}`);
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
        setImageUrl("");
        setThumbnailUrl("");
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

  // Cập nhật logic xác định đường dẫn ảnh ưu tiên state
  const getImageUrl = () => {
    if (
      thumbnailUrl &&
      thumbnailUrl !== "undefined" &&
      !thumbnailUrl.includes("undefined")
    ) {
      return thumbnailUrl;
    }
    if (
      imageUrl &&
      imageUrl !== "undefined" &&
      !imageUrl.includes("undefined")
    ) {
      if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
        return imageUrl;
      } else {
        return `/assets/images/courses/${imageUrl}`;
      }
    }
    // Nếu có đường dẫn ảnh từ thư mục public (giữ lại logic cũ nếu cần)
    if (initialData.thumbnail && !initialData.thumbnail.includes("undefined")) {
      return `/assets/images/courses/${initialData.thumbnail}`;
    }
    return null;
  };

  const imageDisplayUrl = getImageUrl();

  return (
    <div className="mt-6 rounded-md border bg-gray-50 p-4">
      <div className="flex items-center justify-between font-medium">
        <span>Ảnh khoá học</span>
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
                <Trash2 className="mr-2 h-4 w-4" />
                Xoá ảnh
              </Button>

              {!isEditing && (
                <Button variant="outline" size="sm" onClick={toggleEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Đổi ảnh
                </Button>
              )}
            </>
          )}

          {isEditing && (
            <Button variant="outline" size="sm" onClick={toggleEdit}>
              Huỷ
            </Button>
          )}
        </div>
      </div>

      {/* Chỉ hiển thị ảnh khi có đường dẫn hợp lệ */}
      {hasValidImage && !isEditing && imageDisplayUrl && (
        <div className="relative mt-2 aspect-video">
          <Image
            key={imageDisplayUrl}
            alt="Ảnh khoá học"
            fill
            className="rounded-md object-cover"
            src={imageDisplayUrl}
          />
        </div>
      )}

      {/* Hiển thị placeholder khi không có ảnh hợp lệ và không trong chế độ chỉnh sửa */}
      {!hasValidImage && !isEditing && (
        <div
          className="relative mt-2 aspect-video cursor-pointer overflow-hidden rounded-md bg-slate-200"
          onClick={toggleEdit}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-4 text-center">
              <ImageIcon className="mx-auto mb-2 h-12 w-12 text-slate-500" />
              <p className="text-sm text-slate-500">Chưa có ảnh khóa học</p>
              <p className="mt-1 text-xs text-slate-400">
                Nhấn vào đây để tải lên ảnh
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Khuyến nghị sử dụng ảnh tỷ lệ 16:9
              </p>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div>
          <FileUpload
            endpoint="course-thumbnail"
            courseId={courseId}
            onUpload={(file) => setFile(file)}
            isUploading={isUploading}
            onUploadComplete={(files) => {
              // Đảm bảo tắt chế độ chỉnh sửa và refresh UI
              setIsEditing(false);
              router.refresh();
            }}
          />
          <div className="mt-4 text-xs text-muted-foreground">
            Khuyến nghị sử dụng ảnh tỷ lệ 16:9
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
