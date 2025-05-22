import Logo from "@/components/logo";
import { SidebarRoutes } from "./sidebar-routes";
import Link from "next/link";
import { auth } from "@/auth";
import { UserButton } from "./user-button";

const Sidebar = async () => {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r bg-gradient-to-b from-white to-primary/5 shadow-md transition-all duration-300">
      {/* Header với logo */}
      <div className="border-b p-6">
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <Logo />
        </Link>
      </div>

      {/* Menu routes */}
      <div className="flex flex-1 flex-col px-2 py-4">
        <div className="mb-2 px-4"></div>
        <SidebarRoutes />
      </div>

      {/* User profile */}
      <div className="mt-auto border-t p-4">
        <UserButton user={user} />
      </div>
    </div>
  );
};

export default Sidebar;
