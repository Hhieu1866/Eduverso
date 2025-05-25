"use client";

import { Trash, Send, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  changeCoursePublishState,
  deleteCourse,
  submitCourseForReview,
} from "@/app/actions/course";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const CourseActions = ({
  courseId,
  isActive,
  status,
  rejectionReason,
}) => {
  const [action, setAction] = useState(null);
  const [published, setPublished] = useState(isActive);
  const [courseStatus, setCourseStatus] = useState(status || "draft");
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      switch (action) {
        case "change-active": {
          // Chỉ có thể publish khi khóa học đã được duyệt
          if (courseStatus !== "approved") {
            toast.error("Khóa học chưa được duyệt. Không thể publish.");
            return;
          }

          const activeState = await changeCoursePublishState(courseId);
          setPublished(!activeState);
          toast.success("Trạng thái khóa học đã được cập nhật");
          router.refresh();
          break;
        }

        case "submit-for-review": {
          // Gửi khóa học để duyệt
          const result = await submitCourseForReview(courseId);
          setCourseStatus("pending");
          toast.success(result.message || "Khóa học đã được gửi để duyệt");
          router.refresh();
          break;
        }

        case "delete": {
          if (published) {
            toast.error(
              "Không thể xóa khóa học đang được publish. Hãy unpublish trước khi xóa.",
            );
          } else {
            await deleteCourse(courseId);
            toast.success("Khóa học đã được xóa thành công");
            router.push(`/dashboard/courses`);
          }
          break;
        }
        default:
          throw new Error("Hành động không hợp lệ");
      }
    } catch (e) {
      toast.error(e.message);
    }
  }

  // Hiển thị các badges theo trạng thái khóa học
  const renderStatusBadge = () => {
    switch (courseStatus) {
      case "draft":
        return (
          <Badge variant="outline" className="mr-2">
            Bản nháp
          </Badge>
        );
      case "pending":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 px-4 py-1 text-sm font-semibold text-yellow-800 hover:bg-yellow-200"
                >
                  <Clock className="mr-1 h-3 w-3" /> Đang chờ duyệt
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Khóa học đang chờ admin duyệt</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "approved":
        return (
          <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-800">
            Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-4 py-1 text-sm font-semibold text-red-700">
            Bị từ chối:{" "}
            <span className="ml-1 font-normal">
              {rejectionReason || "Không đáp ứng tiêu chuẩn khóa học"}
            </span>
          </span>
        );
      default:
        return null;
    }
  };

  // Hiển thị nút Publish khi đã được duyệt, hoặc nút Gửi duyệt khi chưa được duyệt
  const renderActionButton = () => {
    if (courseStatus === "approved") {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAction("change-active")}
        >
          {published ? "Unpublish" : "Publish"}
        </Button>
      );
    } else if (courseStatus === "pending") {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="h-9 cursor-not-allowed rounded-md border border-yellow-200 bg-yellow-100 px-4 text-base text-yellow-800"
        >
          <Clock className="mr-1 h-4 w-4" />
          Đang chờ duyệt
        </Button>
      );
    } else if (courseStatus === "rejected") {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAction("submit-for-review")}
        >
          <Send className="mr-1 h-4 w-4" />
          Gửi lại để duyệt
        </Button>
      );
    } else {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAction("submit-for-review")}
        >
          <Send className="mr-1 h-4 w-4" />
          Gửi duyệt
        </Button>
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-x-2">
        {renderStatusBadge()}
        {renderActionButton()}

        <Button
          size="sm"
          onClick={() => setAction("delete")}
          variant="destructive"
          disabled={published}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
