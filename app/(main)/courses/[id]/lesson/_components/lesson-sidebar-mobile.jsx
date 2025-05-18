import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonSidebar } from "./lesson-sidebar";

export const LessonSidebarMobile = ({ courseId }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" className="rounded-full shadow-lg">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[380px] p-0">
          <LessonSidebar courseId={courseId} />
        </SheetContent>
      </Sheet>
    </div>
  );
};
