import { IconBadge } from "@/components/icon-badge";
import { CircleDollarSign, LayoutDashboard, ListChecks } from "lucide-react";
import { CategoryForm } from "./_components/category-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { ModulesForm } from "./_components/module-form";
import { PriceForm } from "./_components/price-form";
import { TitleForm } from "./_components/title-form";
import { CourseActions } from "./_components/course-action";
import AlertBanner from "@/components/alert-banner";
import { QuizSetForm } from "./_components/quiz-set-form";
import { getCourseDetailsForInstructor } from "@/queries/courses";
import { SubTitleForm } from "./_components/subtitle-form";
import { getCategories } from "@/queries/categories";
import { replaceMongoIdInArray } from "@/lib/convertData";
import { getAllQuizSets } from "@/queries/quizzes";
import { getEssays } from "@/app/actions/essay";
import { EssayForm } from "./_components/essay-form";
import { ObjectId } from "mongoose";

const EditCourse = async ({ params: { courseId } }) => {
  const course = await getCourseDetailsForInstructor(courseId);
  const categories = await getCategories();

  const mappedCategories = categories.map((c) => {
    return {
      value: c.title,
      label: c.title,
      id: c.id,
    };
  });
  // console.log(mappedCategories);

  // Sanitize fucntion for handle ObjectID and Buffer
  function sanitizeData(data) {
    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (value instanceof ObjectId) {
          return value.toString();
        }
        if (Buffer.isBuffer(value)) {
          return value.toString("base64");
        }
        return value;
      }),
    );
  }

  const rawmodules = await replaceMongoIdInArray(course?.modules).sort(
    (a, b) => a.order - b.order,
  );

  const modules = sanitizeData(rawmodules);

  const allQuizSets = await getAllQuizSets(true);
  let mappedQuizSet = [];
  if (allQuizSets && allQuizSets.length > 0) {
    mappedQuizSet = allQuizSets.map((quizSet) => {
      return {
        value: quizSet.id,
        label: quizSet.title,
      };
    });
  }

  // Lấy tất cả bài tự luận của giảng viên
  const allEssays = await getEssays();
  let mappedEssays = [];
  if (allEssays && allEssays.length > 0) {
    mappedEssays = allEssays.map((essay) => {
      return {
        value: essay._id.toString(),
        label: essay.title,
      };
    });
  }

  return (
    <>
      {!course.active && (
        <AlertBanner
          label="Khoá học này chưa được công khai. Học viên sẽ không nhìn thấy khoá học này."
          variant="warning"
        />
      )}

      <div className="p-6">
        <div className="flex items-center justify-end">
          <CourseActions
            courseId={courseId}
            isActive={course?.active}
            status={course?.status}
            rejectionReason={course?.rejectionReason}
          />
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Tuỳ chỉnh khoá học của bạn</h2>
            </div>
            <TitleForm
              initialData={{
                title: course?.title,
              }}
              courseId={courseId}
            />
            <SubTitleForm
              initialData={{
                subtitle: course?.subtitle,
              }}
              courseId={courseId}
            />
            <DescriptionForm
              initialData={{ description: course?.description }}
              courseId={courseId}
            />

            <ImageForm
              initialData={{
                imageUrl: `/assets/images/courses/${course?.thumbnail}`,
                thumbnail: course?.thumbnail,
                thumbnailUrl: course?.thumbnailUrl,
              }}
              courseId={courseId}
            />

            <CategoryForm
              initialData={{ value: course?.category?.title }}
              courseId={courseId}
              options={mappedCategories}
            />

            <QuizSetForm
              initialData={{ quizSetId: course?.quizSet?._id?.toString() }}
              courseId={courseId}
              options={mappedQuizSet}
            />

            <EssayForm
              initialData={{ essayIds: course?.essayIds || [] }}
              courseId={courseId}
              options={mappedEssays}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="mb-6 flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">Danh sách module</h2>
              </div>

              <ModulesForm initialData={modules} courseId={courseId} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-xl">Bán khoá học của bạn</h2>
              </div>
              <PriceForm
                initialData={{ price: course?.price }}
                courseId={courseId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default EditCourse;
