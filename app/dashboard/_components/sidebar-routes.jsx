"use client";

import { BarChart, LogOut } from "lucide-react";

import { BookOpen } from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { BookA } from "lucide-react";
import { Radio } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const routes = [
  {
    icon: BarChart,
    label: "Analytics",
    href: "/dashboard",
  },
  {
    icon: BookOpen,
    label: "Courses",
    href: "/dashboard/courses",
  },
  {
    icon: BookOpen,
    label: "Add Course",
    href: "/dashboard/courses/add",
  },
  {
    icon: Radio,
    label: "Lives",
    href: "/dashboard/lives",
  },
  {
    icon: BookA,
    label: "Quizes",
    href: "/dashboard/quiz-sets",
  },
];

export const SidebarRoutes = () => {
  const router = useRouter();

  // const handleSignOut = async () => {
  //   await signOut({ redirect: false });
  //   router.push("/login");
  // };

  return (
    <div className="flex w-full flex-col">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}

      {/* Nút đăng xuất */}
      {/* <div className="mt-auto pt-4 border-t">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full p-3 text-sm text-muted-foreground font-medium hover:text-primary hover:bg-primary/10 transition"
        >
          <LogOut className="h-5 w-5 mr-3 text-muted-foreground" />
          Đăng xuất
        </button>
      </div> */}
    </div>
  );
};
