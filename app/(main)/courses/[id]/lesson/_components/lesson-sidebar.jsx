import { CourseProgress } from "@/components/course-progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, FileText } from "lucide-react";
import { getCourseDetails } from "@/queries/courses";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { Watch } from "@/model/watch-model";
import { getReport } from "@/queries/reports";
import { GiveReview } from "./give-review";
import { DownloadCertificate } from "./download-certificate";
import Quiz from "./quiz";
import { LessonSidebarLink } from "./lesson-sidebar-link";
import { Separator } from "@/components/ui/separator";
import { EssayList } from "./essay-list";

export const LessonSidebar = async ({ courseId }) => {
  const course = await getCourseDetails(courseId);
  const loggedinUser = await getLoggedInUser();

  const report = await getReport({
    course: courseId,
    student: loggedinUser.id,
  });

  // Lọc lại một lần nữa để đảm bảo chỉ hiển thị module và lesson đã active
  // (Mặc dù query đã lọc, nhưng thêm lớp đảm bảo này để tránh lỗi)
  const publishedModules =
    course?.modules?.filter((module) => module.active === true) || [];

  const totalCompletedModules = report?.totalCompletedModeules
    ? report?.totalCompletedModeules.length
    : 0;

  const totalModules = publishedModules.length;

  let totalLessons = 0;
  let totalCompletedLessons = report?.totalCompletedLessons?.length || 0;

  if (publishedModules && Array.isArray(publishedModules)) {
    publishedModules.forEach((module) => {
      if (module.lessonIds && Array.isArray(module.lessonIds)) {
        // Chỉ đếm lesson đã được active
        const publishedLessons = module.lessonIds.filter(
          (lesson) => lesson.active === true,
        );
        totalLessons += publishedLessons.length;
      }
    });
  }

  let totalProgress = 0;
  if (totalLessons > 0 && totalCompletedLessons >= 0) {
    totalProgress = (totalCompletedLessons / totalLessons) * 100;
  }

  totalProgress = Math.max(0, Math.min(100, totalProgress));

  // Sanitize fucntion for handle ObjectID and Buffer
  function sanitizeData(data) {
    if (!data) return null;

    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (value instanceof ObjectId) {
          return value.toString();
        }
        if (Buffer.isBuffer(value)) {
          return value.toString("base64");
        }
        return value;
      }),
    );
  }

  let updatedModules = [];

  if (course?.modules && Array.isArray(course.modules)) {
    // Sắp xếp modules theo thứ tự và chỉ lấy những module đã active
    updatedModules = [...publishedModules].sort((a, b) => a.order - b.order);

    for (const module of updatedModules) {
      // Truy vấn trạng thái từng bài học cho user hiện tại
      if (module.lessonIds && Array.isArray(module.lessonIds)) {
        // Lọc chỉ lấy bài học đã được active
        module.lessonIds = module.lessonIds.filter(
          (lesson) => lesson.active === true,
        );

        for (const lesson of module.lessonIds) {
          const watch = await Watch.findOne({
            lesson: lesson._id,
            module: module._id,
            user: loggedinUser.id,
          }).lean();

          if (watch) {
            lesson.state = watch.state;
          }
        }
      }
    }
  }

  // Đầu tiên, tính số module đã hoàn tất
  let completedModulesCount = 0;

  for (const module of updatedModules) {
    if (module.lessonIds && module.lessonIds.length > 0) {
      const completedLessons = module.lessonIds.filter(
        (lesson) => lesson.state === "completed",
      );

      if (
        completedLessons.length === module.lessonIds.length &&
        module.lessonIds.length > 0
      ) {
        completedModulesCount++;
      }
    }
  }

  // Kiểm tra nếu đã hoàn thành tất cả các module
  const allModulesCompleted =
    completedModulesCount === updatedModules.length &&
    updatedModules.length > 0;

  const quizSetall = course?.quizSet;
  const isQuizComplete = report?.quizAssessment ? true : false;
  const quizSet = quizSetall ? sanitizeData(quizSetall) : null;

  // Lấy danh sách bài tự luận
  const essays = course?.essayIds || [];
  const hasEssays = essays.length > 0;

  return (
    <div className="flex h-full flex-col border-r bg-white">
      <div className="flex flex-col px-5 py-4">
        <h1 className="mb-2 truncate text-xl font-bold" title={course.title}>
          {course.title}
        </h1>
        <h2 className="text-base font-medium">Tiến độ khóa học</h2>
        <CourseProgress value={Math.round(totalProgress)} />
        <p className="text-xs text-muted-foreground">
          {totalCompletedLessons}/{totalLessons} bài học
        </p>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto">
        <Accordion
          type="multiple"
          defaultValue={["quiz", "essay", "review", "certificate"]}
        >
          {updatedModules.map((module, index) => (
            <AccordionItem
              key={module._id}
              value={module._id.toString()}
              className="border-b-0"
            >
              <AccordionTrigger className="px-5 py-3 hover:bg-slate-50">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="truncate">
                    Chương {index + 1}: {module.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="flex flex-col">
                  {module.lessonIds &&
                    Array.isArray(module.lessonIds) &&
                    module.lessonIds
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => {
                        const status = lesson.state;
                        const isCompleted = status === "completed";
                        const isStarted = status === "started";
                        const lessonUrl = `/courses/${courseId}/lesson?name=${lesson.slug}&module=${module.slug}`;

                        return (
                          <LessonSidebarLink
                            key={lesson._id}
                            lesson={lesson}
                            href={lessonUrl}
                            isCompleted={isCompleted}
                            isStarted={isStarted}
                          />
                        );
                      })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Final Items */}
        <div className="px-5 py-4">
          {/* Quiz Section */}
          {quizSet && (
            <div className="mb-4 rounded-lg border">
              <div className="flex items-center gap-3 border-b p-4">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">Bài kiểm tra</h3>
                  <p className="text-xs text-muted-foreground">
                    Kiểm tra kiến thức của bạn
                  </p>
                </div>
              </div>
              <div className="">
                <Quiz
                  courseId={courseId}
                  quizSet={quizSet}
                  isTaken={isQuizComplete}
                />
              </div>
            </div>
          )}

          {/* Essay Section */}
          {hasEssays && (
            <div className="mb-4 rounded-lg border">
              <div className="flex items-center gap-3 border-b p-4">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium">Bài tự luận</h3>
                  <p className="text-xs text-muted-foreground">
                    Làm bài tập tự luận
                  </p>
                </div>
              </div>
              <div className="">
                <EssayList courseId={courseId} essays={essays} />
              </div>
            </div>
          )}

          {/* Review Button */}
          <div className="mb-3">
            <GiveReview courseId={courseId} loginid={loggedinUser.id} />
          </div>

          {/* Certificate Button */}
          <div>
            <DownloadCertificate
              courseId={courseId}
              totalProgress={totalProgress}
              quizPassed={isQuizComplete}
              hasEssays={hasEssays}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
