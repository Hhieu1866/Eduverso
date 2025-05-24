"use client";
// import uploadIcon from "@/assets/icons/upload.svg";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  CloudUpload,
  FileUp,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const FileUpload = ({
  endpoint,
  onUploadComplete,
  multiple = false,
  accept = { "*": [] }, // Default to allow all file types
  maxFiles = 1,
  maxSize = 2 * 1024 * 1024, // Default 2MB
  label = "Tải lên file",
  description = "Kéo thả hoặc chọn file",
  disabled = false,
  uploadImmediately = false, // New prop to control immediate upload
  essayId, // New prop for essayId, only relevant for 'essay-submission' endpoint
}) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]); // State để lưu các files đã upload

  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        fileRejections.forEach(({ file, errors }) => {
          errors.forEach((err) => {
            if (err.code === "file-too-large") {
              toast.error(
                `File ${file.name} quá lớn. Kích thước tối đa là ${(maxSize / (1024 * 1024)).toFixed(1)}MB.`,
              );
            } else if (err.code === "file-invalid-type") {
              toast.error(`File ${file.name} không đúng định dạng.`);
            } else {
              toast.error(`Lỗi file ${file.name}: ${err.message}`);
            }
          });
        });
        return;
      }

      if (acceptedFiles.length > 0) {
        const newFiles = multiple
          ? [...files, ...acceptedFiles].slice(0, maxFiles)
          : [acceptedFiles[0]];

        setFiles(newFiles);
        if (uploadImmediately) {
          handleUpload(newFiles);
        }
      }
    },
    [files, multiple, maxFiles, maxSize, uploadImmediately],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    maxFiles: multiple ? maxFiles : 1,
    disabled: disabled || isUploading,
  });

  const handleUpload = async (filesToUpload) => {
    if (!filesToUpload || filesToUpload.length === 0) {
      toast.error("Vui lòng chọn file để tải lên.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();

    // Nếu là endpoint 'essay-submission', thêm essayId vào formData
    if (endpoint === "essay-submission" && essayId) {
      formData.append("essayId", essayId);
    }

    filesToUpload.forEach((file) => {
      formData.append("files", file); // API mong đợi key là "files"
    });

    try {
      const res = await fetch(`/api/upload/${endpoint}`, {
        method: "POST",
        body: formData,
        // Không cần 'Content-Type': 'multipart/form-data', browser tự thêm khi có FormData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Lỗi máy chủ: ${res.status}`);
      }

      const result = await res.json();
      toast.success(result.message || "Tải lên thành công!");

      // Lưu file đã upload vào state, không gọi onUploadComplete ngay
      setUploadedFiles(result.files);

      // Chỉ gọi onUploadComplete ngay nếu uploadImmediately = true
      if (uploadImmediately && onUploadComplete) {
        onUploadComplete(result.files);
      }

      setFiles([]); // Xóa file đã chọn sau khi tải lên thành công
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
      toast.error(error.message || "Tải lên thất bại. Vui lòng thử lại.");
      setUploadError(error.message || "Tải lên thất bại.");
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Xác nhận nộp các file đã upload
  const handleConfirmSubmit = () => {
    if (uploadedFiles.length > 0 && onUploadComplete) {
      onUploadComplete(uploadedFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center transition-colors hover:border-primary/70",
          isDragActive && "border-primary bg-primary/10",
          (disabled || isUploading) && "cursor-not-allowed opacity-60",
        )}
      >
        <input {...getInputProps()} />
        <CloudUpload className="mx-auto mb-3 h-12 w-12 text-muted-foreground/80" />
        {isDragActive ? (
          <p className="font-semibold text-primary">Thả file vào đây...</p>
        ) : (
          <>
            <p className="mb-1 text-lg font-semibold">
              {multiple
                ? "Kéo thả hoặc chọn các file"
                : "Kéo thả hoặc chọn file"}
            </p>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {`Tối đa ${maxFiles} file(s), ${(maxSize / (1024 * 1024)).toFixed(1)}MB mỗi file.`}
            </p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">File đã chọn:</p>
          <ul className="divide-y divide-border rounded-md border">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-3">
                <span className="truncate text-sm" title={file.name}>
                  {file.name} - ({(file.size / 1024).toFixed(1)} KB)
                </span>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    aria-label="Xóa file"
                  >
                    <XCircle className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nút upload để tải file lên server */}
      {!uploadImmediately && files.length > 0 && (
        <Button
          onClick={() => handleUpload(files)}
          disabled={isUploading || disabled || files.length === 0}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Đang tải...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Tải lên {files.length} file
            </>
          )}
        </Button>
      )}

      {/* Hiển thị các file đã upload và chờ xác nhận */}
      {uploadedFiles.length > 0 && !uploadImmediately && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">File đã tải lên thành công:</p>
          <ul className="divide-y divide-border rounded-md border bg-muted/20">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="flex items-center gap-2 p-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="truncate text-sm" title={file.name}>
                  {file.name}
                </span>
              </li>
            ))}
          </ul>

          {/* Nút xác nhận nộp bài - chỉ hiển thị khi đã upload thành công và chưa gửi dữ liệu */}
          <Button
            onClick={handleConfirmSubmit}
            className="mt-2 w-full"
            variant="default"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Xác nhận nộp {uploadedFiles.length} file
          </Button>
        </div>
      )}

      {isUploading && Object.keys(uploadProgress).length > 0 && (
        <div className="mt-2 space-y-1">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName}>
              <div className="flex justify-between text-sm">
                <span className="truncate">{fileName}</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {uploadError && (
        <div className="mt-2 flex items-center rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <XCircle className="mr-2 h-5 w-5" />
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
