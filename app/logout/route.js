import { signOut } from "@/auth";
import { redirect } from "next/navigation";

export async function GET() {
  try {
    await signOut();
  } catch (error) {}
  redirect("/login");
}
