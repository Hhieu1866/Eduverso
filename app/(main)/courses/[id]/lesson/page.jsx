import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getCourseDetails } from "@/queries/courses";
import {
  replaceMongoIdInArray,
  replaceMongoIdInObject,
} from "@/lib/convertData";
import { getLessonBySlug } from "@/queries/lessons";
import { LessonVideo } from "./_components/lesson-video";
import { DownloadButton } from "@/components/download-button";
import { FileText, Download, Clock, Calendar, Paperclip } from "lucide-react";
import { CompleteLessonButton } from "./_components/complete-lesson-button";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { Watch } from "@/model/watch-model";
import { redirect } from "next/navigation";
import { createCacheKey, deleteCache } from "@/lib/cache";

const LessonPage = async ({ params, searchParams }) => {
  const id = params.id;
  const nameParam = searchParams.name;
  const moduleParam = searchParams.module;

  // Lấy thông tin người dùng đăng nhập
  const loggedinUser = await getLoggedInUser();
  if (!loggedinUser) redirect("/login");

  // Xóa cache báo cáo khi load trang bài học mới để đảm bảo dữ liệu mới nhất
  const reportCacheKey = createCacheKey("report", id, loggedinUser.id);
  deleteCache(reportCacheKey);

  const course = await getCourseDetails(id);

  // Lọc ra các module đã publish (active: true)
  const publishedModules =
    course?.modules?.filter((module) => module.active === true) || [];

  // Sắp xếp module theo thứ tự
  const allModules = replaceMongoIdInArray(publishedModules).toSorted(
    (a, b) => a.order - b.order,
  );

  // Kiểm tra xem allModules có phần tử nào không
  if (!allModules || allModules.length === 0) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-semibold">
          Không tìm thấy bài học nào trong khóa học này
        </h1>
        <Button asChild>
          <a href="/courses">Quay lại danh sách khóa học</a>
        </Button>
      </div>
    );
  }

  const firstModule = allModules[0];

  // Lọc các lesson đã publish
  const publishedLessons =
    firstModule?.lessonIds?.filter((lesson) => lesson.active === true) || [];

  const defaultLesson =
    publishedLessons.length > 0
      ? replaceMongoIdInObject(
          publishedLessons.toSorted((a, b) => a.order - b.order)[0],
        )
      : null;

  if (!defaultLesson) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-semibold">
          Không tìm thấy bài học nào trong khóa học này
        </h1>
        <Button asChild>
          <a href="/courses">Quay lại danh sách khóa học</a>
        </Button>
      </div>
    );
  }

  // Lấy thông tin bài học yêu cầu
  const requestedLesson = nameParam
    ? await getLessonBySlug(nameParam)
    : defaultLesson;

  // Kiểm tra xem bài học có được publish không
  if (!requestedLesson?.active) {
    // Nếu bài học không được publish, chuyển hướng về trang chi tiết khóa học
    redirect(`/courses/${id}`);
  }

  const lessonToPay = requestedLesson;
  const defaultModule = moduleParam ?? (firstModule?.slug || "");

  // Get current module
  const currentModule =
    allModules.find((module) => module.slug === defaultModule) || firstModule;

  // Kiểm tra xem module có được publish không
  if (!currentModule?.active) {
    // Nếu module không được publish, chuyển hướng về trang chi tiết khóa học
    redirect(`/courses/${id}`);
  }

  // Kiểm tra tham số truy cập từ đâu
  const fromComplete = searchParams.fromComplete === "true";

  // Sửa logic kiểm tra để không tự động đánh dấu bài là completed
  const watch = await Watch.findOne({
    lesson: lessonToPay.id,
    module: currentModule.id,
    user: loggedinUser.id,
  }).lean();

  if (!watch) {
    // Nếu chưa có record watch, tạo record started
    await Watch.create({
      lesson: lessonToPay.id,
      module: currentModule.id,
      user: loggedinUser.id,
      state: "started",
      lastTime: 0,
      created_at: Date.now(),
      modified_at: Date.now(),
    });
    lessonToPay.state = "started";
  } else {
    // Cập nhật trạng thái bài học hiện tại theo đúng dữ liệu trong database
    lessonToPay.state = watch.state;
  }

  // Lấy tất cả bài học trong module hiện tại và sắp xếp theo thứ tự
  const currentModuleLessons = currentModule?.lessonIds
    ? replaceMongoIdInArray(currentModule.lessonIds).toSorted(
        (a, b) => a.order - b.order,
      )
    : [];

  // Tìm vị trí bài học hiện tại
  const currentLessonIndex = currentModuleLessons.findIndex(
    (lesson) => lesson.id === lessonToPay.id,
  );

  // Tìm bài học tiếp theo trong cùng module
  let nextLessonUrl = null;

  // Chỉ xác định nextLessonUrl nếu bài học hiện tại đã hoàn thành
  if (lessonToPay.state === "completed") {
    if (
      currentLessonIndex !== -1 &&
      currentLessonIndex < currentModuleLessons.length - 1
    ) {
      // Có bài tiếp theo trong cùng module
      const nextLesson = currentModuleLessons[currentLessonIndex + 1];
      nextLessonUrl = `/courses/${id}/lesson?name=${nextLesson.slug}&module=${currentModule.slug}`;
    } else {
      // Kiểm tra xem có module tiếp theo không
      const currentModuleIndex = allModules.findIndex(
        (module) => module.id === currentModule.id,
      );
      if (
        currentModuleIndex !== -1 &&
        currentModuleIndex < allModules.length - 1
      ) {
        // Có module tiếp theo
        const nextModule = allModules[currentModuleIndex + 1];
        if (nextModule.lessonIds && nextModule.lessonIds.length > 0) {
          // Lấy bài học đầu tiên của module tiếp theo
          const firstLessonOfNextModule = replaceMongoIdInObject(
            nextModule.lessonIds.toSorted((a, b) => a.order - b.order)[0],
          );
          nextLessonUrl = `/courses/${id}/lesson?name=${firstLessonOfNextModule.slug}&module=${nextModule.slug}`;
        }
      }
    }
  }

  // console.log("Lesson data:", {
  //   id: lessonToPay?.id,
  //   title: lessonToPay?.title,
  //   content_type: lessonToPay?.content_type,
  //   video_url: lessonToPay?.video_url,
  // });

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return "Chưa xác định";
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} giờ ${remainingMinutes > 0 ? `${remainingMinutes} phút` : ""}`;
  };

  // Hàm nhận diện icon file giống Lesson Editor
  function getFileIcon(doc) {
    return <Paperclip className="h-5 w-5 text-primary" />;
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Video Player */}
      <div className="mb-6 overflow-hidden rounded-xl bg-black">
        <LessonVideo
          courseId={id}
          lesson={lessonToPay}
          module={defaultModule}
        />
      </div>

      {/* Lesson Content */}
      <div className="space-y-8">
        {/* Title & Meta */}
        <div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            {lessonToPay.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(
                  lessonToPay.createdAt || Date.now(),
                ).toLocaleDateString("vi-VN")}
              </span>
            </div>
            {lessonToPay.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(lessonToPay.duration)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>{currentModule?.title}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Lesson Documents - Tài liệu kèm theo */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Tài liệu kèm theo
          </h2>
          {Array.isArray(lessonToPay.documents) &&
          lessonToPay.documents.length > 0 ? (
            <ul className="space-y-2">
              {lessonToPay.documents.map((doc, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 rounded border border-gray-200 bg-gray-50 p-3"
                >
                  {getFileIcon(doc)}
                  <span className="flex-1 truncate font-medium text-gray-800">
                    {doc.name || `Tài liệu ${idx + 1}`}
                  </span>
                  {doc.fileUrl && (
                    <a
                      href={`/api/upload/course-documents/download?url=${encodeURIComponent(doc.fileUrl)}&name=${encodeURIComponent(doc.name || `Tài liệu ${idx + 1}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1 text-sm font-semibold text-white transition hover:bg-primary/90"
                    >
                      <Download className="h-4 w-4" /> Tải xuống
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="italic text-gray-500">
              Không có tài liệu kèm theo cho bài học này
            </div>
          )}
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Mô tả bài học</h2>
          <div className="prose prose-slate max-w-none">
            {lessonToPay.description ? (
              <div
                dangerouslySetInnerHTML={{ __html: lessonToPay.description }}
              />
            ) : (
              <p className="text-gray-500">Không có mô tả cho bài học này.</p>
            )}
          </div>

          {/* Nút đánh dấu hoàn thành bài học */}
          <div className="mt-8 flex justify-center">
            <CompleteLessonButton
              courseId={id}
              lessonId={lessonToPay.id}
              moduleSlug={defaultModule}
              initialState={lessonToPay.state}
              nextLessonUrl={nextLessonUrl}
            />
          </div>
        </div>

        {/* Attachments */}
        {lessonToPay.attachment && (
          <>
            <Separator />
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Tài liệu bài học
              </h2>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Tài liệu bài học
                      </p>
                      <p className="text-sm text-gray-500">
                        {lessonToPay.attachment.name || "lecture-materials.pdf"}
                      </p>
                    </div>
                  </div>
                  <DownloadButton
                    url={lessonToPay.attachment.url}
                    filename={
                      lessonToPay.attachment.name || "lecture-materials.pdf"
                    }
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    Tải xuống
                  </DownloadButton>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonPage;
