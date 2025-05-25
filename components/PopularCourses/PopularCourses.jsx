import React from "react";
import Link from "next/link";
import { getCourseList } from "@/queries/courses";
import { ArrowRightIcon } from "lucide-react";
import CourseCard from "@/app/(main)/courses/_components/CourseCard";
import { Badge } from "../ui/badge";

const PopularCourses = async () => {
  const courses = await getCourseList();
  return (
    <div>
      <section
        className="w-full bg-white py-8 dark:bg-gray-950 md:py-20 lg:py-28"
        id="testimonials"
      >
        <div className="container">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="secondary" className="text-base">
                Lộ trình nổi bật
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter text-colors-navy sm:text-5xl">
                Dành cho bạn
              </h2>
              <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Khám phá các lộ trình học được đông đảo người dùng lựa chọn trên
                nền tảng của chúng tôi.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
              {courses.map((course) => {
                return <CourseCard key={course.id} course={course} />;
              })}
            </div>
            <div className="mt-10 flex items-center justify-center">
              <Link
                href={"/courses"}
                className="flex items-center gap-1 text-sm font-medium hover:opacity-80"
              >
                <p>Xem tất cả khóa học</p>{" "}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PopularCourses;
