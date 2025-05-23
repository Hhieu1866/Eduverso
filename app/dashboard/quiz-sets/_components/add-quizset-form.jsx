"use client";
import * as z from "zod";
// import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { doCreateQuizSet } from "@/app/actions/quiz";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Tiêu đề là bắt buộc!",
  }),
});

const AddQuizSetForm = () => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      const quizSetId = await doCreateQuizSet(values);
      router.push(`/dashboard/quiz-sets/${quizSetId}`);
      toast.success("Đã tạo bộ câu hỏi");
    } catch (error) {
      toast.error("Đã xảy ra lỗi");
    }
  };
  return (
    <div className="mx-auto flex h-full max-w-5xl p-6 md:items-center md:justify-center">
      <div className="w-[536px] max-w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-8"
          >
            {/* title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề bộ câu hỏi</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Ví dụ: 'Kiểm tra kiến thức nâng cao'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2">
              <Link href="/dashboard/quiz-sets">
                <Button variant="outline" type="button">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Tiếp tục
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddQuizSetForm;
