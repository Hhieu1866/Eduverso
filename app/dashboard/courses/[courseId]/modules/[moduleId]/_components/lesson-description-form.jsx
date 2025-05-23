"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateLesson } from "@/app/actions/lesson";

const formSchema = z.object({
  description: z.string().min(1, {
    message: "Mô tả là bắt buộc!",
  }),
});

export const LessonDescriptionForm = ({ initialData, courseId, lessonId }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [description, setDescription] = useState(initialData?.description);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      await updateLesson(lessonId, values);
      setDescription(values.description);
      toast.success("Đã cập nhật mô tả bài học");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Đã xảy ra lỗi, vui lòng thử lại");
    }
  };

  return (
    <div className="mt-6 rounded-md border bg-slate-100 p-4">
      <div className="flex items-center justify-between font-medium">
        Mô tả bài học
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>Hủy</>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa mô tả
            </>
          )}
        </Button>
      </div>
      {!isEditing && <p className="mt-2 text-sm">{description}</p>}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="Ví dụ: 'Bài học này giúp bạn ...'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Lưu
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
