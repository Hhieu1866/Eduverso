import { Category } from "@/model/category-model";
import { Course } from "@/model/course-model";
import { Module } from "@/model/module.model";
import { Testimonial } from "@/model/testimonial-model";
import { User } from "@/model/user-model";
import {
  replaceMongoIdInArray,
  replaceMongoIdInObject,
} from "@/lib/convertData";
import { getEnrollmentsForCourse } from "./enrollments";
import { getTestimonialsForCourse } from "./testimonials";
import { Lesson } from "@/model/lesson.model";
import { Quizset } from "@/model/quizset-model";
import { Quiz } from "@/model/quizzes-model";
import mongoose from "mongoose";
import { Enrollment } from "@/model/enrollment-model";

export async function getCourseList(filters = {}) {
  try {
    // Xây dựng query filter
    // Chỉ lấy các khóa học đã được duyệt (approved) và active
    const query = { active: true, status: "approved" };

    // Lọc theo danh mục
    if (filters.categories && filters.categories.length > 0) {
      // Chuyển đổi các ID thành ObjectId nếu cần
      const categoryIds = filters.categories.map((id) =>
        mongoose.Types.ObjectId.isValid(id)
          ? new mongoose.Types.ObjectId(id)
          : id,
      );
      query.category = { $in: categoryIds };
    }

    // Lọc theo giá tiền
    if (filters.price && filters.price.length > 0) {
      if (filters.price.includes("free") && !filters.price.includes("paid")) {
        query.price = 0;
      } else if (
        !filters.price.includes("free") &&
        filters.price.includes("paid")
      ) {
        query.price = { $gt: 0 };
      }
      // Nếu cả hai hoặc không có cái nào được chọn, không cần thêm filter
    }

    const courses = await Course.find(query)
      .select([
        "title",
        "subtitle",
        "thumbnail",
        "thumbnailUrl",
        "modules",
        "price",
        "category",
        "instructor",
      ])
      .populate({
        path: "category",
        model: Category,
      })
      .populate({
        path: "instructor",
        model: User,
      })
      .populate({
        path: "testimonials",
        model: Testimonial,
      })
      .populate({
        path: "modules",
        model: Module,
      })
      .lean();

    return replaceMongoIdInArray(courses);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    return [];
  }
}

export async function getCourseDetails(id) {
  const course = await Course.findById(id)
    .populate({
      path: "category",
      model: Category,
    })
    .populate({
      path: "instructor",
      model: User,
    })
    .populate({
      path: "testimonials",
      model: Testimonial,
      populate: {
        path: "user",
        model: User,
      },
    })
    .populate({
      path: "modules",
      model: Module,
      match: { active: true },
      populate: {
        path: "lessonIds",
        model: Lesson,
        match: { active: true },
      },
    })
    .populate({
      path: "quizSet",
      model: Quizset,
      match: { active: true },
      populate: {
        path: "quizIds",
        model: Quiz,
      },
    })
    .lean();

  // Lấy số lượng học viên đã đăng ký
  const enrollmentCount = await Enrollment.countDocuments({ course: id });

  // Thêm thông tin số lượng học viên vào đối tượng course
  const courseWithEnrollmentCount = {
    ...course,
    enrollmentCount: enrollmentCount,
  };

  return replaceMongoIdInObject(courseWithEnrollmentCount);
}

export async function getCourseDetailsForInstructor(id) {
  const course = await Course.findById(id)
    .populate({
      path: "category",
      model: Category,
    })
    .populate({
      path: "instructor",
      model: User,
    })
    .populate({
      path: "testimonials",
      model: Testimonial,
      populate: {
        path: "user",
        model: User,
      },
    })
    .populate({
      path: "modules",
      model: Module,
      populate: {
        path: "lessonIds",
        model: Lesson,
      },
    })
    .populate({
      path: "quizSet",
      model: Quizset,
      populate: {
        path: "quizIds",
        model: Quiz,
      },
    })
    .lean();

  // Lấy số lượng học viên đã đăng ký
  const enrollmentCount = await Enrollment.countDocuments({ course: id });

  // Thêm thông tin số lượng học viên vào đối tượng course
  const courseWithEnrollmentCount = {
    ...course,
    enrollmentCount: enrollmentCount,
  };

  return replaceMongoIdInObject(courseWithEnrollmentCount);
}

