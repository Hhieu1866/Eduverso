import React from "react";
import {
  BookCheck,
  PlayCircle,
  Clock,
  File,
  Lock,
  BookOpenCheck,
  BookMinus,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import CourseModuleList from "./module/CourseModuleList";

const CourseCurriculam = ({ course }) => {
  // Đảm bảo chỉ hiển thị modules và lessons đã được publish
  const publishedModules =
    course?.modules?.filter((module) => module.active === true) || [];

  // Lọc chỉ lấy các lesson đã publish trong mỗi module
  publishedModules.forEach((module) => {
    if (module.lessonIds && Array.isArray(module.lessonIds)) {
      module.lessonIds = module.lessonIds.filter(
        (lesson) => lesson.active === true,
      );
    }
  });

  // Tính tổng thời lượng của khóa học (chỉ từ các bài đã publish)
  const totalDuration =
    publishedModules
      ?.map((item) => {
        return item.lessonIds.reduce(function (acc, obj) {
          return acc + (obj.duration || 0);
        }, 0);
      })
      ?.reduce(function (acc, obj) {
        return acc + obj;
      }, 0) || 0;

  // Tính tổng số bài học (chỉ từ các bài đã publish)
  const totalLessons =
    publishedModules?.reduce((total, module) => {
      return total + (module.lessonIds?.length || 0);
    }, 0) || 0;

  return (
    <div className="">
      <div className="mb-8 rounded-lg bg-gray-50 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm">
            <BookCheck className="mb-2 h-8 w-8 text-primary" />
            <div className="flex items-center gap-1 text-base">
              <span className="font-bold">{publishedModules?.length || 0}</span>
              <span className="text-gray-600">Chương</span>
            </div>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm">
            <BookOpenCheck className="mb-2 h-8 w-8 text-primary" />
            <div className="flex items-center gap-1 text-base">
              <span className="font-bold">{totalLessons}</span>
              <span className="text-gray-600">Bài học</span>
            </div>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm">
            <Clock className="mb-2 h-8 w-8 text-primary" />
            <div className="flex items-center gap-1 text-base">
              <span className="font-bold">
                {Math.floor(totalDuration / 60)}p {totalDuration % 60}s
              </span>
              <span className="text-gray-600">Thời lượng</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-6 text-2xl font-bold">Nội dung khóa học</h2>

      <Accordion
        type="multiple"
        defaultValue={publishedModules?.map((_, i) => `item-${i + 1}`) || []}
        className="w-full"
      >
        {publishedModules?.map((module, index) => (
          <AccordionItem key={module.id || index} value={`item-${index + 1}`}>
            <AccordionTrigger className="mb-px bg-gray-50 px-4 py-4 hover:bg-gray-100 hover:no-underline data-[state=open]:rounded-b-none">
              <div className="flex w-full flex-col gap-2 text-left md:flex-row md:items-center">
                <span className="flex-grow font-semibold">
                  Chương {index + 1}: {module.title}
                </span>
                <span className="text-sm text-gray-500">
                  {module.lessonIds?.length || 0} bài •{" "}
                  {Math.floor(
                    (module.lessonIds?.reduce(
                      (acc, lesson) => acc + (lesson.duration || 0),
                      0,
                    ) || 0) / 60,
                  )}
                  p{" "}
                  {(module.lessonIds?.reduce(
                    (acc, lesson) => acc + (lesson.duration || 0),
                    0,
                  ) || 0) % 60}
                  s
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-0">
              <div className="overflow-hidden rounded-b-lg bg-white">
                {module.lessonIds?.map((lesson, lessonIndex) => (
                  <div
                    key={lesson._id || lessonIndex}
                    className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <BookMinus className="h-5 w-5 flex-shrink-0 text-primary" />
                      <span>{lesson.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {Math.floor((lesson.duration || 0) / 60)}:
                        {(lesson.duration || 0) % 60 < 10
                          ? "0" + ((lesson.duration || 0) % 60)
                          : (lesson.duration || 0) % 60}
                      </span>
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default CourseCurriculam;
