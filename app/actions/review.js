"use server";

import { Course } from "@/model/course-model";
import { Testimonial } from "@/model/testimonial-model";
import { revalidatePath } from "next/cache";

export async function createReview(data, loginid, courseId) {
  // console.log("Bắt đầu tạo review với data:", JSON.stringify(data));
  // console.log("loginid:", loginid);
  // console.log("courseId:", courseId);

  try {
    const { review, rating } = data;

    // Kiểm tra dữ liệu đầu vào
    if (!review || !rating) {
      console.error("Thiếu dữ liệu đầu vào:", { review, rating });
      return {
        success: false,
        message: "Nội dung đánh giá và rating không được để trống",
      };
    }

    if (!loginid) {
      console.error("Người dùng không hợp lệ");
      return { success: false, message: "Bạn cần đăng nhập để đánh giá" };
    }

    if (!courseId) {
      console.error("Khóa học không hợp lệ");
      return { success: false, message: "Không tìm thấy khóa học" };
    }

    // console.log("Đang tạo testimonial với:", {
    //   content: review,
    //   user: loginid,
    //   courseId,
    //   rating: Number(rating),
    // });

    const newTestimonial = await Testimonial.create({
      content: review,
      user: loginid,
      courseId,
      rating: Number(rating),
    });

    if (!newTestimonial) {
      console.error("Không thể tạo testimonial");
      return { success: false, message: "Không thể tạo đánh giá" };
    }

    // console.log("Đã tạo testimonial:", newTestimonial);

    // Cập nhật khóa học
    const updateCourse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { testimonials: newTestimonial._id } },
      { new: true }, // Return the updated course document
    );

    if (!updateCourse) {
      console.error("Không thể cập nhật testimonial cho khóa học");
      return {
        success: false,
        message: "Không thể cập nhật khóa học với đánh giá",
      };
    }

    // console.log("Đã cập nhật khóa học với testimonial mới");

    // Revalidate các trang có thể hiển thị đánh giá
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/courses/${courseId}/lesson`);

    return {
      success: true,
      message: "Đã thêm đánh giá thành công",
      data: {
        id: newTestimonial._id.toString(),
        content: newTestimonial.content,
        rating: newTestimonial.rating,
      },
    };
  } catch (error) {
    console.error("Lỗi khi tạo review:", error);

    // Trả về object có thể serializable thay vì throw Error
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tạo đánh giá",
    };
  }
}
