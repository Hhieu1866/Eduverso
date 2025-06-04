import { CourseProgress } from "@/components/course-progress";
import { ReviewModal } from "./review-modal";
import { DownloadCertificate } from "./download-certificate";
import { GiveReview } from "./give-review";
import { SidebarModules } from "./sidebar-modules";
import { getCourseDetails } from "@/queries/courses";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { getReport } from "@/queries/reports";
import { dbConnect } from "@/service/mongo";
import { RequireRole } from "./require-role";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const CourseSidebar = async ({ courseId, children }) => {
  const loggedInUser = await getLoggedInUser();
  if (!loggedInUser) return;

  await dbConnect();
  const course = await getCourseDetails(courseId);
  if (!course) return null;

  // Kiểm tra xem user có phải là enrolled user không
  const filter = {
    course: courseId,
    student: loggedInUser._id,
  };

  // Lấy báo cáo kết quả học tập của user hiện tại
  const report = await getReport(filter);

  // Không bắt buộc phải có kết quả quiz
  const quizAssessment = report?.quizAssessment;

  const modules = course?.modules;

  // Tính tỷ lệ hoàn thành khóa học
  const calculateCourseCompletion = (report) => {
    if (!report?.completedLessons || !course?.totalLessons)
      return { value: 0, lesson: 0 };

    const percent = Math.round(
      (report.completedLessons.length / course.totalLessons) * 100,
    );

    const numCompletedLessons = report.completedLessons.length;

    return { value: percent, lesson: numCompletedLessons };
  };

  const { value, lesson } = calculateCourseCompletion(report);

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto bg-white shadow-sm">
      <div className="flex flex-col">
        <div className="flex flex-col p-8">
          <h2 className="line-clamp-2 text-xl font-bold">{course.title}</h2>
        </div>
        <div className="px-8">
          <CourseProgressClient
            courseId={courseId}
            initialValue={value}
            totalLessons={course.totalLessons}
            completedLessons={lesson}
          />
        </div>
        {children}
        <div className="flex flex-col px-6 py-4">
          <RequireRole role="student">
            {value === 100 && (
              <>
                <DownloadCertificate />
                <div className="mb-4"></div>
                <GiveReview />
                <div className="mb-4"></div>
              </>
            )}

            <div className="mb-4 font-medium"></div>
            <ReviewModal courseId={courseId} />
            <div className="mb-4"></div>
          </RequireRole>
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <SidebarModules courseId={courseId} modules={modules} />
      </div>
    </div>
  );
};

// Component client cho CourseProgress để cập nhật theo thời gian thực
("use client");
export const CourseProgressClient = ({
  courseId,
  initialValue,
  totalLessons,
  completedLessons,
}) => {
  const [progress, setProgress] = useState({
    value: initialValue,
    completedCount: completedLessons,
  });
  const router = useRouter();

  // Lắng nghe sự kiện lessonCompleted một cách trực tiếp
  useEffect(() => {
    const handleLessonCompleted = (event) => {
      // Kiểm tra xem sự kiện có thuộc về khóa học hiện tại không
      if (event.detail?.courseId === courseId) {
        // console.log("Đã nhận sự kiện hoàn thành bài học:", event.detail);

        // Tính toán giá trị tiến trình mới
        const newCount = progress.completedCount + 1;
        const newValue = Math.min(
          Math.round((newCount / totalLessons) * 100),
          100,
        );

        // Cập nhật state
        setProgress({
          value: newValue,
          completedCount: newCount,
        });

        // console.log(
        //   `Tiến trình cập nhật: ${newCount}/${totalLessons} bài học (${newValue}%)`,
        // );

        // Refresh dữ liệu từ server
        router.refresh();
      }
    };

    // Đăng ký lắng nghe trên window để đảm bảo nhận được sự kiện
    window.addEventListener("lessonCompleted", handleLessonCompleted);

    return () => {
      window.removeEventListener("lessonCompleted", handleLessonCompleted);
    };
  }, [courseId, progress.completedCount, router, totalLessons]);

  // Cập nhật khi props từ server thay đổi
  useEffect(() => {
    if (completedLessons > progress.completedCount) {
      const newValue = Math.min(
        Math.round((completedLessons / totalLessons) * 100),
        100,
      );

      setProgress({
        value: newValue,
        completedCount: completedLessons,
      });

      // console.log(
      //   `Cập nhật từ server: ${completedLessons}/${totalLessons} bài học (${newValue}%)`,
      // );
    }
  }, [completedLessons, progress.completedCount, totalLessons]);

  return (
    <div>
      <CourseProgress
        value={progress.value}
        courseId={courseId}
        variant={progress.value === 100 ? "success" : "default"}
      />
      <div className="mt-2 text-sm text-muted-foreground">
        {progress.completedCount}/{totalLessons} bài học đã hoàn thành
      </div>
    </div>
  );
};
