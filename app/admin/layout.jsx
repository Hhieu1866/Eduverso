import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";
import { redirect } from "next/navigation";
import { AdminSidebarWrapper } from "./_components/client-sidebar-wrapper";
import AdminHeader from "./_components/admin-header";

export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await getUserByEmail(session.user.email);
  if (user?.role !== "admin") redirect("/");

  return (
    <>
      <AdminSidebarWrapper>
        <div className="flex min-h-screen flex-col">
          <AdminHeader user={user} />
          <div className="flex-1 p-6">{children}</div>
        </div>
      </AdminSidebarWrapper>
    </>
  );
}
