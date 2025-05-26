import React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import EnrollCourse from "@/components/enroll-course";
import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";
import {
  hasEnrollmentForCourse,
  hasStartedLearning,
} from "@/queries/enrollments";
import { getImageUrl, shouldDisplayImage } from "@/lib/imageUtils";
import { GraduationCap, Clock, Users, Calendar, File } from "lucide-react";
import { formatMyDate } from "@/lib/date";

const CourseDetailsIntro = async ({ course }) => {
  const session = await auth();
  const loogedInUser = await getUserByEmail(session?.user?.email);
  const hasEnrollment = await hasEnrollmentForCourse(
    course?.id,
    loogedInUser?.id,
  );

  // Kiểm tra xem người dùng đã bắt đầu học chưa
  const hasStarted = hasEnrollment
    ? await hasStartedLearning(course?.id, loogedInUser?.id)
    : false;

  // Cập nhật cách xử lý hình ảnh
  const imageSrc = course?.thumbnailUrl
    ? course.thumbnailUrl
    : getImageUrl(course?.thumbnail, "course");
  const showImage = shouldDisplayImage(imageSrc);

  // Định dạng ngày cập nhật
  const lastUpdateDate = formatMyDate(course?.modifiedOn);

  return (
    <div className="bg-gradient-to-b from-cyan-50 to-white">
      <section className="pb-16 pt-8">
        <div className="container">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Cột thông tin khóa học */}
            <div className="flex-1">
              <div className="mb-4">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                  {course?.category?.title || "Title khóa học"}
                </span>
              </div>

              <h1 className="mb-4 text-3xl font-bold md:text-4xl">
                {course?.title}
              </h1>

              <p className="mb-6 text-gray-600">{course?.subtitle}</p>

              <div className="mb-6 flex items-center">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  {course?.testimonials?.length || 0} đánh giá
                </span>
              </div>

              <div className="mb-8 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5 text-primary" />
                  <span>{course?.enrollmentCount || 0} học viên</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Cập nhật {lastUpdateDate}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span>Chứng chỉ hoàn thành</span>
                </div>
              </div>

              <div className="mb-8 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src={
                      course?.instructor?.profilePicture ||
                      "/placeholder-avatar.jpg"
                    }
                    alt={`${course?.instructor?.firstName} ${course?.instructor?.lastName}`}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="font-medium">
                    {course?.instructor?.firstName}{" "}
                    {course?.instructor?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {course?.instructor?.designation || "Giảng viên"}
                  </p>
                </div>
              </div>
            </div>

            {/* Cột hình ảnh và đăng ký */}
            <div className="mx-auto w-full max-w-[422px] lg:w-[450px]">
              <div className="overflow-hidden rounded-lg bg-white shadow-lg">
                {showImage && (
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={imageSrc}
                      alt={course?.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {course?.price === 0
                          ? "Miễn phí"
                          : `${course?.price.toLocaleString()}đ`}
                      </span>
                      {course?.price > 0 && (
                        <span className="text-base text-gray-400 line-through">
                          {(course?.price * 1.2).toLocaleString()}đ
                        </span>
                      )}
                    </div>
                    {course?.price > 0 && (
                      <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                        Giảm 20% - Còn 3 ngày
                      </span>
                    )}
                  </div>
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">
                        {course?.modules?.length || 0} bài học
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">Chứng chỉ hoàn thành</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <File className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">Tài liệu kèm theo</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    {hasEnrollment ? (
                      <Link
                        href={`/courses/${course?.id}/lesson`}
                        className={cn(
                          buttonVariants({
                            size: "lg",
                            className: "mb-3 w-full",
                          }),
                        )}
                      >
                        {hasStarted ? "Tiếp tục học" : "Vào học ngay"}
                      </Link>
                    ) : (
                      <div className="mb-3 w-full">
                        <EnrollCourse
                          courseId={course?.id}
                          className="w-full"
                        />
                      </div>
                    )}
                    <p className="mt-3 text-center text-xs font-medium text-gray-500">
                      Đảm bảo hoàn tiền trong 30 ngày
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailsIntro;
