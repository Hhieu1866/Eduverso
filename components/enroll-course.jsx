"use client";
import React, { useState, useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const EnrollCourse = ({ asLink, courseId, className }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Kiểm tra xem người dùng đã đăng ký khóa học này chưa khi component được tải
  useEffect(() => {
    // Chỉ kiểm tra khi có session
    if (!session?.user) return;

    let isMounted = true;
    const checkEnrollment = async () => {
      try {
        const response = await fetch("/api/courses/enroll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId, checkOnly: true }),
        });

        if (!isMounted) return;

        const data = await response.json();
        if (response.ok && data.isEnrolled) {
          setIsEnrolled(true);

          // Kiểm tra xem học viên đã bắt đầu học chưa
          try {
            const watchResponse = await fetch(
              `/api/lesson-watch?courseId=${courseId}&checkOnly=true`,
            );
            if (watchResponse.ok) {
              const watchData = await watchResponse.json();
              setHasStarted(watchData.hasStarted);
            }
          } catch (error) {
            console.error("Lỗi khi kiểm tra tiến trình học:", error);
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra đăng ký:", error);
      }
    };

    checkEnrollment();

    // Cleanup function để tránh memory leak
    return () => {
      isMounted = false;
    };
  }, [courseId, session]);

  const handleEnroll = async () => {
    if (!session?.user) {
      toast.error("Bạn cần đăng nhập để đăng ký khóa học");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      // console.log("Bắt đầu đăng ký khóa học:", courseId);

      // Gọi API để đăng ký khóa học
      const response = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      // Kiểm tra phản hồi
      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi đăng ký khóa học");
      }

      setIsEnrolled(true);
      toast.success(data.message || "Đăng ký khóa học thành công!");

      // Làm mới trang để cập nhật trạng thái
      router.refresh();

      // Không tự động chuyển trang sau khi đăng ký thành công
    } catch (error) {
      console.error("Lỗi khi đăng ký khóa học:", error);
      toast.error(error.message || "Có lỗi xảy ra khi đăng ký khóa học");
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu đã đăng ký, hiển thị nút Xem chi tiết giống như trong CourseCard
  if (isEnrolled) {
    return (
      <Link href={`/courses/${courseId}`}>
        <Button
          size={asLink ? "sm" : "default"}
          className={
            asLink
              ? "flex items-center justify-between"
              : "flex w-full items-center justify-between"
          }
        >
          <p>Xem chi tiết</p>
        </Button>
      </Link>
    );
  }

  // Nếu chưa đăng ký, hiển thị nút đăng ký
  return (
    <>
      {asLink ? (
        <Button
          onClick={handleEnroll}
          variant="ghost"
          className="h-7 gap-1 text-xs text-sky-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 animate-faster-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              Đăng ký
              <ArrowRight className="w-3" />
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleEnroll}
          className={cn(buttonVariants({ size: "lg" }), className)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-faster-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            "Đăng ký ngay"
          )}
        </Button>
      )}
    </>
  );
};

export default EnrollCourse;
