"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const UserButton = ({ user }) => {
  const router = useRouter();
  const fullName = user?.name || "Giảng viên";
  const email = user?.email || "";
  const avatarUrl = user?.image;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex h-auto w-full items-center justify-start gap-3 p-2 hover:bg-slate-200/50"
        >
          <Avatar className="h-10 w-10 border">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={fullName} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                {fullName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col items-start">
            <p className="max-w-[150px] truncate text-sm font-medium text-slate-700">
              {fullName}
            </p>
            <p className="max-w-[150px] truncate text-xs text-slate-500">
              {email}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push("/account")}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Hồ sơ</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-rose-500 focus:text-rose-500"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
