import { NextResponse } from "next/server";
import { del } from '@vercel/blob';
import { User } from "@/model/user-model";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/service/mongo";

export async function POST(request) {
    try {
        // Đảm bảo kết nối MongoDB trước khi thực hiện các thao tác với database
        await dbConnect();
        
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Thiếu email người dùng" },
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

        // Cập nhật URL ảnh đại diện bằng cách xóa giá trị
        await User.updateOne(
            { email },
            { $unset: { profilePicture: "" } }
        );

        // Revalidate các đường dẫn để hiển thị ảnh mới
        revalidatePath('/account');
        revalidatePath('/');

        return NextResponse.json({
            success: true,
            message: "Đã xóa ảnh đại diện"
        });
    } catch (error) {
        console.error("Lỗi khi xử lý xóa ảnh đại diện:", error);
        return NextResponse.json(
            { error: error.message || "Lỗi khi xử lý xóa ảnh" },
            { status: 500 }
        );
    }
} 