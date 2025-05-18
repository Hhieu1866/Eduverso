import Link from "next/link";
import { ArrowLeft, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourseDetails } from "@/queries/courses";

export const LessonHeader = async ({ courseId }) => {
  const course = await getCourseDetails(courseId);

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm">
      <div className="flex items-center gap-6">
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          <Link href="/" className="hover:text-primary">
            <Home className="mr-1 h-4 w-4" />
            <span className="sr-only">Trang chủ</span>
          </Link>
          <span className="text-xs">/</span>
          <Link href="/courses" className="hover:text-primary">
            Khóa học
          </Link>
          <span className="text-xs">/</span>
          <span className="max-w-[200px] truncate font-medium text-primary">
            {course?.title}
          </span>
        </div>
      </div>

      <div className="hidden gap-2 md:flex">
        <Link href="/courses">
          <Button variant="outline" size="sm" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Khóa học của tôi
          </Button>
        </Link>
      </div>
    </header>
  );
};
