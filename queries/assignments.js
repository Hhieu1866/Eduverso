import { Assignment } from "@/model/assignment-model";
import { dbConnect } from "@/service/mongo";

export const getAssignment = async (id) => {
  try {
    await dbConnect();
    const assignment = await Assignment.findById(id);
    return assignment;
  } catch (error) {
    console.error("Error fetching assignment:", error);
    throw new Error("Failed to fetch assignment");
  }
};
