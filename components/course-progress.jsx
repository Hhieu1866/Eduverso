"use client";

import { cn } from "@/lib/utils";
import { Progress } from "./ui/progress";
import { useEffect, useState, useRef } from "react";

const colorByVariant = {
  default: "text-sky-700",
  success: "text-emerald-700",
};

const sizeByVariant = {
  default: "text-sm",
  sm: "text-xs",
};

// Hàm trợ giúp để kiểm tra giá trị tiến trình từ sessionStorage
const getProgressFromStorage = (courseId) => {
  try {
    if (typeof window === "undefined") return null;

    const progressKey = `course_progress_${courseId}`;
    const data = sessionStorage.getItem(progressKey);

    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.percentage !== undefined) {
        return parsed.percentage;
      }
    }
    return null;
  } catch (e) {
    console.error("Lỗi khi đọc tiến trình từ sessionStorage:", e);
    return null;
  }
};

export const CourseProgress = ({ value = 0, variant, size, courseId }) => {
  // Đảm bảo giá trị value luôn hợp lệ
  const safeValue = isNaN(value) || value < 0 ? 0 : value > 100 ? 100 : value;

  // State để lưu giá trị hiện tại cho animation
  const [currentValue, setCurrentValue] = useState(safeValue);
  const prevValueRef = useRef(safeValue);

  // Ref để theo dõi animation đang chạy
  const animationRef = useRef(null);

  // Tạo hiệu ứng chuyển đổi khi giá trị thay đổi
  useEffect(() => {
    // Xóa animation hiện tại nếu có
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    // Nếu giá trị không đổi đáng kể, không cần animation
    if (Math.abs(prevValueRef.current - safeValue) < 0.5) {
      return;
    }

    // Nếu giá trị tăng, thêm hiệu ứng chuyển đổi từ từ
    if (safeValue > prevValueRef.current) {
      // Tạo animation tăng dần từ giá trị cũ đến giá trị mới
      const startValue = prevValueRef.current;
      const endValue = safeValue;
      const duration = 600; // 600ms - nhanh hơn trước
      const stepTime = 30; // 30ms mỗi bước - mượt hơn
      const steps = duration / stepTime;
      const increment = (endValue - startValue) / steps;

      let currentStep = 0;
      animationRef.current = setInterval(() => {
        currentStep++;
        const nextValue = startValue + increment * currentStep;

        if (currentStep >= steps) {
          setCurrentValue(endValue);
          clearInterval(animationRef.current);
          animationRef.current = null;
        } else {
          setCurrentValue(nextValue);
        }
      }, stepTime);
    } else {
      // Nếu giảm, chỉ áp dụng animation ngắn
      const startValue = prevValueRef.current;
      const endValue = safeValue;
      const duration = 300; // 300ms - nhanh hơn khi giảm
      const stepTime = 30;
      const steps = duration / stepTime;
      const decrement = (startValue - endValue) / steps;

      let currentStep = 0;
      animationRef.current = setInterval(() => {
        currentStep++;
        const nextValue = startValue - decrement * currentStep;

        if (currentStep >= steps) {
          setCurrentValue(endValue);
          clearInterval(animationRef.current);
          animationRef.current = null;
        } else {
          setCurrentValue(nextValue);
        }
      }, stepTime);
    }

    prevValueRef.current = safeValue;

    // Cleanup
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [safeValue]);

  // Kiểm tra sessionStorage nếu có courseId
  useEffect(() => {
    if (!courseId) return;

    const checkSessionStorage = () => {
      const storedValue = getProgressFromStorage(courseId);
      if (storedValue !== null && Math.abs(storedValue - safeValue) > 0.5) {
        // Nếu giá trị trong sessionStorage khác với giá trị hiện tại, cập nhật
        prevValueRef.current = currentValue;
        setCurrentValue(storedValue);
      }
    };

    // Kiểm tra khi component mount
    checkSessionStorage();

    // Sự kiện khi storage thay đổi
    const handleStorageChange = () => {
      checkSessionStorage();
    };

    window.addEventListener("storage", handleStorageChange);

    // Gỡ bỏ event listener khi component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [courseId, safeValue]);

  return (
    <div>
      <Progress
        value={currentValue}
        variant={variant}
        className={cn(
          "h-2 transition-all duration-300",
          !variant && "text-sky-700",
        )}
      />
      <p
        className={cn(
          "mt-2 font-medium text-sky-700",
          colorByVariant[variant || "default"],
          sizeByVariant[size || "default"],
          "transition-all duration-300",
        )}
      >
        {Math.round(currentValue)}% Complete
      </p>
    </div>
  );
};
