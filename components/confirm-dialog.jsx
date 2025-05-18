"use client";

import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Component ConfirmDialog - Hiển thị hộp thoại xác nhận với giao diện đẹp mắt
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Phần tử kích hoạt dialog (thường là button)
 * @param {string} props.title - Tiêu đề của dialog
 * @param {string} props.description - Mô tả của dialog
 * @param {string} props.confirmText - Văn bản nút xác nhận (mặc định: "OK")
 * @param {string} props.cancelText - Văn bản nút hủy (mặc định: "Hủy")
 * @param {string} props.variant - Kiểu nút xác nhận (destructive/default)
 * @param {Function} props.onConfirm - Callback khi xác nhận
 */
export default function ConfirmDialog({
  children,
  title,
  description,
  confirmText = "OK",
  cancelText = "Hủy",
  variant = "default",
  onConfirm,
}) {
  const [open, setOpen] = useState(false);

  const handleConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm();
    }
    setOpen(false);
  }, [onConfirm]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            variant={variant}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 