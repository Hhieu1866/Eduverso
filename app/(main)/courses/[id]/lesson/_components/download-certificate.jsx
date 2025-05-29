"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Award, LockIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { checkEssayApprovalStatus } from "@/app/actions/essaySubmission";

export const DownloadCertificate = ({
  courseId,
  totalProgress,
  quizPassed,
  hasEssays = false,
}) => {
  const [isCertificateDownloading, setIsCertificateDownloading] =
    useState(false);
  const [essaysApproved, setEssaysApproved] = useState(false);
  const [isCheckingEssays, setIsCheckingEssays] = useState(false);

  // Kiểm tra trạng thái duyệt bài tự luận
  useEffect(() => {
    const checkEssayStatus = async () => {
      if (hasEssays) {
        setIsCheckingEssays(true);
        try {
          const approved = await checkEssayApprovalStatus(courseId);
          setEssaysApproved(approved);
        } catch (error) {
          console.error("Lỗi khi kiểm tra trạng thái bài tự luận:", error);
          setEssaysApproved(false);
        } finally {
          setIsCheckingEssays(false);
        }
      }
    };

    checkEssayStatus();
  }, [courseId, hasEssays]);

  // Kiểm tra điều kiện để tải chứng chỉ:
  // 1. Đã hoàn thành 100% bài học
  // 2. Đã vượt qua bài kiểm tra (nếu có)
  // 3. Đã được duyệt bài tự luận (nếu có)
  const canDownloadCertificate =
    totalProgress >= 100 &&
    (quizPassed === true || quizPassed === undefined) &&
    (!hasEssays || essaysApproved);

  // Hiển thị thông báo tại sao không thể tải
  const getTooltipMessage = () => {
    if (totalProgress < 100) {
      return "Bạn cần hoàn thành tất cả các bài học";
    }
    if (quizPassed === false) {
      return "Bạn cần vượt qua bài kiểm tra cuối khóa (đạt ≥90%)";
    }
    if (hasEssays && !essaysApproved) {
      return "Bạn cần được duyệt tất cả bài tự luận";
    }
    return "";
  };

  console.log("Debug chứng chỉ:", {
    totalProgress,
    quizPassed,
    hasEssays,
    essaysApproved,
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
          <Award className="h-4 w-4 text-primary text-white" />
        ) : (
          <LockIcon className="h-4 w-4 text-white" />
        )}
        {isCertificateDownloading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-faster-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Đang tải...</span>
          </div>
        ) : (
          "Tải chứng chỉ hoàn thành"
        )}
      </>
    );

    if (isCheckingEssays) {
      return (
        <Button
          disabled={true}
          className="w-full justify-start gap-2 bg-gray-100 text-gray-500"
          size="lg"
        >
          <div className="h-4 w-4 animate-faster-spin rounded-full border-2 border-current border-t-transparent" />
          Đang kiểm tra điều kiện...
        </Button>
      );
    }

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
