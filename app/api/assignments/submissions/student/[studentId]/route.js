import { NextResponse } from "next/server";
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

    const { studentId } = params;

    // Only allow the student themselves or an admin to view their submissions
    if (session.user.id !== studentId && session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized to view these submissions" }, { status: 403 });
    }

    const submissions = await AssignmentSubmission.find({ student: studentId }).populate("assignment");
    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignment submissions for student:", error);
    return NextResponse.json({ message: "Failed to fetch assignment submissions", error: error.message }, { status: 500 });
  }
}
