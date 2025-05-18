import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { ArrowRightIcon } from "lucide-react";
import { BookOpen } from "lucide-react";
import EnrollCourse from "@/components/enroll-course";
import { getImageUrl, shouldDisplayImage } from "@/lib/imageUtils";
import { hasEnrollmentForCourse } from "@/queries/enrollments";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { cn } from "@/lib/utils";

const CourseCard = async ({ course }) => {
  // Lấy thông tin người dùng hiện tại
  const loggedInUser = await getLoggedInUser();

  // Kiểm tra xem người dùng đã đăng ký khóa học này chưa
  const isEnrolled = loggedInUser
    ? await hasEnrollmentForCourse(course?.id, loggedInUser?.id)
    : false;

  console.log("Course data:", course?.id, {
    thumbnailUrl: course?.thumbnailUrl,
    thumbnail: course?.thumbnail,
  });

  let imageSrc;

  if (course?.thumbnailUrl) {
    imageSrc = course.thumbnailUrl;
  } else if (typeof course?.thumbnail === "string") {
    imageSrc = getImageUrl(course.thumbnail, "course");
  } else if (typeof course?.thumbnail === "object") {
    imageSrc = getImageUrl(course.thumbnail, "course");
  } else {
    imageSrc = getImageUrl(null, "course");
  }

  const showImage = shouldDisplayImage(imageSrc);

  console.log("Image source:", imageSrc, "Should show:", showImage);

  return (
    <div className="group h-full overflow-hidden rounded-lg border p-3 transition hover:shadow-sm">
      <Link key={course.id} href={`/courses/${course.id}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-md">
          {showImage && (
            <Image
              src={imageSrc}
              alt="Course thumbnail"
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          )}
        </div>
        <div className="flex flex-col pt-2">
          <div className="line-clamp-2 text-lg font-medium group-hover:text-sky-700 md:text-base">
            {course?.title}
          </div>
          <p className="text-xs text-muted-foreground">
            {course?.category?.title}
          </p>
          <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
            <div className="flex items-center gap-x-1 text-slate-500">
              <div>
                <BookOpen className="w-4" />
              </div>
              <span>{course?.modules?.length} Chapters</span>
            </div>
          </div>

          {/* <CourseProgress
              size="sm"
              value={80}
              variant={110 === 100 ? "success" : ""}
            /> */}
        </div>
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-md font-medium text-slate-700 md:text-sm">
          {formatPrice(course?.price)}
        </p>

        {isEnrolled ? (
          // <Link href={`/courses/${course?.id}/lesson`}>
          <Link href={`/courses/${course.id}`}>
            <Button size="sm" className="flex items-center justify-between">
              <p>Xem chi tiết</p>
            </Button>
          </Link>
        ) : (
          <EnrollCourse asLink={true} courseId={course?.id} />
        )}
      </div>
    </div>
  );
};

export default CourseCard;
