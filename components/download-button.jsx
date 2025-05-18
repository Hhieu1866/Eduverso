"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const DownloadButton = ({ url, filename, children, ...props }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!url) return;

    setIsDownloading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(blobUrl);
      toast.success("Tải xuống thành công");
    } catch (error) {
      console.error("Lỗi khi tải xuống:", error);
      toast.error("Không thể tải xuống tài liệu");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading || !url}
      {...props}
    >
      {isDownloading ? (
        <span className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
          Đang tải...
        </span>
      ) : (
        <>
          {props.icon || <Download className="mr-2 h-4 w-4" />}
          {children || "Tải xuống"}
        </>
      )}
    </Button>
  );
};
