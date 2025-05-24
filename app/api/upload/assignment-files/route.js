import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const filename = file.name.replace(/[^a-zA-Z0-9\\.]/g, "_");
    const blob = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url }, { status: 200 });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ message: "Failed to upload file", error: error.message }, { status: 500 });
  }
}
