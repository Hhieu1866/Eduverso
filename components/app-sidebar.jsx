"use client";

import {
  BookOpen,
  LayoutDashboard,
  LineChart,
  LifeBuoy,
  List,
  LogOut,
  Settings,
  Users,
  Video,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Định nghĩa các mục menu
const mainMenuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Người dùng",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Khóa học",
    url: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Buổi học trực tuyến",
    url: "/admin/lives",
    icon: Video,
  },
  {
    title: "Báo cáo",
    url: "/admin/reports",
    icon: LineChart,
  },
];

const settingsItems = [
  {
    title: "Cài đặt",
    url: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Trợ giúp",
    url: "/admin/help",
    icon: LifeBuoy,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Sidebar className="border-r shadow-sm transition-all">
      <SidebarHeader className="flex h-16 items-center justify-center border-b p-2">
        <Link
          href="/admin"
          className="flex items-center justify-center gap-3 font-semibold"
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={38}
            height={38}
            className="object-contain"
            priority
          />
          <span className="text-base">Quản trị hệ thống</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={cn(
                      "p-2",
                      pathname === item.url &&
                        "bg-black text-white hover:bg-black hover:text-white",
                    )}
                  >
                    <Link href={item.url} className="flex items-center gap-4">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={cn(
                      "p-2",
                      pathname === item.url &&
                        "bg-black text-white hover:bg-black hover:text-white",
                    )}
                  >
                    <Link href={item.url} className="flex items-center gap-4">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild className="p-2"></SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <button
          onClick={() => {
            signOut({ redirect: false }).then(() => {
              router.push("/login");
            });
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-red-500 transition hover:bg-red-50"
        >
          <LogOut className="size-5" />
          <span className="font-semibold">Đăng xuất</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
