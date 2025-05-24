import { NextResponse } from "next/server";
import { AssignmentSubmission } from "@/model/assignment-submission-model";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { score, feedback } = await request.json();

    const submission = await AssignmentSubmission.findByIdAndUpdate(id, {
      score,
      feedback,
      status: "graded",
      gradedBy: session.user.id,
      gradedAt: Date.now(),
    }, { new: true });

    if (!submission) {
      return NextResponse.json({ message: "Assignment submission not found" }, { status: 404 });
    }

    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    console.error("Error grading assignment submission:", error);
    return NextResponse.json({ message: "Failed to grade assignment submission", error: error.message }, { status: 500 });
  }
}
