"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ceredntialLogin } from "@/app/actions";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email");
      const password = formData.get("password");

      // Kiểm tra cơ bản ở client side trước khi gửi request
      if (!email || !password) {
        toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
        setIsLoading(false);
        return;
      }

      const response = await ceredntialLogin(formData);

      if (response?.error) {
        toast.error(response.error);
        setIsLoading(false);
      } else {
        toast.success("Đăng nhập thành công!");

        // Lấy role từ response
        const userRole = response?.user?.role;

        // Xác định URL chuyển hướng dựa trên role
        let redirectUrl = "/courses"; // Mặc định cho student

        if (userRole === "admin") {
          redirectUrl = "/admin";
        } else if (userRole === "instructor") {
          redirectUrl = "/dashboard";
        }

        // Chuyển hướng người dùng và đảm bảo push được thực hiện
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 300);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
      setIsLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-sm border-0 drop-shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">
          <p className="font-pj mt-5 text-3xl font-bold leading-tight text-gray-900 sm:text-5xl sm:leading-tight lg:text-3xl lg:leading-tight">
            <span className="relative inline-flex sm:inline">
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] opacity-30 blur-lg filter"></span>
              <span className="relative">Đăng nhập</span>
            </span>
          </p>
        </CardTitle>
        <CardDescription>
          Nhập email và mật khẩu để đăng nhập vào tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                required
                disabled={isLoading}
                className="focus:ring-primary"
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mật khẩu</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  className="pr-10 focus:ring-primary"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-2 mt-2 flex items-center justify-between">
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 accent-primary focus:ring-2 focus:ring-primary"
                  name="remember"
                  id="remember"
                />
                <span>Nhớ mật khẩu</span>
              </label>
              <Link
                href="#"
                className="text-sm font-medium text-primary transition hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-faster-spin" />
                  Đang xử lý...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-primary underline hover:text-primary/80"
            >
              Đăng ký
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
