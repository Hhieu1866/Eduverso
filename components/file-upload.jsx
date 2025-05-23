"use client";
// import uploadIcon from "@/assets/icons/upload.svg";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CloudUpload, FileUp, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export function UploadDropzone({
  onUpload,
  isUploading = false,
  fileTypes = "image/*",
  maxSize = 2,
  label = "Tải lên ảnh",
  description = "SVG, PNG, JPG hoặc GIF (tối đa 2MB)",
  accept = "image/*",
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState([]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div
      className={`relative rounded-md border-2 border-dashed p-10 transition-colors ${isDragOver ? "border-primary" : "border-muted-foreground/25"} ${isUploading ? "pointer-events-none bg-muted" : ""} `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <FileUp className="h-5 w-5 text-muted-foreground" />
        </div>

        {isUploading ? (
          <div className="flex flex-col items-center">
            <p className="mb-2 text-sm text-muted-foreground">
              Đang tải tệp lên...
            </p>
            <div className="h-8 w-8 animate-faster-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            <p className="mb-2 text-sm text-muted-foreground">
              Nhấn để tải lên hoặc kéo thả tệp vào đây
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
            <input
              id="file"
              name="file"
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleUpload}
            />
            <button
              className="mt-4 cursor-pointer rounded-md bg-primary px-5 py-2 text-primary-foreground transition hover:bg-primary/90"
              onClick={() => document.getElementById("file").click()}
            >
              <span className="flex items-center gap-2 text-xs">
                <Upload className="h-4 w-4" />
                {label}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
