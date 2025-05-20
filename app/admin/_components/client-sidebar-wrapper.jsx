"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export function AdminSidebarWrapper({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="m-0 bg-white p-0 shadow-sm dark:bg-background">
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
