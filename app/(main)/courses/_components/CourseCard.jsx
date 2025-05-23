import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Star } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import EnrollCourse from "@/components/enroll-course";
import { getImageUrl, shouldDisplayImage } from "@/lib/imageUtils";
import { hasEnrollmentForCourse } from "@/queries/enrollments";
import { getLoggedInUser } from "@/lib/loggedin-user";

const CourseCard = async ({ course }) => {
  // Lấy thông tin người dùng hiện tại
  const loggedInUser = await getLoggedInUser();

  // Kiểm tra xem người dùng đã đăng ký khóa học này chưa
  const isEnrolled = loggedInUser
    ? await hasEnrollmentForCourse(course?.id, loggedInUser?.id)
    : false;

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

  // Giả định giá trị mặc định cho rating và số lượng đánh giá
  const rating = course?.rating || 4.5;
  const reviewCount = course?.testimonials?.length || 0;
  const instructorName =
    course?.instructor &&
    (course.instructor.firstName || course.instructor.lastName)
      ? `${course.instructor.firstName ?? ""} ${course.instructor.lastName ?? ""}`.trim()
      : "Giảng viên";

  console.log(
    "CourseCard instructorName:",
    instructorName,
    "course.instructor:",
    course?.instructor,
  );

  // Tính điểm trung bình và số lượng đánh giá thực tế
  const testimonials = Array.isArray(course?.testimonials)
    ? course.testimonials
    : [];
  const avgRating =
    reviewCount > 0
      ? (
          testimonials.reduce((acc, t) => acc + (t.rating || 0), 0) /
          reviewCount
        ).toFixed(1)
      : "0.0";

  return (
    <div className="group rounded-xl border shadow-xl">
      <Link key={course.id} href={`/courses/${course.id}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
          {showImage && (
            <Image
              src={imageSrc}
              alt="Course thumbnail"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          )}
        </div>

        <div className="px-4">
          <div className="mt-4 space-y-1">
            <div className="line-clamp-2 text-lg font-medium">
              {course?.title}
            </div>

            <div className="flex items-center gap-x-2 text-sm md:text-xs">
              <div className="flex items-center gap-x-1 text-slate-500">
                <BookOpen className="w-4" />
                <span>{course?.modules?.length} Chương</span>
              </div>
            </div>

            <p className="text-sm font-semibold text-primary">
              {instructorName}
            </p>

            <p className="line-clamp-2 text-sm text-slate-500">
              {course?.description || course?.subtitle || "Không có mô tả"}
            </p>

            <div className="flex items-center gap-2">
              <p className="font-medium">{avgRating}</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600">
                ({reviewCount} đánh giá)
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between p-4">
        <p className="text-md font-medium text-slate-700 md:text-sm">
          {formatPrice(course?.price)}
        </p>

        {isEnrolled ? (
          <Link href={`/courses/${course.id}`}>
            <Button size="sm" className="bg-primary text-white">
              Xem chi tiết
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
