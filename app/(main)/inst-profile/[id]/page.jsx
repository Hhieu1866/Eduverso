import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import { getCourseDetailsByInstructor } from "@/queries/courses";
import {
  ArrowRight,
  BookOpen,
  MessageSquare,
  Presentation,
  Star,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const InstructorProfile = async ({ params: { id } }) => {
  const courseDetailsByInstructor = await getCourseDetailsByInstructor(
    id.toString(),
  );
  //console.log(courseDetailsByInstructor);

  return (
    <section id="categories" className="space-y-6 py-6 lg:py-12">
      <div className="container grid grid-cols-12 gap-y-8 lg:gap-x-8">
        {/* Instructor Info */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-2xl bg-white p-6 shadow">
            <div className="mb-6">
              <div className="mx-auto mb-5 h-36 w-36 overflow-hidden rounded-full">
                <Image
                  src={courseDetailsByInstructor?.insImage}
                  alt={courseDetailsByInstructor?.fullInsName}
                  width={300}
                  height={300}
                  className="h-full w-full rounded object-cover"
                />
              </div>

              <div>
                <h4 className="text-center text-xl lg:text-2xl">
                  {courseDetailsByInstructor?.fullInsName}
                </h4>
                <div className="mb-6 text-center text-sm font-medium text-gray-600">
                  {courseDetailsByInstructor?.Designation}
                </div>
                <ul className="grid grid-cols-1 flex-wrap items-center gap-3 text-sm font-medium text-gray-600 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-1 xl:grid-cols-2">
                  <li className="flex items-center space-x-3">
                    <Presentation className="w-4 text-gray-600" />
                    <div>{courseDetailsByInstructor?.courses} Courses</div>
                  </li>
                  <li className="flex items-center space-x-3">
                    <UsersRound className="w-4 text-gray-600" />
                    <div>
                      {courseDetailsByInstructor?.enrollments}+ Students
                    </div>
                  </li>
                  <li className="flex items-center space-x-3">
                    <MessageSquare className="w-4 text-gray-600" />
                    <div>{courseDetailsByInstructor?.reviews} Reviews</div>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Star className="w-4 text-gray-600" />
                    <div>
                      {courseDetailsByInstructor?.ratings} Average Rating
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-justify text-xs leading-[1.8] text-gray-600">
              Hi! I'm Kazi Ariyan. I'm a web developer with a serious love for
              teaching I am a founder of easy Learning and a passionate Web
              Developer, Programmer & Instructor.
              <br />I am working online for the last 9 years and have created
              several successful websites running on the internet. I try to
              create a project-based course that helps you to learn
              professionally and make you fell as a complete developer. easy
              learning exists to help you succeed in life.
            </p>
          </div>
        </div>
        {/* Courses */}
        <div className="col-span-12 lg:col-span-8">
          <div>
            <SectionTitle className="mb-6">Courses</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {Array.isArray(courseDetailsByInstructor?.inscourses) &&
                courseDetailsByInstructor?.inscourses.map((course) => {
                  return (
                    <Link key={course._id} href={`/courses/${course._id}`}>
                      <div className="group h-full overflow-hidden rounded-lg border p-3 transition hover:shadow-sm">
                        <div className="relative aspect-video w-full overflow-hidden rounded-md">
                          <Image
                            src={`/assets/images/courses/${course?.thumbnail}`}
                            alt={course.title}
                            className="object-cover"
                            fill
                          />
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

                          <div className="mt-4 flex items-center justify-between">
                            <p className="text-md font-medium text-slate-700 md:text-sm">
                              {formatPrice(course?.price)}
                            </p>

                            <Button
                              variant="ghost"
                              className="h-7 gap-1 text-xs text-sky-700"
                            >
                              Enroll
                              <ArrowRight className="w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default InstructorProfile;
