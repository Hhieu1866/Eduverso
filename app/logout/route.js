import { signOut } from "@/auth";
import { redirect } from "next/navigation";

export async function GET() {
  try {
    await signOut();
  } catch (error) {
    // Có thể log lỗi nếu cần, hoặc gửi log về server nếu muốn
  }
  redirect("/login");
}
