import AlertBanner from "@/components/alert-banner";
import { IconBadge } from "@/components/icon-badge";
import { ArrowLeft, BookOpenCheck, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { ModuleTitleForm } from "./_components/module-title-form";
import { LessonForm } from "./_components/lesson-form";
import { getModuleForInstructor } from "@/queries/modules";
import { replaceMongoIdInArray } from "@/lib/convertData";
import { ModuleActions } from "./_components/module-action";
import { ObjectId } from "mongoose";

const Module = async ({ params: { courseId, moduleId } }) => {
  const module = await getModuleForInstructor(moduleId);
  const sanitizedModule = sanitizeData(module);

  //console.log(module);

  // Sanitize fucntion for handle ObjectID and Buffer
  function sanitizeData(data) {
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

  const rawlessons = await replaceMongoIdInArray(module?.lessonIds).sort(
    (a, b) => a.order - b.order,
  );

  const lessons = sanitizeData(rawlessons);

  return (
    <>
      {!module?.active && (
        <AlertBanner
          label="This module is unpublished. It will not be visible in the course."
          variant="warning"
        />
      )}

      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/dashboard/courses/${courseId}`}
              className="mb-6 flex items-center text-sm transition hover:opacity-75"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại cấu hình khoá học
            </Link>
            <div className="flex items-center justify-end">
              <ModuleActions module={sanitizedModule} courseId={courseId} />
            </div>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Tuỳ chỉnh chương</h2>
              </div>
              <ModuleTitleForm
                initialData={{ title: module.title }}
                courseId={courseId}
                chapterId={moduleId}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={BookOpenCheck} />
                <h2 className="text-xl">Bài học trong chương hiện tại</h2>
              </div>
              <LessonForm
                initialData={lessons}
                moduleId={moduleId}
                courseId={courseId}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              {/* <IconBadge icon={Video} />
              <h2 className="text-xl">Add a video</h2> */}
            </div>
            {/* <ChapterVideoForm
              initialData={chapter}
              courseId={params.courseId}
              chapterId={params.chapterId}
            /> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Module;
