"use client";

import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Radio,
  Book,
  Settings,
  Users,
  BarChart3,
  FileText,
  HelpCircle,
} from "lucide-react";
import { SidebarItem } from "./sidebar-item";

// Các route được tổ chức theo nhóm
const routeGroups = [
  {
    groupName: "Quản lý nội dung",
    routes: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/dashboard",
      },
      {
        icon: BookOpen,
        label: "Khóa học",
        href: "/dashboard/courses",
      },
      {
        icon: PlusCircle,
        label: "Thêm khóa học",
        href: "/dashboard/courses/add",
      },
      {
        icon: Radio,
        label: "Buổi học trực tuyến",
        href: "/dashboard/lives",
      },
      {
        icon: Book,
        label: "Bộ câu hỏi",
        href: "/dashboard/quiz-sets",
      },
    ],
  },
  // {
  //   groupName: "Thống kê",
  //   routes: [
  //     {
  //       icon: BarChart3,
  //       label: "Báo cáo",
  //       href: "/dashboard/reports",
  //     },
  //     {
  //       icon: Users,
  //       label: "Học viên",
  //       href: "/dashboard/students",
  //     },
  //   ],
  // },
  // {
  //   groupName: "Hệ thống",
  //   routes: [
  //     {
  //       icon: Settings,
  //       label: "Cài đặt",
  //       href: "/dashboard/settings",
  //     },
  //     {
  //       icon: HelpCircle,
  //       label: "Trợ giúp",
  //       href: "/dashboard/help",
  //     },
  //   ],
  // },
];

export const SidebarRoutes = () => {
  return (
    <div className="flex flex-col">
      {routeGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-6">
          {group.groupName && (
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {group.groupName}
            </h3>
          )}
          <div className="space-y-1">
            {group.routes.map((route) => (
              <SidebarItem
                key={route.href}
                icon={route.icon}
                label={route.label}
                href={route.href}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
