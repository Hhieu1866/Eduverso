import { NextResponse } from "next/server";
import { Assignment } from "@/model/assignment-model";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, course, lesson, dueDate, maxFileSize, allowedFileTypes, maxScore, isRequired, status, instructions } = await request.json();

    const assignment = new Assignment({
      title,
      description,
      course,
      lesson,
      dueDate,
      maxFileSize,
      allowedFileTypes,
      maxScore,
      isRequired,
      status,
      instructions,
      createdBy: session.user.id,
    });

    const savedAssignment = await assignment.save();

    return NextResponse.json(savedAssignment, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json({ message: "Failed to create assignment", error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const assignments = await Assignment.find().populate("course").populate("lesson");
    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ message: "Failed to fetch assignments", error: error.message }, { status: 500 });
  }
}
