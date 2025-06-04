"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SidebarLessons } from "./sidebar-lessons";
import { replaceMongoIdInArray } from "@/lib/convertData";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";

export const SidebarModules = ({ courseId, modules }) => {
  const seachParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // State để lưu trữ modules đã xử lý
  const [processedModules, setProcessedModules] = useState([]);

  // State để theo dõi thời điểm cập nhật
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Ref để lưu trữ thời gian refresh cuối cùng để tránh refresh quá thường xuyên
  const lastRefreshTimeRef = useRef(Date.now());

  // Ref để lưu ID của timer
  const refreshTimerRef = useRef(null);

  // Xử lý modules khi component mount hoặc khi modules thay đổi
  useEffect(() => {
    if (modules && modules.length > 0) {
      const sortedModules = replaceMongoIdInArray(modules).toSorted(
        (a, b) => a.order - b.order,
      );
      setProcessedModules(sortedModules);
    }
  }, [modules, lastRefresh]);

  const query = seachParams.get("name");

  // Tìm module chứa bài học hiện tại để mở rộng accordion
  const expandModule = processedModules.find((module) => {
    return module.lessonIds?.find((lesson) => {
      return lesson.slug === query;
    });
  });

  const expandModuleId = expandModule?.id ?? (processedModules[0]?.id || "");

  // Kiểm tra xem có cần refresh hay không
  const shouldThrottleRefresh = () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;

    // Chỉ cho phép refresh nếu khoảng thời gian từ lần refresh cuối đến hiện tại lớn hơn 1000ms
    return timeSinceLastRefresh < 1000;
  };

  // Hàm tải lại sidebarmodules khi có thay đổi với useCallback
  const refreshSidebar = useCallback(() => {
    // Kiểm tra xem có nên giới hạn refresh hay không
    if (shouldThrottleRefresh()) {
      // Nếu đã có timer chờ refresh, không cần tạo timer mới
      if (refreshTimerRef.current) return;

      // Đặt timeout để đảm bảo không refresh quá thường xuyên
      refreshTimerRef.current = setTimeout(() => {
        // Refresh router để lấy dữ liệu mới
        router.refresh();
        // Cập nhật thời điểm làm mới để kích hoạt useEffect
        setLastRefresh(Date.now());
        // Cập nhật thời gian refresh cuối cùng
        lastRefreshTimeRef.current = Date.now();
        // Xóa timer
        refreshTimerRef.current = null;
      }, 1000);

      return;
    }

    // Nếu không cần giới hạn, thực hiện refresh ngay lập tức
    router.refresh();
    setLastRefresh(Date.now());
    lastRefreshTimeRef.current = Date.now();
  }, [router]);

  // Kiểm tra sessionStorage khi component mount để xem có thay đổi tiến trình nào không
  useEffect(() => {
    try {
      const progressKey = `course_progress_${courseId}`;
      const progressData = sessionStorage.getItem(progressKey);

      if (progressData) {
        const data = JSON.parse(progressData);
        // Nếu có thay đổi và thời gian cập nhật gần đây (trong vòng 30 giây)
        if (data.timestamp && Date.now() - data.timestamp < 30000) {
          // Làm mới sidebar để hiển thị thay đổi mới nhất
          refreshSidebar();
        }
      }
    } catch (e) {
      console.error("Lỗi khi đọc dữ liệu từ sessionStorage:", e);
    }
  }, [courseId, refreshSidebar]);

  // Thiết lập interval để làm mới sidebar định kỳ (mỗi 10 giây)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSidebar();
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshSidebar]);

  // Lắng nghe sự kiện hoàn thành bài học với logic cải tiến
  useEffect(() => {
    const handleLessonCompleted = (event) => {
      const { courseId: completedCourseId, moduleSlug } = event.detail;

      // Chỉ làm mới nếu cùng khóa học
      if (completedCourseId === courseId) {
        console.log(
          `Nhận sự kiện hoàn thành bài học trong module ${moduleSlug} - làm mới sidebar`,
        );

        // Đặt timeout ngắn để đảm bảo server đã cập nhật dữ liệu
        setTimeout(() => {
          refreshSidebar();
        }, 100);

        // Và làm mới lần nữa sau một khoảng thời gian dài hơn
        setTimeout(() => {
          refreshSidebar();
        }, 1000);
      }
    };

    // Đăng ký lắng nghe sự kiện
    document.addEventListener("lessonCompleted", handleLessonCompleted);

    // Hủy đăng ký khi component unmount
    return () => {
      document.removeEventListener("lessonCompleted", handleLessonCompleted);

      // Xóa timer nếu còn tồn tại
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [courseId, refreshSidebar]);

  if (processedModules.length === 0) {
    return <div className="p-4">Đang tải...</div>;
  }

  return (
    <Accordion
      defaultValue={expandModuleId}
      type="single"
      collapsible
      className="w-full px-6"
    >
      {processedModules.map((module) => (
        <AccordionItem key={module.id} className="border-0" value={module.id}>
          <AccordionTrigger>{module.title} </AccordionTrigger>

          <SidebarLessons
            courseId={courseId}
            lessons={module.lessonIds}
            module={module.slug}
          />
        </AccordionItem>
      ))}
    </Accordion>
  );
};
