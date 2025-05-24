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
import {
  gradeEssaySubmission,
  approveEssaySubmission,
  rejectEssaySubmission,
} from "@/app/actions/essaySubmission";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  const [instructorFeedback, setInstructorFeedback] = useState(
    initialData?.feedbackFromInstructor || "",
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: initialData?.grade || 0,
      feedback: initialData?.feedback || "",
    },
  });

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);

      await gradeEssaySubmission(initialData._id, values);
      toast.success("Đã chấm điểm bài tự luận thành công");

      router.push(`/dashboard/essays/${initialData.essayId}/submissions`);
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi chấm điểm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      await approveEssaySubmission(initialData._id, instructorFeedback);
      toast.success("Đã duyệt bài tự luận thành công");
      router.push(`/dashboard/essays/${initialData.essayId}/submissions`);
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi duyệt bài");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      await rejectEssaySubmission(initialData._id, instructorFeedback);
      toast.success("Đã từ chối bài tự luận");
      router.push(`/dashboard/essays/${initialData.essayId}/submissions`);
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi từ chối bài");
    } finally {
      setIsLoading(false);
    }
  };

  const isApproved = initialData.status === "approved";
  const isRejected = initialData.status === "rejected";

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Duyệt/Từ chối bài làm</CardTitle>
          <CardDescription>
            {isApproved
              ? "Bài làm đã được duyệt"
              : isRejected
                ? "Bài làm đã bị từ chối"
                : "Duyệt hoặc từ chối bài làm để quyết định xem học viên có thể tải chứng chỉ hay không"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Nhập phản hồi cho học viên (tùy chọn)"
            value={instructorFeedback}
            onChange={(e) => setInstructorFeedback(e.target.value)}
            disabled={isLoading || isApproved || isRejected}
            rows={4}
            className="mb-4"
          />
          <p className="mb-2 text-sm text-muted-foreground">
            Phản hồi này sẽ hiển thị cho học viên khi bạn duyệt/từ chối bài làm.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  `/dashboard/essays/${initialData.essayId}/submissions`,
                )
              }
              disabled={isLoading}
            >
              Quay lại
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading || isApproved || isRejected}
              className="gap-1"
            >
              <XCircle className="h-4 w-4" />
              Từ chối
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleApprove}
              disabled={isLoading || isApproved || isRejected}
              className="gap-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Duyệt
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Chấm điểm bài làm</CardTitle>
          <CardDescription>
            Chấm điểm và cung cấp phản hồi chi tiết về bài làm
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      Phản hồi này sẽ được hiển thị cho học viên cùng với điểm
                      số
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {initialData.status === "graded"
                    ? "Cập nhật điểm"
                    : "Chấm điểm"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
