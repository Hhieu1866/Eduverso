"use client";
import React from "react";
import Logo from "./logo";
import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";

const SiteFooter = () => {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    // console.log("Newsletter subscription submitted");
  };

  return (
    <footer className="bg-white pb-6 pt-16 text-slate-700">
      <div className="container">
        {/* Footer Main Content */}
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <div className="mb-4">
              <Logo className="h-8 w-auto" />
            </div>
            <p className="mb-4 text-sm text-slate-500">
              Eduverse là nền tảng học trực tuyến hàng đầu, cung cấp các lộ
              trình học chất lượng cao từ các giảng viên hàng đầu trong nhiều
              lĩnh vực khác nhau.
            </p>
            <div className="mt-4 flex space-x-4">
              <Link
                href="#"
                className="text-slate-500 transition-colors hover:text-primary"
              >
                <Facebook size={20} />
              </Link>
              <Link
                href="#"
                className="text-slate-500 transition-colors hover:text-primary"
              >
                <Twitter size={20} />
              </Link>
              <Link
                href="#"
                className="text-slate-500 transition-colors hover:text-primary"
              >
                <Instagram size={20} />
              </Link>
              <Link
                href="#"
                className="text-slate-500 transition-colors hover:text-primary"
              >
                <Linkedin size={20} />
              </Link>
              <Link
                href="#"
                className="text-slate-500 transition-colors hover:text-primary"
              >
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-primary">Khám phá</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/courses"
                  className="text-sm text-slate-600 transition-colors hover:text-primary"
                >
                  Khóa học
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-slate-600 transition-colors hover:text-primary"
                >
                  Danh mục
                </Link>
              </li>
              <li>
                <Link
                  href="/inst-profile"
                  className="text-sm text-slate-600 transition-colors hover:text-primary"
                >
                  Giảng viên
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 transition-colors hover:text-primary"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 transition-colors hover:text-primary"
                >
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-primary">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <MapPin className="h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-sm text-slate-500">
                  CT8C, khu đô thị Dương Nội 2, phường Yên Nghĩa, phường Hà
                  Đông, thành phố Hà Nội
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <a
                  href="tel:+84987654321"
                  className="text-sm text-slate-600 transition-colors hover:text-primary"
                >
                  (84) 982 551 866
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href="mailto:contact@eduverse.com"
                  className="text-sm text-slate-600 transition-colors hover:text-primary"
                >
                  support@eduverse.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-primary">
              Đăng ký nhận tin
            </h3>
            <p className="mb-4 text-sm text-slate-500">
              Nhận thông báo về khóa học mới và ưu đãi đặc biệt.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col space-y-2"
            >
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="border-slate-300 bg-white pr-10 text-slate-700 placeholder:text-slate-400"
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-1"
                  variant="ghost"
                >
                  <Send className="h-4 w-4 text-primary" />
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                Chúng tôi tôn trọng quyền riêng tư của bạn. Xem
                <Link href="#" className="ml-1 text-primary hover:underline">
                  Chính sách bảo mật
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-slate-200"></div>

        {/* Footer Bottom */}
        <div className="flex flex-col items-center justify-between md:flex-row">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Eduverse. Tất cả các quyền được bảo
            lưu.
          </p>
          <div className="mt-4 flex space-x-4 md:mt-0">
            <Link
              href="#"
              className="text-sm text-slate-500 transition-colors hover:text-primary"
            >
              Điều khoản sử dụng
            </Link>
            <Link
              href="#"
              className="text-sm text-slate-500 transition-colors hover:text-primary"
            >
              Chính sách bảo mật
            </Link>
            <Link
              href="#"
              className="text-sm text-slate-500 transition-colors hover:text-primary"
            >
              Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
