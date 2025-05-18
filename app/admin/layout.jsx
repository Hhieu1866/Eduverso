import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";
import { redirect } from "next/navigation";
import { AdminSidebarWrapper } from "./_components/client-sidebar-wrapper";

export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await getUserByEmail(session.user.email);
  if (user?.role !== "admin") redirect("/");

  return (
    <>
      <AdminSidebarWrapper>
        <div className="p-6">{children}</div>
      </AdminSidebarWrapper>
    </>
  );
}
