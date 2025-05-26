import { getCategoryById, getCoursesByCategory } from "@/queries/courses";
import CourseCard from "../../courses/_components/CourseCard";

const CoursesCatgoryPage = async ({ params: { id } }) => {
  const courses = await getCoursesByCategory(id);
  const category = await getCategoryById(id);
  //console.log(category);

  const modifiedCourses = courses.map((course) => ({
    ...course,
    id: course._id.toString(),
  }));
  // console.log(modifiedCourses);

  return (
    <section
      id="courses"
      className="container space-y-6 py-6 dark:bg-transparent"
    >
      <div className="flex flex-col items-baseline justify-between gap-4 border-b border-gray-200 pb-6 lg:flex-row">
        <h2 className="text-3xl font-bold">
          Category Name : {category?.title}
        </h2>
      </div>

      <section className="pb-24 pt-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:col-span-4 lg:grid-cols-4 xl:grid-cols-3">
            {modifiedCourses.map((course) => {
              return <CourseCard key={course.id} course={course} />;
            })}
          </div>
        </div>
      </section>
    </section>
  );
};
export default CoursesCatgoryPage;
