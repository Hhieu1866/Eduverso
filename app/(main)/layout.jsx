import MainNav from "@/components/main-nav";
import SiteFooter from "@/components/site-footer";
import React from "react";
import { SessionProvider } from "next-auth/react";

const navLinks = [
  {
    title: "Tính năng",
    href: "/features",
  },
  {
    title: "Khóa học",
    href: "/courses",
  },
  {
    title: "Dịch vụ",
    href: "/pricing",
  },
  {
    title: "Bài viết",
    href: "/blog",
  },
  {
    title: "Tài liệu",
    href: "/documentation",
  },
];

const MainLayout = ({ children }) => {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col">
        <header className="fixed left-0 right-0 top-0 z-40 border-b bg-background/60 backdrop-blur-md">
          <div className="container flex h-20 items-center justify-between py-6">
            <MainNav items={navLinks} />
          </div>
        </header>

        <main className="flex flex-1 flex-col border-b border-gray-700 pt-20">
          {" "}
          {children}{" "}
        </main>
        <SiteFooter />
      </div>
    </SessionProvider>
  );
};

export default MainLayout;
