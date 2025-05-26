"use client";

import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "./admin-sidebar";
import AdminHeader from "./admin-header";

export default function AdminClientLayout({ children, user }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("admin-sidebar-collapsed");
    if (savedState !== null) {
      setSidebarCollapsed(savedState === "true");
    }
  }, []);

  return (
    <SidebarProvider
      collapsed={sidebarCollapsed}
      setCollapsed={setSidebarCollapsed}
    >
      <div className="flex h-screen bg-background">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <SidebarInset className="flex flex-1 flex-col">
          <AdminHeader user={user} />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
