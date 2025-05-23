"use client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as z from "zod";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createReview } from "@/app/actions/review";
import { useState } from "react";

const formSchema = z.object({
  rating: z.coerce
    .number()
    .min(1, {
      message: "Rating can be 1 to 5",
    })
    .max(5, {
      message: "Rating can be 1 to 5",
    }),
  review: z.string().min(1, {
    message: "Description is required!",
  }),
});

export const ReviewModal = ({ courseId, loginid, open, setOpen }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: "",
      review: "",
    },
  });

  const onSubmit = async (values) => {
    if (!loginid) {
      toast.error("Bạn cần đăng nhập để đánh giá");
      return;
    }

    if (!courseId) {
      toast.error("Không tìm thấy khóa học");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await createReview(values, loginid, courseId);

      if (response.success) {
        toast.success(response.message);
        form.reset();
        setOpen(false);
      } else {
        // Xử lý lỗi từ server
        setErrorMessage(response.message);
        toast.error(response.message);
      }
    } catch (clientError) {
      // Lỗi client-side (network, etc.)
      console.error("Lỗi client-side:", clientError);
      const message = "Lỗi kết nối, vui lòng thử lại sau";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (isSubmitting) {
            e.preventDefault();
          }
        }}
      >
        <DialogTitle>Gửi đánh giá của bạn</DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-8"
          >
            {errorMessage && (
              <div className="mb-4 rounded-md bg-red-100 p-3 text-red-800">
                {errorMessage}
              </div>
            )}

            {/* rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đánh giá khóa học</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="ví dụ: 5"
                      {...field}
                      type="number"
                      min={1}
                      max={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* review */}
            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung đánh giá</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Đánh giá khóa học"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Viết đánh giá ngắn gọn về khóa học
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
