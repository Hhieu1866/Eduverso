"use client";
// import uploadIcon from "@/assets/icons/upload.svg";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CloudUpload, FileUp, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export function UploadDropzone({ onUpload, isUploading = false }) {
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
      className={`
        relative 
        border-2 
        border-dashed 
        rounded-md 
        p-10 
        transition-colors
        ${isDragOver ? "border-primary" : "border-muted-foreground/25"}
        ${isUploading ? "bg-muted pointer-events-none" : ""}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-2">
          <FileUp className="h-5 w-5 text-muted-foreground" />
        </div>

        {isUploading ? (
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-2">
              Đang tải ảnh lên...
            </p>
            <div className="animate-pulse w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              SVG, PNG, JPG or GIF (max 2MB)
            </p>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              className="mt-4 px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md cursor-pointer transition"
              onClick={() => document.getElementById("file").click()}
            >
              <span className="text-xs flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Image
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
