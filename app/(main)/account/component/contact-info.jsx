"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Phone, Globe, Save } from "lucide-react";
import { updateUserInfo } from "@/app/actions/account";

const ContactInfo = ({ userInfo }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: userInfo?.phone || "",
    socialMedia: userInfo?.socialMedia || "",
  });

  const handleChange = (e) => {
    setContactInfo({
      ...contactInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await updateUserInfo(userInfo?.email, contactInfo);
      if (result?.success) {
        toast.success(result.message || "Thông tin liên hệ đã được cập nhật");
      } else {
        toast.error(result.message || "Không thể cập nhật thông tin liên hệ");
      }
    } catch (error) {
      toast.error("Không thể cập nhật thông tin liên hệ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Thông tin liên hệ
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Cập nhật thông tin liên hệ của bạn
        </CardDescription>
      </CardHeader>
      <Separator className="mb-6" />
      <CardContent className="space-y-6 px-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Phone className="h-4 w-4" />
              </div>
              <Input
                type="tel"
                name="phone"
                value={contactInfo.phone}
                onChange={handleChange}
                placeholder="Số điện thoại"
                className="pl-10 focus:ring-primary"
              />
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Globe className="h-4 w-4" />
              </div>
              <Input
                type="text"
                name="socialMedia"
                value={contactInfo.socialMedia}
                onChange={handleChange}
                placeholder="Link Facebook, Zalo, Instagram... của bạn"
                className="pl-10 focus:ring-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="default"
            className="gap-2"
            disabled={isLoading}
          >
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
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactInfo;
