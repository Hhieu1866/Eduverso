"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const menu = [
  { label: "Hồ sơ cá nhân", href: "/account" },
  { label: "Lộ trình đã đăng ký", href: "/account/enrolled-courses" },
];

function Menu() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <ul className="sidebar-nav mb-0 mt-3 list-none" id="navmenu-nav">
      {menu.map((item, i) => (
        <li className="navbar-item account-menu" key={i}>
          <Link
            href={item.href}
            className={`navbar-link flex items-center rounded py-2 ${
              pathname === item.href ? "text-primary" : "text-slate-500"
            }`}
          >
            <h6 className="mb-0 font-semibold">{item?.label}</h6>
          </Link>
        </li>
      ))}
      <li className="navbar-item account-menu">
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            signOut({ redirect: false }).then(() => {
              router.push("/login");
            });
          }}
          className="navbar-link flex items-center rounded py-2 text-slate-400"
        >
          <h6 className="mb-0 font-semibold text-red-600">Đăng xuất</h6>
        </Link>
      </li>
    </ul>
  );
}

export default Menu;
