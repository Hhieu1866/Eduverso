"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const QuizKnowledgeTest = ({
  open,
  setOpen,
  quizzes = [],
  onComplete = () => {},
  isReviewMode = false,
  savedResults = null,
}) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tính toán tiến độ
  const totalQuizzes = quizzes.length;
  const progressPercentage =
    totalQuizzes > 0
      ? Math.floor(((currentQuizIndex + 1) / totalQuizzes) * 100)
      : 0;

  const currentQuiz = quizzes[currentQuizIndex] || {};

  useEffect(() => {
    // Reset state khi mở modal
    if (open) {
      if (isReviewMode && savedResults) {
        // Nếu đang ở chế độ xem lại, tính toán kết quả từ savedResults
        const correctCount = savedResults.details.filter(
          (r) => r.isCorrect,
        ).length;
        const percentage = Math.round(
          (correctCount / savedResults.totalQuestions) * 100,
        );
        const isPassed = percentage >= 90;

        // Thiết lập lại kết quả để hiển thị
        setQuizResults({
          totalQuestions: savedResults.totalQuestions,
          correctCount,
          percentage,
          isPassed,
          details: savedResults.details,
        });

        // Hiển thị ngay màn hình kết quả
        setShowResults(true);
      } else {
        // Nếu không phải chế độ xem lại, reset như bình thường
        setCurrentQuizIndex(0);
        setSelectedAnswers({});
        setQuizResults(null);
        setShowResults(false);
        setIsSubmitting(false);
      }
    }
  }, [open, isReviewMode, savedResults]);

  const handleAnswerSelect = (value) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuiz.id]: value,
    });
  };

  const handlePrevious = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuizIndex < totalQuizzes - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    }
  };

  const handleSubmit = () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    // Đặt showResults = true ngay lập tức để ngăn việc hiển thị câu hỏi
    setShowResults(true);

    try {
      // Tính toán kết quả
      const results = quizzes.map((quiz) => {
        const selectedAnswer = selectedAnswers[quiz.id] || "";

        // Tìm lựa chọn được chọn
        const selectedOption = quiz.options.find(
          (opt) => opt.label === selectedAnswer,
        );

        // Kiểm tra xem lựa chọn có đúng không
        const isCorrect = selectedOption ? selectedOption.isTrue : false;

        return {
          quizId: quiz.id,
          title: quiz.title,
          selectedAnswer,
          correctAnswer: quiz.options.find((opt) => opt.isTrue)?.label || "",
          isCorrect,
        };
      });

      // Đếm số câu đúng
      const correctCount = results.filter((r) => r.isCorrect).length;

      // Tính phần trăm đạt được
      const percentage = Math.round((correctCount / totalQuizzes) * 100);

      // Kiểm tra đạt yêu cầu (>=90%)
      const isPassed = percentage >= 90;

      setQuizResults({
        totalQuestions: totalQuizzes,
        correctCount,
        percentage,
        isPassed,
        details: results,
      });

      // Log dữ liệu trước khi gửi cho component cha
      console.log("Kết quả quiz trước khi gửi:", {
        score: correctCount,
        totalQuestions: totalQuizzes,
        detailsCount: results.length,
      });

      // Callback khi hoàn thành
      onComplete({
        score: correctCount,
        totalQuestions: totalQuizzes,
        details: results,
      });
    } catch (error) {
      console.error("Lỗi khi xử lý kết quả bài kiểm tra:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kiểm tra xem đã chọn câu trả lời cho tất cả các câu hỏi chưa
  const allQuestionsAnswered = quizzes.every(
    (quiz) => selectedAnswers[quiz.id],
  );

  // Xử lý đóng modal
  const handleCloseModal = () => {
    // Nếu đang ở chế độ xem lại hoặc đang hiển thị kết quả, đóng ngay
    if (isReviewMode || showResults) {
      setOpen(false);
      return;
    }

    // Nếu chưa làm bài nào thì có thể đóng ngay
    const hasAnyAnswer = Object.keys(selectedAnswers).length > 0;
    if (!hasAnyAnswer) {
      setOpen(false);
      return;
    }

    // Nếu đã chọn ít nhất một câu trả lời, hiển thị xác nhận
    if (
      window.confirm(
        "Bạn có chắc muốn thoát? Kết quả bài làm sẽ không được lưu.",
      )
    ) {
      setOpen(false);
    }
  };

  // Component hiển thị kết quả
  const ResultsView = () => (
    <div className="flex flex-col items-center px-4 py-8">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        {quizResults.isPassed ? (
          <CheckCircle className="h-12 w-12 text-green-500" strokeWidth={1.5} />
        ) : (
          <AlertCircle className="h-12 w-12 text-amber-500" strokeWidth={1.5} />
        )}
      </div>

      <h2 className="mb-4 text-center text-2xl font-bold">Kết quả kiểm tra</h2>

      <div className="mb-2 text-center text-xl font-medium">
        {quizResults.correctCount}/{quizResults.totalQuestions} câu đúng (
        {quizResults.percentage}%)
      </div>

      <div className="mb-6">
        {quizResults.isPassed ? (
          <p className="text-center font-medium text-green-600">
            Chúc mừng bạn đã hoàn thành bài kiểm tra!
          </p>
        ) : (
          <p className="text-center font-medium text-amber-500">
            Bạn cần cố gắng hơn trong lần sau
          </p>
        )}
        {!quizResults.isPassed && (
          <p className="mt-2 text-center text-sm text-gray-500">
            Bạn cần đạt ít nhất 90% câu hỏi để vượt qua bài kiểm tra
          </p>
        )}
      </div>

      <div className="mb-8 w-full space-y-4">
        {quizResults.details.map((result) => (
          <div key={result.quizId} className="rounded-lg border p-4">
            <div className="mb-2 flex items-start gap-2">
              {result.isCorrect ? (
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              )}
              <div>
                <div className="font-medium">{result.title}</div>
                <div className="mt-1 text-sm">
                  Câu trả lời của bạn:{" "}
                  <span
                    className={
                      result.isCorrect ? "text-green-600" : "text-red-600"
                    }
                  >
                    {result.selectedAnswer || "Không có câu trả lời"}
                  </span>
                </div>
                {!result.isCorrect && (
                  <div className="mt-1 text-sm text-green-600">
                    Đáp án đúng: {result.correctAnswer}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={() => setOpen(false)} className="w-full md:w-auto">
        Đóng
      </Button>
    </div>
  );

  // Component hiển thị câu hỏi
  const QuizView = () => (
    <>
      <div className="border-b px-4 py-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div className="font-medium">
            Câu hỏi {currentQuizIndex + 1}/{totalQuizzes}
          </div>
          <div className="w-full sm:w-48 md:w-64">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        <h3 className="mb-6 text-lg font-medium sm:text-xl">
          {currentQuiz.title}
        </h3>

        <RadioGroup
          value={selectedAnswers[currentQuiz.id] || ""}
          onValueChange={handleAnswerSelect}
          className="space-y-3"
        >
          {currentQuiz.options?.map((option) => (
            <div
              key={option.label}
              className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-gray-50"
            >
              <RadioGroupItem
                value={option.label}
                id={`option-${option.label}`}
              />
              <Label
                htmlFor={`option-${option.label}`}
                className="flex-grow cursor-pointer py-1"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col-reverse items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row sm:px-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuizIndex === 0 || isSubmitting}
          className="w-full sm:w-auto"
        >
          Câu trước
        </Button>

        {currentQuizIndex < totalQuizzes - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!selectedAnswers[currentQuiz.id] || isSubmitting}
            className="w-full sm:w-auto"
          >
            Câu tiếp theo
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswers[currentQuiz.id] || isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-faster-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                <span>Đang xử lý...</span>
              </div>
            ) : (
              "Nộp bài"
            )}
          </Button>
        )}
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogTitle className="sr-only">
          {isReviewMode ? "Kết quả bài kiểm tra" : "Kiểm tra kiến thức"}
        </DialogTitle>

        {showResults ? <ResultsView /> : <QuizView />}
      </DialogContent>
    </Dialog>
  );
};

export default QuizKnowledgeTest;
