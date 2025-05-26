"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { gradeEssaySubmission } from "@/app/actions/essaySubmission";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  grade: z.coerce
    .number()
    .min(0, {
      message: "Điểm không được âm",
    })
    .max(10, {
      message: "Điểm tối đa là 10",
    }),
  feedback: z.string().min(1, {
    message: "Phản hồi không được để trống",
  }),
});

export function GradingForm({ initialData }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: initialData?.grade || 0,
      feedback: initialData?.feedback || "",
    },
  });

  // Helper để lấy essayId dạng string - đã sửa để xử lý đúng ObjectId
  const getEssayIdString = () => {
    const essayId = initialData.essayId;

    // Nếu là string, trả về luôn
    if (typeof essayId === "string") return essayId;

    // Nếu là ObjectId hoặc có _id
    if (essayId && typeof essayId === "object") {
      // Kiểm tra nếu có thuộc tính _id là string
      if (essayId._id && typeof essayId._id === "string") {
        return essayId._id;
      }

      // Nếu ObjectId có toString và là function
      if (typeof essayId.toString === "function") {
        const idStr = essayId.toString();
        // Kiểm tra nếu toString không trả về [object Object]
        if (idStr !== "[object Object]") {
          return idStr;
        }
      }
    }

    // Fallback: Tìm trong initialData nếu có trường essay có _id
    if (initialData.essay && initialData.essay._id) {
      return typeof initialData.essay._id === "string"
        ? initialData.essay._id
        : initialData.essay._id.toString();
    }

    console.error("Không thể xác định essayId:", initialData);
    return "error-essay-id"; // Fallback để tránh lỗi
  };

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      await gradeEssaySubmission(initialData._id, values);
      toast.success("Đã lưu đánh giá bài tự luận thành công");

      const essayIdString = getEssayIdString();
      console.log("Chuyển hướng đến essayId:", essayIdString);
      router.push(`/dashboard/essays/${essayIdString}/submissions`);
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi lưu đánh giá");
    } finally {
      setIsLoading(false);
    }
  };

  // Xác định trạng thái duyệt dựa vào điểm
  const isApproved = form.watch("grade") >= 6;

  return (
    <div className="p-0">
      <div className="mb-4">
        <p className="mb-2 text-sm text-gray-600">
          Chấm điểm và phản hồi cho bài làm của học viên. Nếu điểm {">="} 6 sẽ
          được duyệt, {"<"}6 sẽ bị từ chối.
        </p>
        <span
          className={
            isApproved
              ? "font-semibold text-green-600"
              : "font-semibold text-red-600"
          }
        >
          {isApproved
            ? `Đã duyệt (${form.watch("grade")}/10)`
            : `Từ chối (${form.watch("grade")}/10)`}
        </span>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Điểm (0-10)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    placeholder="Nhập điểm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="feedback"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phản hồi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập phản hồi chi tiết cho học viên"
                    {...field}
                    rows={4}
                  />
                </FormControl>
                <FormDescription>
                  Phản hồi này sẽ được hiển thị cho học viên cùng với điểm số
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              Lưu điểm
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
