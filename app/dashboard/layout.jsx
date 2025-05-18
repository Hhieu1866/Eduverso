import { Navbar } from "./_components/navbar";
import Sidebar from "./_components/sidebar";
import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }) => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await getUserByEmail(session.user.email);
  if (user?.role !== "instructor") redirect("/");

  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-50 h-[80px] w-full lg:pl-56">
        <Navbar />
      </div>
      <div className="fixed inset-y-0 z-50 hidden h-full w-56 flex-col lg:flex">
        <Sidebar />
      </div>
      <main className="h-full pt-[80px] lg:pl-56">{children}</main>
    </div>
  );
};
export default DashboardLayout;
