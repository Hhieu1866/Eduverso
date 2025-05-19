"use client";

import { cn } from "@/lib/utils";

export function Spinner({ className }) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-4 border-primary/10 border-t-primary",
        className,
      )}
      role="status"
      aria-label="Đang tải"
    />
  );
}
