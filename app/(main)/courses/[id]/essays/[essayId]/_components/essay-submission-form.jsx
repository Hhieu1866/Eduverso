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
import { Textarea } from "@/components/ui/textarea";
import { submitEssay } from "@/app/actions/essaySubmission";
import { useState } from "react";
import { toast } from "sonner";
import FileUpload from "@/components/file-upload";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z
  .object({
    content: z.string().optional(),
    fileUrl: z.string().optional(),
  })
  .refine((data) => data.content || data.fileUrl, {
    message: "Bạn phải nhập nội dung hoặc tải lên file bài làm",
    path: ["content"],
  });

export function EssaySubmissionForm({ initialData, essayId, courseId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: initialData?.content || "",
      fileUrl: initialData?.fileUrl || "",
    },
  });

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await submitEssay(essayId, courseId, values);
      toast.success("Đã nộp bài tự luận thành công");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi nộp bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGraded = initialData?.status === "graded";
  const hasFeedback = initialData?.feedback;
  const isApproved = initialData?.status === "approved";
  const isRejected = initialData?.status === "rejected";
  const hasInstructorFeedback = initialData?.feedbackFromInstructor;

  return (
    <div>
      {isApproved && (
        <Alert className="mb-4 bg-green-50 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Bài làm đã được duyệt</AlertTitle>
          {hasInstructorFeedback && (
            <AlertDescription>
              <p className="font-medium">Phản hồi từ giảng viên:</p>
              <p className="mt-1 whitespace-pre-line">
                {initialData.feedbackFromInstructor}
              </p>
            </AlertDescription>
          )}
        </Alert>
      )}

      {isRejected && (
        <Alert className="mb-4 bg-red-50 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Bài làm chưa được duyệt</AlertTitle>
          {hasInstructorFeedback && (
            <AlertDescription>
              <p className="font-medium">Phản hồi từ giảng viên:</p>
              <p className="mt-1 whitespace-pre-line">
                {initialData.feedbackFromInstructor}
              </p>
            </AlertDescription>
          )}
        </Alert>
      )}

      {isGraded && hasFeedback && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Đã chấm điểm: {initialData.grade}/10</AlertTitle>
          <AlertDescription>
            <p className="font-medium">Nhận xét:</p>
            <p className="mt-1 whitespace-pre-line">{initialData.feedback}</p>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nội dung bài làm</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isSubmitting || isApproved}
                    placeholder="Nhập nội dung bài làm của bạn tại đây..."
                    {...field}
                    rows={10}
                  />
                </FormControl>
                <FormDescription>
                  Bạn có thể nhập nội dung bài làm hoặc tải lên file bài làm.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fileUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tải lên file bài làm</FormLabel>
                <FormControl>
                  <FileUpload
                    endpoint="essaySubmission"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting || isApproved}
                  />
                </FormControl>
                <FormDescription>
                  Hỗ trợ các định dạng: PDF, DOCX, DOC, TXT, PPT, PPTX.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={isSubmitting || isApproved}
            type="submit"
            className="w-full"
          >
            {isSubmitting && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {initialData ? "Cập nhật bài làm" : "Nộp bài"}
          </Button>

          {isApproved && (
            <p className="text-center text-sm text-muted-foreground">
              Bài làm đã được duyệt và không thể chỉnh sửa.
            </p>
          )}
        </form>
      </Form>
    </div>
  );
}
