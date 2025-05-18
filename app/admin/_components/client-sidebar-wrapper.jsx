"use client"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export function AdminSidebarWrapper({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-0 m-0 bg-white dark:bg-background shadow-sm">
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 