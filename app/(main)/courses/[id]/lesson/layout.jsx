import { getLoggedInUser } from "@/lib/loggedin-user";
import { redirect } from "next/navigation";
import { hasEnrollmentForCourse } from "@/queries/enrollments";
import { LessonSidebar } from "./_components/lesson-sidebar";
import { LessonHeader } from "./_components/lesson-header";
import { LessonSidebarMobile } from "./_components/lesson-sidebar-mobile";

const LessonLayout = async ({ children, params }) => {
  const id = params.id;
  const loggedinUser = await getLoggedInUser();
  if (!loggedinUser) redirect("/login");

  const isEnrolled = await hasEnrollmentForCourse(id, loggedinUser.id);
  if (!isEnrolled) redirect("/courses");

  return (
    <div className="flex h-screen flex-col">
      {/* Header mới cho trang bài học */}
      {/* <LessonHeader courseId={id} /> */}

      {/* Sidebar Mobile */}
      <div className="block lg:hidden">
        <LessonSidebarMobile courseId={id} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6">{children}</main>
        {/* Sidebar bên phải (ẩn trên mobile) */}
        <div className="hidden w-[380px] flex-shrink-0 overflow-y-auto border-l lg:block">
          <LessonSidebar courseId={id} />
        </div>
      </div>
    </div>
  );
};

export default LessonLayout;
