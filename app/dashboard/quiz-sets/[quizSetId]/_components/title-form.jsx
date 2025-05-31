"use client";

import * as z from "zod";
// import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateQuizSet } from "@/app/actions/quiz";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Tiêu đề là bắt buộc",
  }),
});

export const TitleForm = ({ initialData = {}, quizSetId }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      await updateQuizSet(quizSetId, values);
      toast.success("Đã cập nhật tiêu đề bài kiểm tra");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Đã xảy ra lỗi");
    }
  };

  return (
    <div className="mt-6 rounded-md border bg-gray-50 p-4">
      <div className="flex items-center justify-between font-medium">
        Tiêu đề bộ câu hỏi
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>Hủy</>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa tiêu đề
            </>
          )}
        </Button>
      </div>
      {!isEditing && <p className="mt-2 text-sm">{initialData.title}</p>}
      {isEditing && (
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
                      placeholder="Ví dụ: 'Phát triển web nâng cao'"
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
