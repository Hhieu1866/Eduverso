"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Users,
  LayoutDashboard,
  Book,
  VideoIcon,
  FileQuestion,
  Settings,
  ChevronLeft,
  ChevronRight,
  GalleryVerticalEnd,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarTrigger,
  SidebarScrollArea,
  SidebarSection,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { signOut } from "next-auth/react";

export default function AdminSidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();

  // Lưu trạng thái toggle vào localStorage
  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", collapsed);
  }, [collapsed]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Người dùng",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Khóa học",
      href: "/admin/courses",
      icon: <Book className="h-5 w-5" />,
    },
    {
      title: "Buổi học trực tuyến",
      href: "/admin/lives",
      icon: <VideoIcon className="h-5 w-5" />,
    },
    {
      title: "Bộ câu hỏi",
      href: "/admin/quizzes",
      icon: <FileQuestion className="h-5 w-5" />,
    },
    {
      title: "Cài đặt",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <Sidebar
      variant="inset"
      className="bg-sidebar-background border-r border-border/40 shadow-sm transition-all duration-300"
      collapsed={collapsed}
    >
      {/* Menu Items */}
      <SidebarScrollArea className="h-[calc(100vh-8rem)] pt-2">
        <SidebarSection>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  {collapsed ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          href={item.href}
                          isActive={isActive}
                          asChild
                          className={cn(
                            "flex h-10 w-full items-center justify-center rounded-md px-2 transition-all duration-200",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground",
                          )}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center justify-center"
                          >
                            {item.icon}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="border bg-popover text-popover-foreground"
                      >
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton
                      href={item.href}
                      isActive={isActive}
                      asChild
                      className={cn(
                        "flex h-10 w-full items-center gap-3 rounded-md px-3 transition-all duration-200",
                        isActive
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <Link href={item.href} className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarSection>
      </SidebarScrollArea>

      {/* Footer with Actions */}
      <div className="mt-auto border-t border-border/40 p-3">
        {/* User profile button (example) */}
        <div className="mb-3 flex items-center gap-3 rounded-md bg-accent/50 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">Admin User</p>
              <p className="truncate text-xs text-muted-foreground">
                admin@example.com
              </p>
            </div>
          )}
        </div>

        {/* Nút đăng xuất */}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="mb-2 w-full"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="border bg-popover text-popover-foreground"
            >
              Đăng xuất
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="mb-2 w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </Button>
        )}

        {/* Collapse button */}
        <SidebarTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-center transition-all duration-300",
              collapsed ? "rounded-md" : "gap-2",
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Thu gọn</span>
              </>
            )}
          </Button>
        </SidebarTrigger>
      </div>
    </Sidebar>
  );
}
