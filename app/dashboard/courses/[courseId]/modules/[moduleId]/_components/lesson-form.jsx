"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LessonList } from "./lesson-list";
import { LessonModal } from "./lesson-modal";
import { getSlug } from "@/lib/convertData";
import { createLesson, reOrderLesson } from "@/app/actions/lesson";

const formSchema = z.object({
  title: z.string().min(1),
});

export const LessonForm = ({ initialData, moduleId, courseId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [lessons, setLessons] = useState(initialData);
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [lessonToEdit, setLessonToEdit] = useState(null);

  useEffect(() => {
    setLessons(initialData);
  }, [initialData]);

  const toggleCreating = () => setIsCreating((current) => !current);
  const toggleEditing = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append("title", values?.title);
      formData.append("slug", getSlug(values?.title));
      formData.append("moduleId", moduleId);
      formData.append("order", lessons.length);

      const lesson = await createLesson(formData);

      setLessons((currentLessons) => [
        ...currentLessons,
        {
          id: lesson?._id.toString(),
          title: values.title,
        },
      ]);
      toast.success("Lesson created");
      toggleCreating();
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const onReorder = async (updateData) => {
    try {
      setIsUpdating(true);
      await reOrderLesson(updateData);
      toast.success("Đã sắp xếp lại thứ tự bài học");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = async (id) => {
    try {
      // Fetch lesson mới nhất từ server trước khi mở modal
      const response = await fetch(`/api/courses/${courseId}/lessons/${id}`);
      if (response.ok) {
        const updatedLesson = await response.json();
        setLessonToEdit({
          ...updatedLesson,
          id: updatedLesson._id || updatedLesson.id,
          documents: updatedLesson.documents || [],
        });
      } else {
        // Fallback nếu API không tồn tại hoặc lỗi
        const foundLesson = lessons.find((lesson) => lesson.id === id);
        setLessonToEdit({
          ...foundLesson,
          documents: foundLesson?.documents || [],
        });
      }
      setIsEditing(true);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      // Fallback nếu có lỗi
      const foundLesson = lessons.find((lesson) => lesson.id === id);
      setLessonToEdit({
        ...foundLesson,
        documents: foundLesson?.documents || [],
      });
      setIsEditing(true);
    }
  };

  const handleModalClose = () => {
    setIsEditing(false);
    router.refresh();
  };

  return (
    <div className="relative mt-6 rounded-md border bg-slate-100 p-4">
      {isUpdating && (
        <div className="absolute right-0 top-0 flex h-full w-full items-center justify-center rounded-md bg-gray-500/20">
          <Loader2 className="h-6 w-6 animate-spin text-sky-700" />
        </div>
      )}
      <div className="flex items-center justify-between font-medium">
        Các bài học
        <Button variant="ghost" onClick={toggleCreating}>
          {isCreating ? (
            <>Hủy</>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm bài học
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Introduction to the course...'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!isValid || isSubmitting} type="submit">
              Create
            </Button>
          </form>
        </Form>
      )}
      {!isCreating && (
        <div
          className={cn(
            "mt-2 text-sm",
            !lessons?.length && "italic text-slate-500",
          )}
        >
          {!lessons?.length && "Chưa có bài học nào"}
          <LessonList
            onEdit={onEdit}
            onReorder={onReorder}
            items={lessons || []}
          />
        </div>
      )}
      {!isCreating && (
        <p className="mt-4 text-xs text-muted-foreground">
          Kéo thả để chỉnh thứ tự các bài học
        </p>
      )}
      <LessonModal
        open={isEditing}
        setOpen={handleModalClose}
        courseId={courseId}
        lesson={lessonToEdit}
        moduleId={moduleId}
      />
    </div>
  );
};
