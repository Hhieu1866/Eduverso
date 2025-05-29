import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "./model/user-model";
import { dbConnect } from "./service/mongo";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

const nextAuthConfig = {
  ...authConfig,
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập đầy đủ email và mật khẩu");
        }

        try {
          // Kết nối MongoDB trước khi truy vấn
          await dbConnect();

          // Tìm user dựa trên email
          const user = await User.findOne({ email: credentials.email }).lean();

          if (!user) {
            throw new Error("Tài khoản không tồn tại");
          }

          // Kiểm tra mật khẩu
          const isMatch = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (isMatch) {
            // Trả về thông tin user (không bao gồm mật khẩu)
            return {
              id: user._id.toString(),
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
              // Thêm các thông tin cần thiết khác
              firstName: user.firstName,
              lastName: user.lastName,
            };
          } else {
            throw new Error("Mật khẩu không chính xác");
          }
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  events: {
    async signOut() {
      // Không cần log ở đây
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(nextAuthConfig);
