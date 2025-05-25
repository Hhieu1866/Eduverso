import { IconBadge } from "@/components/icon-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LayoutDashboard } from "lucide-react";
import { Eye } from "lucide-react";
import { Video } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { FileText } from "lucide-react";
import { File } from "lucide-react";
import Link from "next/link";
import { LessonTitleForm } from "./lesson-title-form";
import { LessonDescriptionForm } from "./lesson-description-form";
import { LessonAccessForm } from "./lesson-access-form";
import { VideoUrlForm } from "./video-url-form";
import { TextContentForm } from "./text-content-form";
import { ContentTypeForm } from "./content-type-form";
import { DocumentUploadForm } from "./document-upload-form";
import { CourseActions } from "../../../_components/course-action";
import { LessonActions } from "./lesson-action";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const LessonModal = ({ open, setOpen, courseId, lesson, moduleId }) => {
  const [contentType, setContentType] = useState(
    lesson?.content_type || "video",
  );
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState(lesson);

  // Cập nhật state khi props lesson thay đổi
  useEffect(() => {
    if (lesson) {
      setContentType(lesson.content_type || "video");
      setCurrentLesson(lesson);
    }
  }, [lesson]);

  // Tách hàm fetchLessonData ra ngoài để truyền xuống DocumentUploadForm
  const fetchLessonData = async () => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/lessons/${lesson.id}`,
      );
      if (response.ok) {
        const updatedLesson = await response.json();
        setCurrentLesson({
          ...updatedLesson,
          id: updatedLesson._id || updatedLesson.id,
          documents: updatedLesson.documents || [],
        });
      }
    } catch (error) {
      console.error("Error fetching lesson data:", error);
    }
  };

  // Fetch dữ liệu mới nhất khi modal mở
  useEffect(() => {
    if (open && lesson?.id) {
      fetchLessonData();
    }
  }, [open, lesson?.id, courseId]);

  // Hàm cập nhật contentType từ ContentTypeForm
  const handleContentTypeChange = (newContentType) => {
    setContentType(newContentType);
  };

  function postDelete() {
    setOpen(false);
    router.refresh();
  }

  const handleClose = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* <DialogTrigger>Open</DialogTrigger> */}
      <DialogContent
        className="max-h-[90vh] w-[96%] overflow-y-auto sm:max-w-[1200px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Lesson Editor</DialogTitle>
          <DialogDescription>
            Customize and manage the settings for this lesson.
          </DialogDescription>
        </DialogHeader>

        <div>
          <div className="flex items-center justify-between">
            <div className="w-full">
              <Link
                href={`/dashboard/courses/${courseId}`}
                className="mb-6 flex items-center text-sm transition hover:opacity-75"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to course setup
              </Link>
              <div className="flex items-center justify-end">
                <LessonActions
                  lesson={currentLesson}
                  moduleId={moduleId}
                  onDelete={postDelete}
                />
              </div>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={LayoutDashboard} />
                  <h2 className="text-xl">Customize Your chapter</h2>
                </div>
                <LessonTitleForm
                  initialData={{ title: currentLesson?.title }}
                  courseId={courseId}
                  lessonId={currentLesson?.id}
                />
                <LessonDescriptionForm
                  initialData={{ description: currentLesson?.description }}
                  courseId={courseId}
                  lessonId={currentLesson?.id}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={Eye} />
                  <h2 className="text-xl">Access Settings</h2>
                </div>
                <LessonAccessForm
                  initialData={{ isFree: currentLesson?.access !== "private" }}
                  courseId={courseId}
                  lessonId={currentLesson?.id}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={File} />
                  <h2 className="text-xl">Tài liệu bài học</h2>
                </div>
                <DocumentUploadForm
                  initialData={{ documents: currentLesson?.documents }}
                  courseId={courseId}
                  moduleId={moduleId}
                  lessonId={currentLesson?.id}
                  onDocumentsChange={fetchLessonData}
                />
              </div>
            </div>
            <div>
              <div className="mb-4 flex items-center gap-x-2">
                <IconBadge icon={Video} />
                <h2 className="text-xl">Nội dung bài học</h2>
              </div>

              <ContentTypeForm
                initialData={{ content_type: contentType }}
                courseId={courseId}
                lessonId={currentLesson?.id}
                onContentTypeChange={handleContentTypeChange}
              />

              {(contentType === "video" || !contentType) && (
                <VideoUrlForm
                  initialData={{
                    url: currentLesson?.video_url,
                    duration: currentLesson?.duration,
                  }}
                  courseId={courseId}
                  lessonId={currentLesson?.id}
                />
              )}

              {contentType === "text" && (
                <TextContentForm
                  initialData={{
                    text_content: currentLesson?.text_content,
                  }}
                  courseId={courseId}
                  lessonId={currentLesson?.id}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
