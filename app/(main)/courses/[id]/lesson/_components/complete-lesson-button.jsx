"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, CheckCheck, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axios";

// Tạo custom event để thông báo khi hoàn thành bài học
const createLessonCompletedEvent = (courseId, lessonId, moduleSlug) => {
  console.log("Phát sự kiện lessonCompleted cho khóa học:", courseId);

  // Tạo sự kiện với chi tiết tối thiểu và cần thiết
  const event = new CustomEvent("lessonCompleted", {
    detail: {
      courseId,
      lessonId,
      moduleSlug,
      timestamp: Date.now(),
    },
    bubbles: true,
  });

  // Dispatch sự kiện vào window object để có thể bắt được ở mọi nơi
  window.dispatchEvent(event);
  console.log("Đã phát ra sự kiện lessonCompleted thành công");
};

export const CompleteLessonButton = ({
  courseId,
  lessonId,
  moduleSlug,
  initialState = null,
  nextLessonUrl = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(initialState === "completed");
  const [processing, setProcessing] = useState(false); // Trạng thái đang xử lý API
  const router = useRouter();

  // Cập nhật state khi props thay đổi
  useEffect(() => {
    setCompleted(initialState === "completed");
  }, [initialState, lessonId]);

  // Lấy trạng thái từ window object (được set bởi LessonVideo component)
  useEffect(() => {
    const checkPlayerState = () => {
      if (window.LessonPlayerState) {
        // Chỉ cập nhật trạng thái hoàn thành nếu chưa hoàn thành
        if (!completed && window.LessonPlayerState.isCompleted) {
          setCompleted(window.LessonPlayerState.isCompleted);
        }
        setLoading(window.LessonPlayerState.isLoading);
      }
    };

    // Kiểm tra ngay khi mount
    checkPlayerState();

    // Set interval để kiểm tra liên tục
    const interval = setInterval(checkPlayerState, 1000);
    return () => clearInterval(interval);
  }, [completed]);

  const handleCompleteLesson = async () => {
    // Nếu có sẵn hàm completeLesson từ player, sử dụng nó
    if (window.LessonPlayerState && window.LessonPlayerState.completeLesson) {
      window.LessonPlayerState.completeLesson();
      return;
    }

    // Bắt đầu animation xử lý
    setProcessing(true);

    try {
      // Gọi API đánh dấu bài học hoàn thành
      await axiosInstance.post("/api/lesson-watch", {
        courseId,
        lessonId,
        moduleSlug,
        state: "completed",
        lastTime: 0,
        unlockNext: true,
      });

      // Thông báo thành công
      toast.success("Bài học đã được đánh dấu hoàn thành!");

      // Phát ra sự kiện báo hiệu hoàn thành bài học - ĐÂY LÀ BƯỚC QUAN TRỌNG
      createLessonCompletedEvent(courseId, lessonId, moduleSlug);

      // Thực hiện refresh và revalidate
      router.refresh();

      // Đã hoàn tất xử lý, cập nhật UI
      setCompleted(true);
    } catch (error) {
      console.error("Lỗi khi đánh dấu hoàn thành bài học:", error);
      toast.error("Có lỗi xảy ra khi đánh dấu hoàn thành bài học");
    } finally {
      setProcessing(false); // Kết thúc xử lý
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {!completed ? (
        // Nút đánh dấu hoàn thành
        <Button
          onClick={handleCompleteLesson}
          disabled={loading || processing}
          className={`relative gap-2 overflow-hidden bg-primary text-white transition-all duration-300 sm:w-auto ${
            processing ? "animate-shimmer" : ""
          }`}
          size="lg"
        >
          {processing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang xử lý...</span>
            </div>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Đánh dấu đã hoàn thành</span>
            </>
          )}
        </Button>
      ) : (
        // Nút hiển thị đã hoàn thành
        <Button
          disabled={true}
          variant="outline"
          className="gap-2 border-green-600 bg-green-100 text-green-800 shadow-sm transition-all duration-300 sm:w-auto"
          size="lg"
        >
          <CheckCheck className="h-4 w-4 font-bold text-green-700" />
          <span className="font-medium">Đã hoàn thành</span>
        </Button>
      )}

      {/* Chỉ hiển thị nút bài tiếp theo khi bài hiện tại đã hoàn thành và có bài tiếp theo */}
      {completed && nextLessonUrl && (
        <Button
          asChild
          size="lg"
          className="animate-fadeIn gap-1 bg-primary text-white transition-all duration-300"
        >
          <Link
            href={`${nextLessonUrl}${
              nextLessonUrl.includes("?") ? "&" : "?"
            }fromComplete=true`}
            className="bg-primary text-white"
          >
            Bài tiếp theo <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
};
