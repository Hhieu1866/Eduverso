import React from "react";
import {
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Link as LinkIcon,
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
    <div className="">
      <div className="rounded-lg border bg-white p-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="md:w-1/3">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl">
              <Image
                src={instructor?.profilePicture || "/placeholder-avatar.jpg"}
                alt={fullName}
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-100 p-3 text-center">
                <div className="text-xl font-bold">
                  {courseDetailsByInstructor?.courses || 0}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Khóa học
                </div>
              </div>
              <div className="rounded-lg bg-gray-100 p-3 text-center">
                <div className="text-xl font-bold">
                  {courseDetailsByInstructor?.reviews || 0}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Đánh giá
                </div>
              </div>
              <div className="rounded-lg bg-gray-100 p-3 text-center">
                <div className="text-xl font-bold">
                  {courseDetailsByInstructor?.enrollments || 0}+
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Học viên
                </div>
              </div>
              <div className="rounded-lg bg-gray-100 p-3 text-center">
                <div className="text-xl font-bold">
                  {courseDetailsByInstructor?.ratings || "5.0"}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Xếp hạng
                </div>
              </div>
            </div>

            <Button asChild className="mt-6 w-full">
              <Link
                href={`/inst-profile/${instructor?._id}`}
                className="font-medium"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Xem trang cá nhân
              </Link>
            </Button>
          </div>

          <div className="md:w-2/3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <p className="mt-1 font-medium text-gray-600">
                {instructor?.designation}
              </p>
            </div>

            <h3 className="mb-3 text-lg font-semibold">Giới thiệu</h3>
            <div className="prose prose-gray mb-6">
              <p className="text-base font-medium text-gray-600">
                {instructor?.bio || "Chưa có giới thiệu bản thân."}
              </p>
            </div>

            {/* Thông tin liên hệ thực */}
            <div className="mb-6 space-y-2 font-medium">
              <div className="flex items-center text-gray-600">
                <Mail className="mr-2 h-4 w-4 text-primary" />
                {instructor?.email ? (
                  <span>{instructor.email}</span>
                ) : (
                  <span className="italic text-gray-400">Chưa có email</span>
                )}
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="mr-2 h-4 w-4 text-primary" />
                {instructor?.phone ? (
                  <span>{instructor.phone}</span>
                ) : (
                  <span className="italic text-gray-400">
                    Chưa có số điện thoại
                  </span>
                )}
              </div>
              {/* Social media: object hoặc string */}
              <div className="flex items-center text-gray-700">
                <Globe className="mr-2 h-4 w-4 text-primary" />
                {instructor?.socialMedia &&
                typeof instructor.socialMedia === "object" &&
                Object.values(instructor.socialMedia).filter(Boolean).length >
                  0 ? (
                  <div className="flex flex-col gap-1">
                    {Object.entries(instructor.socialMedia).map(
                      ([key, value]) =>
                        value ? (
                          <a
                            key={key}
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block hover:underline"
                          >
                            {key}: {value}
                          </a>
                        ) : null,
                    )}
                  </div>
                ) : instructor?.socialMedia &&
                  typeof instructor.socialMedia === "string" ? (
                  <a
                    href={instructor.socialMedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {instructor.socialMedia}
                  </a>
                ) : (
                  <span className="italic text-gray-400">
                    Chưa có mạng xã hội
                  </span>
                )}
              </div>
            </div>

            {/* <h3 className="mb-3 text-lg font-semibold">Chuyên môn</h3>
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
            </div> */}

            {/* <h3 className="mb-3 text-lg font-semibold">Kinh nghiệm</h3>
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
            </ul> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseInstructor;
