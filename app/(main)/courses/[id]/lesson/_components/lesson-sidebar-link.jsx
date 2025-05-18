"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle, PlayCircle, Lock } from "lucide-react";

export function LessonSidebarLink({ lesson, href, isCompleted, isStarted }) {
  return (
    <Link
      href={isCompleted || isStarted ? href : "#"}
      className={cn(
        "group flex items-center gap-3 border-l-2 px-8 py-3 transition-all hover:bg-slate-50/80",
        isCompleted ? "border-l-emerald-500" : "border-l-transparent",
        !isCompleted && !isStarted && "pointer-events-none opacity-60",
      )}
      onClick={(e) => {
        if (!isCompleted && !isStarted) {
          e.preventDefault();
        }
      }}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full">
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-emerald-500" />
        ) : isStarted ? (
          <PlayCircle className="h-5 w-5 text-blue-600" />
        ) : (
          <Lock className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <span
        className={cn(
          "line-clamp-1 text-sm",
          isCompleted
            ? "font-medium text-emerald-700"
            : isStarted
              ? "font-medium text-blue-700"
              : "text-gray-600",
        )}
      >
        {lesson.title}
      </span>
    </Link>
  );
}
