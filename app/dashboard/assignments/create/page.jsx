import AssignmentForm from "../_components/assignment-form";
import { getCourseDetailsForInstructor } from "@/queries/courses";

const CreateAssignmentPage = async ({ searchParams }) => {
  const courseId = searchParams.courseId;
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Thêm Bài tập Tự luận</h1>
      <AssignmentForm courseId={courseId} />
    </div>
  );
};

export default CreateAssignmentPage;
