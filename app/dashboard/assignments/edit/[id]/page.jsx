import AssignmentForm from "../../_components/assignment-form";
import { getAssignment } from "@/queries/assignments";

const EditAssignmentPage = async ({ params }) => {
  const assignment = await getAssignment(params.id);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Chỉnh sửa Bài tập Tự luận</h1>
      <AssignmentForm courseId={assignment.course} initialData={assignment} />
    </div>
  );
};

export default EditAssignmentPage;
