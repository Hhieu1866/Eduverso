import { NextResponse } from "next/server";
import { Assignment } from "@/model/assignment-model";
import { AssignmentSubmission } from "@/model/assignment-submission-model";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { submittedFiles, submissionText } = await request.json();

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
    }

    const submission = new AssignmentSubmission({
      assignment: id,
      student: session.user.id,
      course: assignment.course,
      submittedFiles,
      submissionText,
    });

    const savedSubmission = await submission.save();

    return NextResponse.json(savedSubmission, { status: 201 });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json({ message: "Failed to submit assignment", error: error.message }, { status: 500 });
  }
}
