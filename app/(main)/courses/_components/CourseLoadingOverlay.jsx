"use client";

import { Spinner } from "@/components/ui/spinner";
import useFilterLoading from "@/hooks/useFilterLoading";

const CourseLoadingOverlay = () => {
  const { isLoading } = useFilterLoading();

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
      <div className="flex flex-col items-center">
        <Spinner className="animate-spin-fast h-10 w-10" />
        <p className="mt-4 text-sm font-medium text-gray-700">Đang tải...</p>
      </div>
    </div>
  );
};

export default CourseLoadingOverlay;
