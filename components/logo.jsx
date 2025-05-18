import Image from "next/image";
import React from "react";
import logo from "@/assets/logo.webp";
import { cn } from "@/lib/utils";

const Logo = ({ className = "" }) => {
  return (
    <div className="flex items-center gap-1">
      <Image width={30} height={30} src={logo} alt="logo" />
      <h1 className="text-2xl font-semibold uppercase text-[#147e7f]">
        Eduverse
      </h1>
    </div>
  );
};

export default Logo;
