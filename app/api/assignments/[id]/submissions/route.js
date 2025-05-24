import { NextResponse } from "next/server";
import { Assignment } from "@/model/assignment-model";
import { AssignmentSubmission } from "@/model/assignment-submission-model";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
    }

    // Only allow instructors to view submissions for their own courses
    // if (assignment.createdBy.toString() !== session.user.id && session.user.role !== "admin") {
    //   return NextResponse.json({ message: "Unauthorized to view submissions for this assignment" }, { status: 403 });
    // }

    const submissions = await AssignmentSubmission.find({ assignment: id }).populate("student");
    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignment submissions:", error);
    return NextResponse.json({ message: "Failed to fetch assignment submissions", error: error.message }, { status: 500 });
  }
}
