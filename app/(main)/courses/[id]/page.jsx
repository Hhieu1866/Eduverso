import { formatPrice } from "@/lib/formatPrice";
import CourseDetailsIntro from "./_components/CourseDetailsIntro";
import CourseDetails from "./_components/CourseDetails";
import Testimonials from "./_components/Testimonials";
import RelatedCourses from "./_components/RelatedCourses";
import { getCourseDetails, getRelatedCourses } from "@/queries/courses";
import { replaceMongoIdInArray } from "@/lib/convertData";
import MoneyBack from "@/components/money-back";

const SingleCoursePage = async ({ params: { id } }) => {
  const course = await getCourseDetails(id);
  //console.log(course);
  const currentCourseId = course.id.toString();

  // Kiểm tra tồn tại của category trước khi truy cập _id
  let relatedCourses = [];
  if (course.category && course.category._id) {
    const categoryId = course.category._id.toString();
    // Fetch related courses
    relatedCourses = await getRelatedCourses(currentCourseId, categoryId);
  }

  return (
    <div className="flex flex-col">
      <CourseDetailsIntro course={course} />

      <CourseDetails course={course} />

      {course?.testimonials && (
        <Testimonials
          testimonials={replaceMongoIdInArray(course?.testimonials)}
        />
      )}

      <div className="mb-10">
        <MoneyBack />
      </div>

      {relatedCourses.length > 0 && (
        <div className="mb-12">
          <RelatedCourses relatedCourses={relatedCourses} />
        </div>
      )}
    </div>
  );
};
export default SingleCoursePage;
