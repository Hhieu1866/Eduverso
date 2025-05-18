import { NextResponse } from "next/server";
import { put, del } from '@vercel/blob';
import { User } from "@/model/user-model";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/service/mongo";

export async function POST(request) {
    try {
        // Đảm bảo kết nối MongoDB trước khi thực hiện các thao tác với database
        await dbConnect();
        
        const formData = await request.formData();
        const file = formData.get("file");
        const email = formData.get("email");

        if (!file || !email) {
            return NextResponse.json(
                { error: "Thiếu file hoặc email" },
                { status: 400 }
            );
        }

        // Kiểm tra kiểu file
        if (!file.type.includes("image/")) {
            return NextResponse.json(
                { error: "Vui lòng tải lên tệp hình ảnh" },
                { status: 400 }
            );
        }

        // Lấy thông tin người dùng
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { error: "Không tìm thấy người dùng" },
                { status: 404 }
            );
        }

        // Nếu người dùng đã có ảnh đại diện từ Vercel Blob, xóa nó
        if (user.profilePicture && user.profilePicture.includes("vercel-storage.com")) {
            try {
                await del(user.profilePicture);
            } catch (error) {
                console.error("Lỗi khi xóa ảnh đại diện cũ:", error);
                // Tiếp tục xử lý ngay cả khi xóa thất bại
            }
        }

        // Tạo tên file độc đáo bằng cách thêm mã người dùng và timestamp
        const fileName = `avatar-${user._id}-${Date.now()}`;
        
        // Upload ảnh lên Vercel Blob
        const blob = await put(fileName, file, {
            access: 'public',
            addRandomSuffix: true,
        });

        // Cập nhật URL ảnh đại diện trong database
        await User.updateOne(
            { email },
            { $set: { profilePicture: blob.url } }
        );

        // Revalidate các đường dẫn để hiển thị ảnh mới
        revalidatePath('/account');
        revalidatePath('/');

        return NextResponse.json({
            success: true,
            message: "Đã cập nhật ảnh đại diện",
            url: blob.url
        });
    } catch (error) {
        console.error("Lỗi khi xử lý tải lên ảnh đại diện:", error);
        return NextResponse.json(
            { error: error.message || "Lỗi khi xử lý tải lên" },
            { status: 500 }
        );
    }
} 