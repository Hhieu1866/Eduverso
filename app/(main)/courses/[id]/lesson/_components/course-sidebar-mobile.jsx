import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Menu } from "lucide-react";
import { CourseSidebar } from "./course-sidebar";

export const CourseSidebarMobile = ({ courseId }) => {
  return (
    <Sheet>
      <SheetTrigger className="pr-4 transition hover:opacity-75 lg:hidden">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-white p-0">
        <CourseSidebar courseId={courseId} />
      </SheetContent>
    </Sheet>
  );
};
