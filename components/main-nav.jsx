"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Logo from "./logo";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import MobileNav from "./mobile-nav";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const MainNav = ({ items, children }) => {
  const { data: session } = useSession();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loginSession, setLoginSession] = useState(null);
  const router = useRouter();

  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    setLoginSession(session);
    async function fetchMe() {
      try {
        const response = await fetch("/api/me");
        const data = await response.json();
        // console.log(data);
        setLoggedInUser(data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchMe();
  }, [session]);

  return (
    <>
      <div className="flex gap-6 lg:gap-10">
        <Link href="/">
          <Logo />
        </Link>
        {items?.length ? (
          <nav className="hidden gap-6 lg:flex">
            {items?.map((item, index) => (
              <Link
                key={index}
                href={item.disable ? "#" : item.href}
                className={cn(
                  "flex items-center text-lg font-semibold text-colors-navy transition-colors hover:text-gray-500 sm:text-sm",
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        ) : null}

        {showMobileMenu && items && (
          <MobileNav items={items}>{children}</MobileNav>
        )}
      </div>

      <nav className="flex items-center gap-3">
        {!loginSession && (
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "sm" }), "px-4")}
            >
              Login
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Register
            </Link>
          </div>
        )}

        {loginSession && (
          <div className="flex items-center gap-2">
            {loggedInUser && (
              <span className="mr-2 hidden text-sm font-semibold text-gray-600 md:inline-block">
                Xin chào,{" "}
                {loggedInUser.fullName ||
                  (loggedInUser.firstName || "") +
                    (loggedInUser.lastName ? " " + loggedInUser.lastName : "")}
              </span>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="cursor-pointer">
                  <Avatar>
                    <AvatarImage
                      src={loggedInUser?.profilePicture}
                      alt={`${loggedInUser?.firstName || ""} ${
                        loggedInUser?.lastName || ""
                      }`}
                      style={{ objectFit: "cover", objectPosition: "center" }}
                    />
                    <AvatarFallback className="text-xs">
                      {loggedInUser?.firstName?.[0] || ""}
                      {loggedInUser?.lastName?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="mt-4 w-56 font-semibold text-colors-navy"
              >
                {loggedInUser?.role === "instructor" && (
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href="/dashboard">
                      {" "}
                      <strong className="text-colors-navy">
                        Tới trang quản trị
                      </strong>{" "}
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/account" className="text-gray-600">
                    Hồ sơ cá nhân
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link
                    href="/account/enrolled-courses"
                    className="text-gray-600"
                  >
                    Lộ trình của bạn
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="" className="text-gray-600">
                    Chứng chỉ đã nhận
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                      signOut({ redirect: false }).then(() => {
                        router.push("/login");
                      });
                    }}
                    className="text-red-600"
                  >
                    Đăng xuất
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <button
          className="flex items-center space-x-2 lg:hidden"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X /> : <Menu />}
        </button>
      </nav>
    </>
  );
};

export default MainNav;
