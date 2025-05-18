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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateLesson } from "@/app/actions/lesson";

const formSchema = z.object({
  content_type: z.string().min(1, {
    message: "Vui lòng chọn loại nội dung",
  }),
});

export const ContentTypeForm = ({
  initialData,
  courseId,
  lessonId,
  onContentTypeChange,
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [contentType, setContentType] = useState(
    initialData?.content_type || "video",
  );

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content_type: contentType,
    },
  });

  // Cập nhật form khi initialData thay đổi
  useEffect(() => {
    form.reset({ content_type: initialData?.content_type || "video" });
    setContentType(initialData?.content_type || "video");
  }, [initialData, form]);

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      await updateLesson(lessonId, { content_type: values.content_type });

      // Cập nhật state nội bộ
      setContentType(values.content_type);

      // Thông báo cho parent component
      if (onContentTypeChange) {
        onContentTypeChange(values.content_type);
      }

      toast.success("Loại nội dung đã được cập nhật");
      toggleEdit();

      // Force re-render nơi sử dụng component này
      router.refresh();
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const contentTypeLabels = {
    video: "Video (YouTube)",
    text: "Văn bản",
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4 mb-4">
      <div className="font-medium flex items-center justify-between">
        Loại nội dung
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>Hủy</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Thay đổi
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p className="text-sm mt-2">
          {contentTypeLabels[contentType] || contentTypeLabels.video}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="content_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại nội dung</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại nội dung" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="video">Video (YouTube)</SelectItem>
                      <SelectItem value="text">Văn bản</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
