import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CourseOverview from "./CourseOverview";
import CourseCurriculam from "./CourseCurriculam";
import CourseInstructor from "./CourseInstructor";
import { formatMyDate } from "@/lib/date";
import { Book, Calendar, Users } from "lucide-react";

const CourseDetails = ({ course }) => {
  const lastModifiedDate = formatMyDate(course.modifiedOn);

  return (
    <section className="bg-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Tabs Navigation */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="curriculum">Nội dung</TabsTrigger>
                <TabsTrigger value="instructor">Giảng viên</TabsTrigger>
              </TabsList>

              {/* Tổng quan */}
              <TabsContent value="overview" className="mt-6 focus:outline-none">
                <div className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold">
                    Giới thiệu khóa học
                  </h2>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: course?.description }}
                  />
                </div>

                <CourseOverview course={course} />
              </TabsContent>

              {/* Nội dung khóa học */}
              <TabsContent
                value="curriculum"
                className="mt-6 focus:outline-none"
              >
                <CourseCurriculam course={course} />
              </TabsContent>

              {/* Giảng viên */}
              <TabsContent
                value="instructor"
                className="mt-6 focus:outline-none"
              >
                <CourseInstructor course={course} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-lg bg-gray-50 p-6">
              <h3 className="mb-6 text-lg font-semibold">Thông tin khóa học</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Book className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">
                      Số bài học
                    </span>
                    <span className="font-medium">
                      {course?.modules?.length} chương
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">
                      Cập nhật
                    </span>
                    <span className="font-medium">{lastModifiedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">
                      Học viên
                    </span>
                    <span className="font-medium">
                      {course?.enrollmentCount || 1} người
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      className="h-5 w-5 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20v-6M6 20V10M18 20V4" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">
                      Ngôn ngữ
                    </span>
                    <span className="font-medium">Tiếng Việt</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      className="h-5 w-5 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">
                      Chứng chỉ
                    </span>
                    <span className="font-medium">Có</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseDetails;
