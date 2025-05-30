This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cấu hình Vercel Blob

Dự án sử dụng Vercel Blob để lưu trữ và quản lý hình ảnh đại diện. Để cấu hình:

1. Đăng ký tài khoản trên [Vercel](https://vercel.com) nếu chưa có.
2. Tạo một Blob store mới trên Vercel Dashboard:
   - Vào phần Storage của dự án
   - Chọn "Connect Database"
   - Chọn "Blob"
   - Đặt tên cho store (ví dụ: "avatars")
   - Chọn "Create a new Blob store"
3. Sao chép token `BLOB_READ_WRITE_TOKEN` và thêm vào file `.env.local`:
   ```
   BLOB_READ_WRITE_TOKEN=your-blob-read-write-token
   ```
4. Cài đặt thư viện: `npm install @vercel/blob`

Sau khi cấu hình, chức năng tải lên ảnh đại diện sẽ hoạt động.
#   w e b * a d m i n * d o * a n * 2 0 2 5 - P u b l i c 
 
 
