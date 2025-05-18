"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { changePassword } from "@/app/actions/account";
import { Loader2, KeyRound, LockKeyhole, Lock } from "lucide-react";

const ChangePassword = ({ email }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordState, setPasswordState] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPasswordState((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwordState.oldPassword) {
      newErrors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!passwordState.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (passwordState.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function doPasswordChange(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    console.log("Client: Bắt đầu gửi yêu cầu đổi mật khẩu", { email });

    try {
      const result = await changePassword(
        email,
        passwordState.oldPassword,
        passwordState.newPassword,
      );
      console.log("Client: Kết quả từ server", result);

      if (result?.success) {
        toast.success(
          result.message || "Mật khẩu đã được thay đổi thành công",
        );

        // Reset form after success
        setPasswordState({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error("Cập nhật mật khẩu không thành công");
      }
    } catch (error) {
      console.error("Client: Lỗi khi đổi mật khẩu", error);
      toast.error(`Lỗi: ${error.message || "Không thể đổi mật khẩu"}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Đổi mật khẩu
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Cập nhật mật khẩu để bảo vệ tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <Separator className="mb-6" />
      <CardContent className="px-0">
        <form onSubmit={doPasswordChange} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword" className="text-sm font-medium">
                Mật khẩu hiện tại
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <KeyRound className="h-4 w-4" />
                </div>
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  value={passwordState.oldPassword}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  className={`pl-10 focus:ring-primary ${
                    errors.oldPassword
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
              </div>
              {errors.oldPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.oldPassword}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                Mật khẩu mới
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <LockKeyhole className="h-4 w-4" />
                </div>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordState.newPassword}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới"
                  className={`pl-10 focus:ring-primary ${
                    errors.newPassword
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Nhập lại mật khẩu mới
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordState.confirmPassword}
                  onChange={handleChange}
                  placeholder="Xác nhận mật khẩu mới"
                  className={`pl-10 focus:ring-primary ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="default"
            className="gap-2 w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang cập nhật...</span>
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                <span>Cập nhật mật khẩu</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;
