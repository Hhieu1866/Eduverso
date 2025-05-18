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
      <SidebarHeader className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-3 font-semibold">
          <List className="h-5 w-5" />
          <span>Quản trị hệ thống</span>
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="p-2">
                  <button
                    onClick={() => {
                      signOut({ redirect: false }).then(() => {
                        router.push("/login");
                      });
                    }}
                    className="flex w-full items-center gap-4 text-red-500"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Đăng xuất</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/placeholders/user.png" alt="Avatar" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Admin</span>
            <span className="text-xs text-muted-foreground">
              admin@email.com
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
