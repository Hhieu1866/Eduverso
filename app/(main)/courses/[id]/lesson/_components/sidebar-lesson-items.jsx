"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { PlayCircle } from "lucide-react";
import { Lock } from "lucide-react";
import Link from "next/link";

export const SidebarLessonItem = ({ courseId, lesson, module }) => {
  // Kiểm tra bài học có thể truy cập hay không dựa trên state
  const isLocked = (lesson) => {
    // Nếu không có state hoặc state không phải là started/completed thì khóa
    return (
      !lesson?.state ||
      (lesson?.state !== "started" && lesson?.state !== "completed")
    );
  };

  const isCompleted = (lesson) => {
    return lesson?.state === "completed";
  };

  const isStarted = (lesson) => {
    return lesson?.state === "started";
  };

  const getStatusText = (lesson) => {
    if (isLocked(lesson)) return "Bài học bị khóa";
    if (isCompleted(lesson)) return "Đã hoàn thành";
    if (isStarted(lesson)) return "Đang học";
    return "";
  };

  // Nếu bài học bị khóa, trả về div thay vì Link
  if (isLocked(lesson)) {
    return (
      <div
        className={cn(
          "group relative flex cursor-not-allowed items-center gap-x-2 text-sm font-[500] text-slate-400",
        )}
        title="Bài học bị khóa"
      >
        <div className="flex items-center gap-x-2">
          <Lock size={16} className={cn("flex-shrink-0 text-slate-400")} />
          <span className="truncate">{lesson.title}</span>
        </div>
        <span className="pointer-events-none absolute -top-6 left-0 rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Bài học bị khóa
        </span>
      </div>
    );
  }

  // Nếu bài học có thể truy cập, trả về Link
  return (
    <Link
      href={`/courses/${courseId}/lesson?name=${lesson.slug}&module=${module}`}
      className={cn(
        "group relative flex items-center gap-x-2 text-sm font-[500] text-slate-500 transition-all hover:text-slate-600",
        isCompleted(lesson)
          ? "text-emerald-700 hover:text-emerald-700"
          : isStarted(lesson) && "text-blue-600 hover:text-blue-700",
      )}
      title={getStatusText(lesson)}
    >
      <div className="flex items-center gap-x-2">
        {isCompleted(lesson) ? (
          <CheckCircle
            size={16}
            className={cn("flex-shrink-0 text-emerald-700")}
          />
        ) : (
          <PlayCircle size={16} className={cn("flex-shrink-0 text-blue-600")} />
        )}
        <span className="truncate">{lesson.title}</span>
      </div>
      <span className="pointer-events-none absolute -top-6 left-0 rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {getStatusText(lesson)}
      </span>
    </Link>
  );
};
