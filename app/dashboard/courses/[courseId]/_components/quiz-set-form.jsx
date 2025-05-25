"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
import { updateQuizSetForCourse } from "@/app/actions/course";

const formSchema = z.object({
  quizSetId: z.string().min(1),
});

export const QuizSetForm = ({
  initialData,
  courseId,
  options = [
    {
      value: "quiz_set_1",
      label: "Quiz Set 1",
    },
    {
      value: "2",
      label: "Quiz Set 2",
    },
  ],
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const foundMatch = options.find((o) => o.value === initialData.quizSetId);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quizSetId: initialData?.quizSetId || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      await updateQuizSetForCourse(courseId, values);
      toast.success("Course updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mt-6 rounded-md border bg-gray-50 p-4">
      <div className="flex items-center justify-between font-medium">
        Bộ câu hỏi kiểm tra
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>Huỷ</>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa bộ câu hỏi
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "mt-2 text-sm",
            !initialData.quizSetId && "italic text-slate-500",
          )}
        >
          {foundMatch ? (
            <span>{foundMatch.label}</span>
          ) : (
            <span>Chưa chọn bộ câu hỏi</span>
          )}
        </p>
      )}
      {console.log({ options })}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="quizSetId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Combobox options={options} {...field} />
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
