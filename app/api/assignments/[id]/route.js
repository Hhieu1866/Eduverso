import { NextResponse } from "next/server";
import { Assignment } from "@/model/assignment-model";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const assignment = await Assignment.findById(id).populate("course").populate("lesson");

    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json(assignment, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json({ message: "Failed to fetch assignment", error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { title, description, course, lesson, dueDate, maxFileSize, allowedFileTypes, maxScore, isRequired, status, instructions } = await request.json();

    const assignment = await Assignment.findByIdAndUpdate(id, {
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
      updatedBy: session.user.id,
    }, { new: true });

    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json(assignment, { status: 200 });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json({ message: "Failed to update assignment", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Assignment deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json({ message: "Failed to delete assignment", error: error.message }, { status: 500 });
  }
}
