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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import FileUpload from "@/components/file-upload";
import { Combobox } from "@/components/ui/combobox";
const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required!",
  }),
  date: z.date({ required_error: "Date is required!" }),
  time: z.string({ required_error: "Time is required!" }).min(1, {
    message: "Time is required!",
  }),
  description: z.string().min(1, {
    message: "Description is required!",
  }),
  thumbnail: z.string().min(1, {
    message: "Thumbnail is required!",
  }),
  url: z.string().min(1, {
    message: "Thumbnail is required!",
  }),
  quizSet: z.string().min(1, {
    message: "Quiz Set is required!",
  }),
});

const AddLive = () => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      router.push(`/dashboard/lives`);
      toast.success("Đã tạo buổi học trực tuyến");
    } catch (error) {
      toast.error("Đã xảy ra lỗi");
    }
  };
  return (
    <section className="py-8">
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
                    <FormLabel>Tiêu đề buổi học trực tuyến</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Ví dụ: 'Hướng dẫn React nâng cao'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Thumbnail */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh đại diện</FormLabel>
                    <FormControl>
                      <FileUpload />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Chọn ngày diễn ra buổi học trực tuyến.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* time */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian</FormLabel>
                    <FormControl>
                      <Input
                        className="block"
                        disabled={isSubmitting}
                        placeholder="Chọn thời gian"
                        {...field}
                        type="time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* video url */}
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đường dẫn video</FormLabel>
                    <FormControl>
                      <Input
                        className="block"
                        disabled={isSubmitting}
                        placeholder="Nhập đường dẫn video"
                        {...field}
                        type="url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quizSet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bộ câu hỏi</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          {
                            label: "Bộ câu hỏi: React nâng cao",
                            value: "1",
                          },
                          {
                            label: "Bộ câu hỏi: Tư duy Redux",
                            value: "2",
                          },
                        ]}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả buổi học trực tuyến</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tổng quan buổi học"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Viết mô tả ngắn gọn về buổi học trực tuyến của bạn
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-x-2">
                <Link href="/dashboard/lives">
                  <Button variant="outline" type="button">
                    Hủy
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  Tiếp tục
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default AddLive;