function groupBy(array, keyFn) {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}

export async function getCourseDetailsByInstructor(instructorId, expand) {
  const publishCourses = await Course.find({
    instructor: instructorId,
    active: true,
  })
    .populate({ path: "category", model: Category })
    .populate({ path: "testimonials", model: Testimonial })
    .populate({ path: "instructor", model: User })
    .lean();

  const enrollments = await Promise.all(
    publishCourses.map(async (course) => {
      const enrollment = await getEnrollmentsForCourse(course._id.toString());
      return enrollment;
    }),
  );

  // Group enrollments by course
  const groupByCourses = groupBy(enrollments.flat(), (item) => item.course);

  /// Calculate total revenue
  const totalRevenue = publishCourses.reduce((acc, course) => {
    const enrollmentsForCourse = groupByCourses[course._id] || [];
    return acc + enrollmentsForCourse.length * course.price;
  }, 0);

  //console.log(totalRevenue);

  const totalEnrollments = enrollments.reduce((acc, obj) => {
    return acc + obj.length;
  }, 0);

  const tesimonials = await Promise.all(
    publishCourses.map(async (course) => {
      const tesimonial = await getTestimonialsForCourse(course._id.toString());
      return tesimonial;
    }),
  );

  const totalTestimonials = tesimonials.flat();
  const avgRating =
    totalTestimonials.reduce(function (acc, obj) {
      return acc + obj.rating;
    }, 0) / totalTestimonials.length;

  const firstName =
    publishCourses.length > 0
      ? publishCourses[0]?.instructor?.firstName
      : "Unknown";
  const lastName =
    publishCourses.length > 0
      ? publishCourses[0]?.instructor?.lastName
      : "Unknown";
  const fullInsName = `${firstName} ${lastName}`;

  const Designation =
    publishCourses.length > 0
      ? publishCourses[0]?.instructor?.designation
      : "Unknown";

  const insImage =
    publishCourses.length > 0
      ? publishCourses[0]?.instructor?.profilePicture
      : "Unknown";

  if (expand) {
    const allCourses = await Course.find({ instructor: instructorId }).lean();
    return {
      courses: allCourses?.flat(),
      enrollments: enrollments?.flat(),
      reviews: totalTestimonials,
      fullInsName,
      Designation,
      insImage,
    };
  }

  return {
    courses: publishCourses.length,
    enrollments: totalEnrollments,
    reviews: totalTestimonials.length,
    ratings: avgRating.toPrecision(2),
    inscourses: publishCourses,
    revenue: totalRevenue,
    fullInsName,
    Designation,
    insImage,
  };
}

export async function create(courseData) {
  try {
    const course = await Course.create(courseData);
    return JSON.parse(JSON.stringify(course));
  } catch (error) {
    throw new Error(error);
  }
}

export async function getCoursesByCategory(categoryId) {
  try {
    const courses = await Course.find({
      category: categoryId,
      active: true,
      status: "approved",
    })
      .populate("category")
      .lean();
    return courses;
  } catch (error) {
    throw new Error(error);
  }
}

export const getCategoryById = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId);
    return category;
  } catch (error) {
    throw new Error(error);
  }
};

export async function getRelatedCourses(currentCourseId, categoryId) {
  try {
    const currentCourseObjectId = new mongoose.Types.ObjectId(currentCourseId);
    const categoryObjectId = new mongoose.Types.ObjectId(categoryId);
    // console.log("course id", currentCourseObjectId);
    // console.log("category id",categoryObjectId );
    const relatedCourses = await Course.find({
      category: categoryObjectId,
      _id: { $ne: currentCourseObjectId }, // Exclude current course
      active: true,
      status: "approved",
    })
      .select("title thumbnail thumbnailUrl price")
      .lean();
    return relatedCourses;
  } catch (error) {
    throw new Error(error);
  }
}
