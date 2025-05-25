"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
        toast.error("Vui lòng nhập đầy đủ email và mật khẩu", {
          duration: 3000,
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }

      const response = await ceredntialLogin(formData);

      if (!!response?.error) {
        console.log(response.error);
        // Hiển thị lỗi với toast
        toast.error(response.error, {
          duration: 4000,
          position: "top-center",
          id: "login-error",
        });
        setIsLoading(false);
      } else {
        toast.success("Đăng nhập thành công!", {
          duration: 3000,
          position: "top-center",
        });

        // Kiểm tra role của người dùng để chuyển hướng phù hợp
        const userEmail = formData.get("email");
        try {
          // Lấy thông tin vai trò người dùng
          const userResponse = await fetch(
            `/api/users/check-role?email=${encodeURIComponent(userEmail)}`,
          );
          const userData = await userResponse.json();

          if (userData.role === "admin") {
            // Nếu là admin, chuyển đến trang admin dashboard
            router.push("/admin");
          } else if (userData.role === "instructor") {
            // Nếu là instructor, chuyển đến trang dashboard
            router.push("/dashboard");
          } else {
            // Nếu là người dùng thông thường (student), chuyển đến trang courses
            router.push("/courses");
          }
        } catch (err) {
          // Nếu có lỗi khi kiểm tra role, vẫn chuyển đến trang courses
          console.error("Lỗi khi kiểm tra role:", err);
          router.push("/courses");
        }
      }
    } catch (error) {
      // Hiển thị lỗi với toast
      toast.error(error.message || "Đã xảy ra lỗi khi đăng nhập", {
        duration: 4000,
        position: "top-center",
      });
      setIsLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
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
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mật khẩu</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="" />
              <p>Nhớ mật khẩu</p>
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
          <Link href="#" className="ml-auto inline-block text-sm underline">
            Quên mật khẩu?
          </Link>
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
