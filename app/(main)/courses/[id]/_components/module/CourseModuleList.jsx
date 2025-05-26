import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CourseLessonList from "./CourseLessonList";

const CourseModuleList = ({ module }) => {
  const totalDuration = module?.lessonIds.reduce(function (acc, obj) {
    return acc + obj.duration;
  }, 0);
  // console.log(module);

  return (
    <div>
      <AccordionItem className="border-none" value="item-1">
        <AccordionTrigger>{module?.title}</AccordionTrigger>
        <AccordionContent>
          {/* header */}
          {/* <div className="mb-6 mt-4 flex flex-wrap items-center gap-x-5 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Video className="h-4 w-4" />
              {(totalDuration / 3660).toPrecision(2)} Hours
            </span>
            <span className="flex items-center gap-1.5">
              <FileQuestion className="h-4 w-4" />
              10 Quiz
            </span>
            <span className="flex items-center gap-1.5">
              <Radio className="h-4 w-4" />1 Live Class
            </span>
          </div> */}
          {/* header ends */}

          <div className="space-y-3">
            {module.lessonIds &&
              module?.lessonIds.map((lessonId) => (
                <CourseLessonList key={lessonId} lessonId={lessonId} />
              ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

export default CourseModuleList;
