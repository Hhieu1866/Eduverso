"use client";

import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { changeLessonPublishState, deleteLesson } from "@/app/actions/lesson";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const LessonActions = ({ lesson, moduleId, onDelete }) => {
  const [action, setAction] = useState(null);
  const [published, setPublished] = useState(lesson?.active);
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    //console.log(action);
    try {
      switch (action) {
        case "change-active": {
          const activeState = await changeLessonPublishState(lesson.id);
          setPublished(!activeState);
          toast.success("Nội dung đã được cập nhật");
          router.refresh();
          break;
        }

        case "delete": {
          if (published) {
            toast.error(
              "A published lesson can not be deleted. First unpublish it, then delete",
            );
          } else {
            await deleteLesson(lesson.id, moduleId);
            onDelete();
            router.refresh();
          }
          break;
        }
        default:
          throw new Error("Invalid Lesson Action");
      }
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAction("change-active")}
        >
          {published ? "Ẩn" : "Công khai"}
        </Button>

        <Button size="sm" onClick={() => setAction("delete")}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
