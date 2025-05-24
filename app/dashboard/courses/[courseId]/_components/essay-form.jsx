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
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { addEssaysToCourse } from "@/app/actions/course";
import { Combobox } from "@/components/ui/combobox";

const formSchema = z.object({
  essayId: z.string().min(1, "Vui lòng chọn một bài tự luận"),
});

export const EssayForm = ({ initialData, courseId, options = [] }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      essayId: initialData?.essayIds?.[0] || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      await addEssaysToCourse(courseId, values.essayId ? [values.essayId] : []);
      toast.success("Khóa học đã được cập nhật");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const selectedEssayLabel = () => {
    if (!form.getValues("essayId")) return "Chưa có bài tự luận nào được chọn";
    const essay = options.find(
      (option) => option.value === form.getValues("essayId"),
    );
    return essay ? essay.label : "";
  };

  return (
    <div className="mt-6 rounded-md border bg-gray-50 p-4">
      <div className="flex items-center justify-between font-medium">
        Bài tự luận
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>Hủy</>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa bài tự luận
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "mt-2 text-sm",
            !form.getValues("essayId") && "italic text-slate-500",
          )}
        >
          {selectedEssayLabel()}
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
              name="essayId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Combobox
                      options={options}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
                type="submit"
              >
                Lưu
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
