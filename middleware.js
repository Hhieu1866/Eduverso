import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { PUBLIC_ROUTES, LOGIN, ROOT, PROTECTED_ROUTES } from "@/lib/routes";

export async function middleware(request) {
  const { nextUrl } = request;

  // Auth middleware
  const auth = await NextAuth(authConfig).auth(request);
  const isAuthenticated = !!auth;

  const isPublicRoute =
    PUBLIC_ROUTES.some((route) => nextUrl.pathname.startsWith(route)) ||
    nextUrl.pathname === ROOT;

  // Kiểm tra nếu người dùng đang truy cập trang bảo vệ nghiêm ngặt (admin/instructor)
  const isStrictlyProtectedRoute = PROTECTED_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  // Nếu trang yêu cầu xác thực và người dùng chưa đăng nhập
  if (!isAuthenticated && (!isPublicRoute || isStrictlyProtectedRoute)) {
    return NextResponse.redirect(new URL(LOGIN, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next|favicon.ico|.*\\..*).*)", "/api/:path*", "/"],
};
