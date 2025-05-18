import React from "react";
import {
  Presentation,
  UsersRound,
  Star,
  Clock,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { getCourseDetailsByInstructor } from "@/queries/courses";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CourseInstructor = async ({ course }) => {
  const instructor = course?.instructor;
  const fullName = `${instructor?.firstName} ${instructor?.lastName}`;

  const courseDetailsByInstructor = await getCourseDetailsByInstructor(
    instructor._id.toString(),
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg border bg-white p-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="md:w-1/3">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              <Image
                src={instructor?.profilePicture || "/placeholder-avatar.jpg"}
                alt={fullName}
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xl font-bold">
                  {courseDetailsByInstructor?.courses || 0}
                </div>
                <div className="text-sm text-gray-600">Khóa học</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xl font-bold">
                  {courseDetailsByInstructor?.reviews || 0}
                </div>
                <div className="text-sm text-gray-600">Đánh giá</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xl font-bold">
                  {courseDetailsByInstructor?.enrollments || 0}+
                </div>
                <div className="text-sm text-gray-600">Học viên</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xl font-bold">
                  {courseDetailsByInstructor?.ratings || "5.0"}
                </div>
                <div className="text-sm text-gray-600">Xếp hạng</div>
              </div>
            </div>

            <Button asChild className="mt-6 w-full">
              <Link href={`/inst-profile/${instructor?._id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Xem trang cá nhân
              </Link>
            </Button>
          </div>

          <div className="md:w-2/3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <p className="text-gray-600">
                {instructor?.designation || "Giảng viên"}
              </p>
            </div>

            <h3 className="mb-3 text-lg font-semibold">Giới thiệu</h3>
            <div className="prose prose-gray mb-6">
              <p>
                {instructor?.bio ||
                  `${fullName} là giảng viên với nhiều năm kinh nghiệm trong lĩnh vực đào tạo. Với kiến thức sâu rộng và phương pháp giảng dạy hiệu quả, giảng viên đã giúp hàng nghìn học viên đạt được mục tiêu học tập và phát triển sự nghiệp của họ.`}
              </p>
            </div>

            <h3 className="mb-3 text-lg font-semibold">Chuyên môn</h3>
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                Kiểm thử phần mềm
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                Quản lý chất lượng
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                Automation Testing
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                QA/QC
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                Agile
              </span>
            </div>

            <h3 className="mb-3 text-lg font-semibold">Kinh nghiệm</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <span>10+ năm kinh nghiệm trong ngành công nghệ</span>
              </li>
              <li className="flex items-center">
                <Star className="mr-2 h-4 w-4 text-gray-500" />
                <span>Đã đào tạo hơn 1000+ học viên</span>
              </li>
              <li className="flex items-center">
                <Presentation className="mr-2 h-4 w-4 text-gray-500" />
                <span>
                  Giảng viên tại nhiều trường đại học và trung tâm đào tạo
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseInstructor;
