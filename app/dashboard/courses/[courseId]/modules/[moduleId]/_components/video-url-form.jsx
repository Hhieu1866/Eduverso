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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil, Play, Youtube, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/video-player";
import { formatDuration } from "@/lib/date";
import { updateLesson } from "@/app/actions/lesson";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  url: z.string().min(1, {
    message: "URL video không được để trống",
  }),
  duration: z.string().min(1, {
    message: "Thời lượng không được để trống",
  }),
});

// Hàm trích xuất ID YouTube từ URL
function getYoutubeId(url) {
  if (!url) return null;

  // Kiểm tra các dạng URL của YouTube
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

// Chuyển đổi URL YouTube thành URL embed
function getEmbedUrl(url) {
  const videoId = getYoutubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

export const VideoUrlForm = ({ initialData, courseId, lessonId }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");

  const [state, setState] = useState({
    url: initialData?.url || "",
    duration: formatDuration(initialData?.duration) || "00:00:00",
  });

  useEffect(() => {
    if (state.url) {
      setEmbedUrl(getEmbedUrl(state.url));
    }
  }, [state.url]);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: state,
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      const payload = {};
      // Chuyển đổi URL YouTube thành URL embed nếu cần
      const embedUrl = getEmbedUrl(values.url);
      payload["video_url"] = embedUrl;

      // Xử lý thời lượng
      const duration = values?.duration;
      const splitted = duration.split(":");
      if (splitted.length === 3) {
        payload["duration"] =
          parseInt(splitted[0]) * 3600 +
          parseInt(splitted[1]) * 60 +
          parseInt(splitted[2]);
        await updateLesson(lessonId, payload);

        setState({
          url: embedUrl,
          duration: duration,
        });

        toast.success("Thông tin video đã được cập nhật");
        toggleEdit();
        router.refresh();
      } else {
        toast.error("Thời lượng phải có định dạng hh:mm:ss");
      }
    } catch {
      toast.error("Đã xảy ra lỗi, vui lòng thử lại");
    }
  };

  // Phát hiện sự thay đổi URL để tự động cập nhật URL embed
  const handleUrlChange = (e) => {
    const url = e.target.value;
    form.setValue("url", url);

    // Nếu là link YouTube, tự động chuyển đổi
    const embedUrl = getEmbedUrl(url);
    if (embedUrl !== url) {
      setEmbedUrl(embedUrl);
    }
  };

  return (
    <div className="mt-6 rounded-md border bg-slate-100 p-4">
      <div className="flex items-center justify-between font-medium">
        <div className="flex items-center">
          <Youtube className="mr-2 h-5 w-5 text-red-600" />
          <span>Video URL</span>
        </div>
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>Hủy</>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <>
          {state?.url ? (
            <Card className="mt-4 overflow-hidden border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="aspect-video">
                  <VideoPlayer url={state.url} />
                </div>
                <div className="flex items-center justify-between bg-white p-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Play className="mr-1 h-4 w-4 text-green-600" />
                    <span className="max-w-[300px] truncate">{state.url}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {state.duration}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center rounded-md border bg-white py-12 text-muted-foreground">
              <Youtube className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm">Chưa có video cho bài học này</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={toggleEdit}
              >
                <Play className="mr-2 h-4 w-4" />
                Thêm video
              </Button>
            </div>
          )}
        </>
      )}

      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Youtube className="mr-1 h-4 w-4 text-red-600" />
                    URL Video (YouTube)
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="https://www.youtube.com/watch?v=..."
                      {...field}
                      onChange={handleUrlChange}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Hỗ trợ URL YouTube dạng đầy đủ hoặc rút gọn (youtu.be)
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Thời lượng Video
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="hh:mm:ss (ví dụ: 00:10:30)"
                      {...field}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Định dạng: giờ:phút:giây (ví dụ: 00:45:30)
                  </p>
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2">
              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
                className="flex items-center"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
