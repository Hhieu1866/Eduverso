"use server";

import { getLoggedInUser } from "@/lib/loggedin-user";
import { Course } from "@/model/course-model";
import { create } from "@/queries/courses";
import mongoose from "mongoose";

export async function createCourse(data) {
  try {
    const loggedinUser = await getLoggedInUser();
    data["instructor"] = loggedinUser?.id;
    const course = await create(data);
    return course;
  } catch (e) {
    throw new Error(e);
  }
}

export async function updateCourse(courseId, dataToUpdate) {
  try {
    await Course.findByIdAndUpdate(courseId, dataToUpdate);
  } catch (e) {
    throw new Error(e);
  }
}

export async function changeCoursePublishState(courseId) {
  const course = await Course.findById(courseId);
  try {
    // Chỉ có thể publish khóa học nếu status là approved
    if (course.status !== "approved") {
      throw new Error("Khóa học chưa được duyệt, không thể publish");
    }

    const res = await Course.findByIdAndUpdate(
      courseId,
      { active: !course.active },
      { lean: true },
    );
    return res.active;
  } catch (error) {
    throw new Error(error);
  }
}

export async function deleteCourse(courseId) {
  try {
    await Course.findByIdAndDelete(courseId);
    return true;
  } catch (e) {
    throw new Error(e);
  }
}

export async function updateQuizSetForCourse(courseId, dataUpdated) {
  //console.log(courseId,dataUpdated);
  const data = {};
  data["quizSet"] = new mongoose.Types.ObjectId(dataUpdated.quizSetId);
  try {
    await Course.findByIdAndUpdate(courseId, data);
  } catch (error) {
    throw new Error(err);
  }
}

// Hàm gửi khóa học để duyệt (giảng viên)
export async function submitCourseForReview(courseId) {
  try {
    const course = await Course.findById(courseId);

    // Kiểm tra xem khóa học có phải là draft không
    if (course.status !== "draft") {
      throw new Error("Chỉ có thể gửi duyệt khóa học ở trạng thái draft");
    }

    // Cập nhật status thành pending
    await Course.findByIdAndUpdate(courseId, {
      status: "pending",
      modifiedOn: Date.now(),
    });

    return {
      success: true,
      message: "Khóa học đã được gửi để duyệt",
    };
  } catch (error) {
    throw new Error(error.message || "Lỗi khi gửi khóa học để duyệt");
  }
}

// Hàm duyệt khóa học (admin)
export async function approveCourse(courseId) {
  try {
    const loggedInUser = await getLoggedInUser();

    // Kiểm tra quyền admin
    if (loggedInUser.role !== "admin") {
      throw new Error("Bạn không có quyền duyệt khóa học");
    }

    const course = await Course.findById(courseId);

    // Kiểm tra xem khóa học có ở trạng thái pending không
    if (course.status !== "pending" && course.status !== "rejected") {
      throw new Error("Chỉ có thể duyệt khóa học đang chờ hoặc đã từ chối");
    }

    // Cập nhật status thành approved
    await Course.findByIdAndUpdate(courseId, {
      status: "approved",
      rejectionReason: "",
      modifiedOn: Date.now(),
    });

    return {
      success: true,
      message: "Khóa học đã được duyệt thành công",
    };
  } catch (error) {
    throw new Error(error.message || "Lỗi khi duyệt khóa học");
  }
}

// Hàm từ chối khóa học (admin)
export async function rejectCourse(courseId, reason) {
  try {
    const loggedInUser = await getLoggedInUser();

    // Kiểm tra quyền admin
    if (loggedInUser.role !== "admin") {
      throw new Error("Bạn không có quyền từ chối khóa học");
    }

    const course = await Course.findById(courseId);

    // Kiểm tra xem khóa học có ở trạng thái pending không
    if (course.status !== "pending") {
      throw new Error("Chỉ có thể từ chối khóa học đang chờ duyệt");
    }

    // Cập nhật status thành rejected
    await Course.findByIdAndUpdate(courseId, {
      status: "rejected",
      rejectionReason: reason || "Không đáp ứng tiêu chuẩn khóa học",
      modifiedOn: Date.now(),
    });

    return {
      success: true,
      message: "Khóa học đã bị từ chối",
    };
  } catch (error) {
    throw new Error(error.message || "Lỗi khi từ chối khóa học");
  }
}

// Lấy tất cả khóa học cần duyệt cho admin
export async function getCoursesForAdmin(statusFilter) {
  try {
    const loggedInUser = await getLoggedInUser();

    // Kiểm tra quyền admin
    if (loggedInUser.role !== "admin") {
      throw new Error("Bạn không có quyền xem danh sách này");
    }

    // Xây dựng query
    const query = {};

    // Nếu có filter theo status
    if (
      statusFilter &&
      ["draft", "pending", "approved", "rejected"].includes(statusFilter)
    ) {
      query.status = statusFilter;
    }

    // Lấy tất cả khóa học theo query
    const courses = await Course.find(query)
      .populate("instructor", "firstName lastName email profilePicture")
      .populate("category", "title")
      .lean();

    // Chuyển đổi _id thành id để dễ sử dụng ở frontend
    return courses.map((course) => ({
      ...course,
      id: course._id.toString(),
      _id: undefined,
    }));
  } catch (error) {
    throw new Error(error.message || "Lỗi khi lấy danh sách khóa học");
  }
}
