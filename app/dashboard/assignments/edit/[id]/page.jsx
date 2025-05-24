
import AssignmentForm from "../_components/assignment-form";
import { getCourseDetailsForInstructor } from "@/queries/courses";
import { getAssignment } from "@/queries/assignments";

const EditAssignmentPage = async ({ params }) => {
  const assignment = await getAssignment(params.id);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa Bài tập Tự luận</h1>
      <AssignmentForm courseId={assignment.course} initialData={assignment} />
    </div>
  );
};

export default EditAssignmentPage;
