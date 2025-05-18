"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import QuizKnowledgeTest from "@/components/quiz-knowledge-test";
import { CheckCircle, XCircle, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

const Quiz = ({ courseId, quizSet, isTaken, assessmentData }) => {
  const [open, setOpen] = useState(false);
  const [quizResults, setQuizResults] = useState(assessmentData || null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedResults, setSavedResults] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const router = useRouter();

  // Chuẩn bị dữ liệu câu hỏi cho bài kiểm tra
  const quizzes = quizSet.quizIds.map((quiz) => {
    return {
      id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      options: quiz.options.map((option) => {
        return {
          label: option.text,
          isTrue: option.is_correct,
        };
      }),
    };
  });

  // Lấy kết quả bài kiểm tra từ server khi component được tải
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        console.log(
          `Đang fetch dữ liệu assessment: quizSetId=${quizSet._id.toString()}, courseId=${courseId}`,
        );

        // Thay đổi API endpoint từ /api/assessments thành /api/lesson-watch vì chúng ta không có endpoint /api/assessments
        const response = await axiosInstance.get(
          `/api/lesson-watch?quizSetId=${quizSet._id.toString()}&courseId=${courseId}&fetchAssessment=true`,
        );

        console.log("Dữ liệu assessment nhận được:", response);

        if (response.assessment) {
          console.log("Cập nhật quizResults với:", response.assessment);
          setQuizResults(response.assessment);
        } else {
          console.log(
            "Không tìm thấy dữ liệu assessment cho người dùng hiện tại",
          );
          // Không cần lấy từ localStorage vì có thể gây xung đột dữ liệu giữa các user
          setQuizResults(null);
        }
      } catch (error) {
        console.error("Lỗi khi lấy kết quả bài kiểm tra:", error);
        console.error("Chi tiết lỗi:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        // Không sử dụng dữ liệu từ localStorage nữa
        setQuizResults(null);
      }
    };

    // Luôn gọi API để lấy kết quả bài kiểm tra, không phụ thuộc vào assessmentData
    fetchAssessmentData();

    // Không còn cần lắng nghe sự kiện storage nữa vì không sử dụng localStorage
    return () => {};
  }, [courseId, quizSet._id, assessmentData]);

  // Kiểm tra thời gian còn lại nếu chưa đạt và đã làm bài
  useEffect(() => {
    if (quizResults && quizResults.nextAttemptAllowed) {
      const nextAttemptTime = new Date(
        quizResults.nextAttemptAllowed,
      ).getTime();
      const now = Date.now();

      if (nextAttemptTime > now) {
        setIsButtonDisabled(true);

        // Cập nhật thời gian còn lại mỗi giây
        const intervalId = setInterval(() => {
          const currentTime = Date.now();
          const remaining = Math.max(0, nextAttemptTime - currentTime);

          setTimeRemaining(remaining);

          if (remaining <= 0) {
            setIsButtonDisabled(false);
            clearInterval(intervalId);
          }
        }, 1000);

        return () => clearInterval(intervalId);
      }
    }
  }, [quizResults]);

  // Xử lý khi hoàn thành bài kiểm tra
  const handleQuizComplete = async (results) => {
    if (isSubmitting) return; // Tránh submit nhiều lần

    setIsSubmitting(true);

    try {
      // Log dữ liệu gửi đi để debug
      console.log("Dữ liệu gửi đi:", {
        courseId,
        quizSetId: quizSet._id.toString(),
        results,
      });

      // Lưu kết quả chi tiết để xem lại sau này
      setSavedResults({
        details: results.details,
        totalQuestions: results.totalQuestions,
        score: results.score,
      });

      // Gọi API để lưu kết quả quiz
      const response = await axiosInstance.post("/api/lesson-watch", {
        courseId,
        quizSetId: quizSet._id.toString(),
        results: results,
      });

      // Lưu kết quả để hiển thị
      if (response.assessment) {
        setQuizResults(response.assessment);
      }

      // Làm mới trang để cập nhật sidebar
      router.refresh();

      // Modal vẫn mở để người dùng xem kết quả
      setIsReviewMode(true); // Đánh dấu đang ở chế độ xem kết quả

      // Thông báo thành công
      toast.success("Đã lưu kết quả bài kiểm tra thành công");
    } catch (error) {
      console.error("Lỗi khi hoàn thành bài kiểm tra:", error);
      console.error("Chi tiết lỗi:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });

      // Hiển thị thông báo lỗi
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Không thể lưu kết quả bài kiểm tra. Vui lòng thử lại sau.",
      );

      // Giữ modal mở nếu có lỗi để người dùng có thể thử lại
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm xử lý khi người dùng muốn xem lại kết quả
  const handleReviewResults = () => {
    setIsReviewMode(true);
    setOpen(true);
  };

  // Hiển thị thời gian còn lại dưới dạng phút:giây
  const formatTimeRemaining = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <>
      <div className="max-w-full overflow-hidden bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex h-32 items-center justify-center bg-gradient-to-r from-sky-500 to-indigo-500 px-6 text-center">
          <span className="text-lg font-semibold text-white">
            {quizSet.title}
          </span>
        </div>
        <div className="p-4">
          {/* Hiển thị kết quả nếu đã làm bài kiểm tra */}
          {quizResults && (
            <div className="mb-4 rounded-md bg-gray-50 p-3 dark:bg-gray-700">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Kết quả:</span>
                <Badge
                  className={
                    quizResults.isPassed
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-500 hover:bg-red-600"
                  }
                >
                  {quizResults.isPassed ? "Đã vượt qua" : "Chưa đạt"}
                </Badge>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Số câu đúng:</span>
                  <span className="font-medium">
                    {quizResults.score}/{quizResults.totalQuestions}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span>Điểm đạt được:</span>
                  <span className="font-medium">{quizResults.percentage}%</span>
                </div>
              </div>

              {/* Hiển thị thời gian chờ nếu chưa đạt */}
              {!quizResults.isPassed && isButtonDisabled && (
                <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                  <Timer className="h-3.5 w-3.5" />
                  <span>
                    Có thể làm lại sau: {formatTimeRemaining(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mb-2 flex items-center justify-between gap-6 text-sm font-medium text-gray-700">
            <span>Tổng số câu</span>
            <Badge className="bg-success/20 text-primary hover:bg-success/30">
              {quizSet.quizIds ? quizSet.quizIds.length : 0}
            </Badge>
          </div>
          <p className="mb-4 text-sm font-normal text-gray-500 dark:text-gray-400">
            {quizResults && quizResults.isPassed
              ? "Bạn đã vượt qua bài kiểm tra này!"
              : "Bạn cần đạt 90% số câu hỏi để vượt qua bài kiểm tra."}
          </p>
          <Button
            className={cn(
              "flex w-full gap-2 capitalize",
              isButtonDisabled || isSubmitting
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "border-sky-500 text-sky-500 hover:bg-sky-500/5 hover:text-sky-500",
            )}
            variant="outline"
            onClick={
              quizResults && quizResults.isPassed
                ? handleReviewResults
                : () => setOpen(true)
            }
            disabled={isButtonDisabled || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Đang xử lý...</span>
              </>
            ) : quizResults ? (
              <>
                {quizResults.isPassed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>
                  {quizResults.isPassed
                    ? "Xem lại kết quả"
                    : isButtonDisabled
                      ? "Chờ để làm lại"
                      : "Làm lại bài kiểm tra"}
                </span>
              </>
            ) : (
              <>
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zm-6.49-5.84c.41-.73 1.18-1.16 1.63-1.8.48-.68.21-1.94-1.14-1.94-.88 0-1.32.67-1.5 1.23l-1.37-.57C11.51 5.96 12.52 5 13.99 5c1.23 0 2.08.56 2.51 1.26.37.6.58 1.73.01 2.57-.63.93-1.23 1.21-1.56 1.81-.13.24-.18.4-.18 1.18h-1.52c.01-.41-.06-1.08.26-1.66zm-.56 3.79c0-.59.47-1.04 1.05-1.04.59 0 1.04.45 1.04 1.04 0 .58-.44 1.05-1.04 1.05-.58 0-1.05-.47-1.05-1.05z"></path>
                </svg>
                <span>Làm bài kiểm tra</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <QuizKnowledgeTest
        open={open}
        setOpen={(value) => {
          setOpen(value);
          if (!value) {
            setIsReviewMode(false);
          }
        }}
        quizzes={quizzes}
        onComplete={handleQuizComplete}
        isReviewMode={isReviewMode}
        savedResults={savedResults}
      />
    </>
  );
};

export default Quiz;
