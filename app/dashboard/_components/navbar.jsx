"use client";

import { Logo } from "@/components/logo";
import { MobileSidebar } from "./mobile-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../../hooks/useUserStore";
import { signOut } from "next-auth/react";

export const Navbar = () => {
  const user = useUserStore((s) => s.user);
  const router = useRouter();

  return (
    <div className="flex h-full items-center border-b bg-white p-4 shadow-sm">
      <MobileSidebar />
      <div className="flex w-full items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer">
              <Avatar>
                <AvatarImage
                  src={user?.profilePicture}
                  alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
                <AvatarFallback className="text-xs">
                  {user?.firstName?.[0] || ""}
                  {user?.lastName?.[0] || ""}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-4 w-56">
            <DropdownMenuItem className="cursor-pointer">
              <Link href="/account">Hồ sơ cá nhân</Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer">
              <Link
                href="#"
                onClick={() => {
                  signOut({ redirect: false }).then(() => {
                    router.push("/login");
                  });
                }}
              >
                Đăng xuất
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
