import {
  replaceMongoIdInArray,
  replaceMongoIdInObject,
} from "@/lib/convertData";
import { Course } from "@/model/course-model";
import { Enrollment } from "@/model/enrollment-model";
import { Watch } from "@/model/watch-model";
import { dbConnect } from "@/service/mongo";
import mongoose from "mongoose";
import { getCache, setCache, createCacheKey } from "@/lib/cache";

// Thời gian cache cho enrollments (10 phút)
const ENROLLMENTS_CACHE_TTL = 10 * 60 * 1000;

export async function getEnrollmentsForCourse(courseId) {
  await dbConnect();
  const enrollments = await Enrollment.find({ course: courseId }).lean();
  return replaceMongoIdInArray(enrollments);
}

export async function enrollForCourse(courseId, userId) {
  try {
    // Đảm bảo đã kết nối đến MongoDB trước khi thực hiện thao tác
    await dbConnect();

    // console.log("Đang đăng ký khóa học với ID:", courseId, "cho user:", userId);

    const newEnrollment = {
      course: courseId,
      student: userId,
      method: "free", // Tất cả khóa học đều miễn phí
      enrollment_date: Date.now(),
      status: "not-started",
    };

    // Sử dụng phương thức tạo mới đối tượng Mongoose
    const enrollment = new Enrollment(newEnrollment);
    const savedEnrollment = await enrollment.save();

    // Xóa cache khi có thay đổi
    const cacheKey = createCacheKey("getEnrollmentsForUser", userId);
    setCache(cacheKey, null, 0); // Xóa cache

    // console.log("Đăng ký thành công:", savedEnrollment);
    return savedEnrollment;
  } catch (error) {
    console.error("Lỗi chi tiết khi đăng ký khóa học:", error);
    throw new Error(error.message || "Không thể đăng ký khóa học");
  }
}

export async function getEnrollmentsForUser(userId) {
  try {
    if (!userId) {
      console.error("getUserId is undefined or null");
      return [];
    }

    // Kiểm tra cache trước
    const cacheKey = createCacheKey("getEnrollmentsForUser", userId);
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      // console.log("Sử dụng dữ liệu cache cho danh sách khóa học đã đăng ký");
      return cachedData;
    }

    await dbConnect();

    // Đảm bảo userId là ObjectId hợp lệ
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error("Invalid userId format:", userId, error);
      return [];
    }

    // console.log("Đang lấy danh sách khóa học đã đăng ký cho user:", userId);

    const enrollments = await Enrollment.find({ student: userObjectId })
      .populate({
        path: "course",
        model: Course,
      })
      .lean();

    // console.log("Tìm thấy", enrollments.length, "khóa học đã đăng ký");

    // Lọc bỏ các enrollment có course null hoặc không có _id
    const validEnrollments = enrollments.filter(
      (enrollment) => enrollment.course && enrollment.course._id,
    );

    if (validEnrollments.length !== enrollments.length) {
      // console.log(
      //   `Đã lọc bỏ ${enrollments.length - validEnrollments.length} enrollment không hợp lệ`,
      // );
    }

    const result = replaceMongoIdInArray(validEnrollments);

    // Lưu vào cache
    setCache(cacheKey, result, ENROLLMENTS_CACHE_TTL);

    return result;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách khóa học đã đăng ký:", err);
    // Trả về mảng rỗng thay vì ném lỗi để tránh làm hỏng giao diện người dùng
    return [];
  }
}

export async function hasEnrollmentForCourse(courseId, studentId) {
  try {
    if (!courseId || !studentId) {
      console.error("courseId hoặc studentId không hợp lệ:", {
        courseId,
        studentId,
      });
      return false;
    }

    // Kiểm tra cache
    const cacheKey = createCacheKey(
      "hasEnrollmentForCourse",
      courseId,
      studentId,
    );
    const cachedData = getCache(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }

    await dbConnect();

    // Đảm bảo courseId và studentId là ObjectId hợp lệ
    let courseObjectId, studentObjectId;
    try {
      courseObjectId = new mongoose.Types.ObjectId(courseId);
      studentObjectId = new mongoose.Types.ObjectId(studentId);
    } catch (error) {
      console.error("Invalid ID format:", { courseId, studentId }, error);
      return false;
    }

    const enrollment = await Enrollment.findOne({
      course: courseObjectId,
      student: studentObjectId,
    })
      .populate({
        path: "course",
        model: Course,
      })
      .lean();

    const result = !!enrollment;

    // Lưu kết quả vào cache (thời gian ngắn hơn - 5 phút)
    setCache(cacheKey, result, 5 * 60 * 1000);

    return result;
  } catch (error) {
    console.error("Lỗi khi kiểm tra đăng ký khóa học:", error);
    return false; // Trả về false thay vì ném lỗi
  }
}

export async function hasStartedLearning(courseId, studentId) {
  try {
    if (!courseId || !studentId) {
      console.error("courseId hoặc studentId không hợp lệ:", {
        courseId,
        studentId,
      });
      return false;
    }

    // Kiểm tra cache
    const cacheKey = createCacheKey("hasStartedLearning", courseId, studentId);
    const cachedData = getCache(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }

    await dbConnect();

    // Đảm bảo studentId là ObjectId hợp lệ
    let studentObjectId;
    try {
      studentObjectId = new mongoose.Types.ObjectId(studentId);
    } catch (error) {
      console.error("Invalid studentId format:", studentId, error);
      return false;
    }

    // Kiểm tra xem có bản ghi nào trong bảng Watch cho học viên này và khóa học này hay không
    const watchRecord = await Watch.findOne({
      user: studentObjectId,
    }).lean();

    const result = !!watchRecord;

    // Lưu kết quả vào cache (thời gian ngắn hơn - 5 phút)
    setCache(cacheKey, result, 5 * 60 * 1000);

    return result;
  } catch (error) {
    console.error("Lỗi khi kiểm tra tiến trình học:", error);
    return false;
  }
}
