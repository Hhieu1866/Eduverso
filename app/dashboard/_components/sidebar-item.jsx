"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const SidebarItem = ({ icon: Icon, label, href }) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = pathname === href;

  const onClick = () => {
    router.push(href);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            type="button"
            className={cn(
              "group relative mb-1 flex w-full items-center gap-x-3 overflow-hidden rounded-lg px-4 py-3 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-700",
              isActive
                ? "bg-primary/10 font-semibold text-primary shadow-sm"
                : "hover:bg-slate-100",
            )}
          >
            <Icon
              size={20}
              className={cn(
                "text-slate-400 transition-colors duration-200",
                isActive ? "text-primary" : "group-hover:text-slate-700",
              )}
            />

            <span>{label}</span>

            {isActive && (
              <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
