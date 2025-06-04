"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { updateUserInfo } from "@/app/actions/account";
import { Loader2, Save } from "lucide-react";

const PersonalDetails = ({ userInfo }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [infoState, setInfoState] = useState({
    firstName: userInfo.firstName || "",
    lastName: userInfo.lastName || "",
    email: userInfo.email || "",
    designation: userInfo.designation || "",
    bio: userInfo.bio || "",
  });

  const handleChange = (event) => {
    const field = event.target.name;
    const value = event.target.value;
    setInfoState({
      ...infoState,
      [field]: value,
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // console.log(
    //   "Client: Bắt đầu gửi yêu cầu cập nhật thông tin người dùng",
    //   infoState,
    // );

    try {
      const result = await updateUserInfo(userInfo?.email, infoState);
      // console.log("Client: Kết quả từ server", result);

      if (result?.success) {
        toast.success(
          result.message || "Thông tin đã được cập nhật thành công",
        );
      } else {
        toast.error("Cập nhật không thành công");
      }
    } catch (error) {
      console.error("Client: Lỗi khi cập nhật thông tin", error);
      toast.error(`Lỗi: ${error.message || "Không thể cập nhật thông tin"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-2xl font-bold text-colors-navy dark:text-slate-200">
            Thông tin cá nhân
          </CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Cập nhật thông tin cá nhân của bạn
          </CardDescription>
        </CardHeader>
        <Separator className="mb-6" />
        <CardContent className="space-y-6 px-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="font-semibold text-colors-navy"
              >
                Họ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={infoState?.firstName}
                onChange={handleChange}
                placeholder="Nhập họ của bạn"
                required
                className="focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="font-semibold text-colors-navy"
              >
                Tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={infoState?.lastName}
                onChange={handleChange}
                placeholder="Nhập tên của bạn"
                required
                className="focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-colors-navy">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={infoState?.email}
                onChange={handleChange}
                disabled
                className="cursor-not-allowed bg-muted"
              />
              <p className="mt-1 text-xs font-medium italic text-muted-foreground">
                Email không thể thay đổi
              </p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="designation"
                className="font-semibold text-colors-navy"
              >
                Nghề nghiệp
              </Label>
              <Input
                id="designation"
                name="designation"
                value={infoState?.designation}
                onChange={handleChange}
                placeholder="Nhập nghề nghiệp của bạn"
                className="focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="font-semibold text-colors-navy">
              Giới thiệu bản thân
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={infoState?.bio}
              onChange={handleChange}
              placeholder="Viết một vài điều về bản thân bạn..."
              rows={6}
              className="min-h-[120px] w-full resize-y rounded-md border border-gray-200 p-3 text-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end px-0 pt-6">
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default PersonalDetails;
