"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Award, LockIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DownloadCertificate = ({
  courseId,
  totalProgress,
  quizPassed,
}) => {
  const [isCertificateDownloading, setIsCertificateDownloading] =
    useState(false);

  // Kiểm tra điều kiện để tải chứng chỉ: đã hoàn thành 100% bài học và đã vượt qua bài kiểm tra
  const canDownloadCertificate =
    totalProgress >= 100 && (quizPassed === true || quizPassed === undefined);

  // Hiển thị thông báo tại sao không thể tải
  const getTooltipMessage = () => {
    if (totalProgress < 100) {
      return "Bạn cần hoàn thành tất cả các bài học";
    }
    if (quizPassed === false) {
      return "Bạn cần vượt qua bài kiểm tra cuối khóa (đạt ≥90%)";
    }
    return "";
  };

  console.log("Debug chứng chỉ:", {
    totalProgress,
    quizPassed,
    canDownloadCertificate,
  });

  async function handleCertificateDownload() {
    try {
      setIsCertificateDownloading(true);
      fetch(`/api/certificate?courseId=${courseId}`)
        .then((respone) => respone.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "Chứng_chỉ_hoàn_thành.pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
      toast.success("Chứng chỉ đã được tải xuống thành công");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsCertificateDownloading(false);
    }
  }

  const renderButton = () => {
    const buttonContent = (
      <>
        {canDownloadCertificate ? (
          <Award className="h-4 w-4 text-primary" />
        ) : (
          <LockIcon className="h-4 w-4 text-gray-400" />
        )}
        {isCertificateDownloading ? (
          <div className="flex items-center gap-2">
            <div className="animate-faster-spin h-4 w-4 rounded-full border-2 border-current border-t-transparent" />
            <span>Đang tải...</span>
          </div>
        ) : (
          "Tải chứng chỉ hoàn thành"
        )}
      </>
    );

    if (!canDownloadCertificate) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={true}
                className="w-full justify-start gap-2 bg-gray-100 text-gray-500"
                size="lg"
              >
                {buttonContent}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getTooltipMessage()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button
        onClick={handleCertificateDownload}
        disabled={isCertificateDownloading}
        className="w-full justify-start gap-2"
        size="lg"
      >
        {buttonContent}
      </Button>
    );
  };

  return renderButton();
};
