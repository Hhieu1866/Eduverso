"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateCourse } from "@/app/actions/course";

const formSchema = z.object({
  description: z.string().min(1, {
    message: "Mô tả là bắt buộc",
  }),
});

export const DescriptionForm = ({ initialData, courseId }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

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
      await updateCourse(courseId, values);
      toast.success("Đã cập nhật mô tả khóa học");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Đã xảy ra lỗi");
    }
  };

  return (
    <div className="mt-6 rounded-md border bg-gray-50 p-4">
      <div className="flex items-center justify-between font-medium">
        Mô tả khóa học
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
      {!isEditing && (
        <p
          className={cn(
            "mt-2 text-sm",
            !initialData.description && "italic text-slate-500",
          )}
        >
          {initialData.description || "Chưa có mô tả"}
        </p>
      )}
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
                      placeholder="Ví dụ: 'Khóa học này về ...'"
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
