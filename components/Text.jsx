"use client";
import React from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const Text = () => {
  const handleClick = (mode) => {
    mode ? toast.success("Thành công!") : toast.error("Lỗi thử nghiệm");
  };

  return (
    <div>
      <Button
        className="bg-red-600"
        variant="default"
        onClick={() => handleClick(false)}
      >
        Nhấn thử
      </Button>
    </div>
  );
};

export default Text;
