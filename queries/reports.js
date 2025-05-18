import { replaceMongoIdInObject } from "@/lib/convertData";
import { Assessment } from "@/model/assessment-model";
import { Module } from "@/model/module.model";
import { Report } from "@/model/report-model";
import mongoose from "mongoose";
import { getCourseDetails } from "./courses";

export async function getReport(filter) {
  try {
    console.log("getReport được gọi với filter:", JSON.stringify(filter));

    // Đảm bảo bộ lọc hợp lệ
    if (!filter || !filter.student || !filter.course) {
      console.log("Thiếu thông tin bắt buộc trong filter của getReport");
      return null;
    }

    // Tìm báo cáo với filter đã cho
    const report = await Report.findOne(filter)
      .populate({
        path: "quizAssessment",
        model: Assessment,
      })
      .lean();

    if (!report) {
      console.log(
        `Không tìm thấy báo cáo cho học viên ${filter.student} và khóa học ${filter.course}`,
      );
      return null;
    }

    console.log(`Đã tìm thấy báo cáo với ID: ${report._id}`);

    // Kiểm tra nếu báo cáo có quizAssessment, đảm bảo nó thuộc về người dùng hiện tại
    if (report.quizAssessment) {
      const assessment = await Assessment.findOne({
        _id: report.quizAssessment,
        user: filter.student,
      }).lean();

      if (!assessment) {
        console.log(
          `Assessment ${report.quizAssessment} không thuộc về người dùng ${filter.student}. Đang xóa liên kết.`,
        );
        // Trả về báo cáo nhưng loại bỏ liên kết với quizAssessment không thuộc về người dùng
        const reportWithoutAssessment = { ...report };
        delete reportWithoutAssessment.quizAssessment;
        return replaceMongoIdInObject(reportWithoutAssessment);
      }
    }

    return replaceMongoIdInObject(report);
  } catch (error) {
    console.error("Lỗi trong hàm getReport:", error);
    throw new Error(error);
  }
}

export async function createWatchReport(data) {
  try {
    let report = await Report.findOne({
      course: data.courseId,
      student: data.userId,
    });

    if (!report) {
      report = await Report.create({
        course: data.courseId,
        student: data.userId,
        totalCompletedLessons: [], // Khởi tạo mảng rỗng
        totalCompletedModeules: [], // Khởi tạo mảng rỗng
      });
    }

    // Khởi tạo mảng nếu chưa có
    if (!report.totalCompletedLessons) {
      report.totalCompletedLessons = [];
    }

    if (!report.totalCompletedModeules) {
      report.totalCompletedModeules = [];
    }

    const foundLesson = report.totalCompletedLessons.find(
      (lessonId) => lessonId.toString() === data.lessonId,
    );

    if (!foundLesson) {
      report.totalCompletedLessons.push(
        new mongoose.Types.ObjectId(data.lessonId),
      );
    }

    const module = await Module.findById(data.moduleId);

    if (!module || !module.lessonIds) {
      console.error("Module không tồn tại hoặc không có bài học!");
      await report.save();
      return;
    }

    const lessonIdsToCheck = module.lessonIds;
    const completedLessonsIds = report.totalCompletedLessons;

    // Kiểm tra tất cả bài học trong module đã hoàn thành chưa
    const isModuleComplete = lessonIdsToCheck.every((lesson) =>
      completedLessonsIds.some(
        (completedLesson) => completedLesson.toString() === lesson.toString(),
      ),
    );

    if (isModuleComplete) {
      const foundModule = report.totalCompletedModeules.find(
        (module) => module.toString() === data.moduleId,
      );
      if (!foundModule) {
        report.totalCompletedModeules.push(
          new mongoose.Types.ObjectId(data.moduleId),
        );
        console.log("Module đã được đánh dấu hoàn thành:", data.moduleId);
      }
    }

    /// Check if the course has completed
    const course = await getCourseDetails(data.courseId);
    const modulesInCourse = course?.modules;
    const moduleCount = modulesInCourse?.length ?? 0;

    const completedModule = report.totalCompletedModeules;
    const completedModuleCount = completedModule?.length ?? 0;

    if (completedModuleCount >= 1 && completedModuleCount === moduleCount) {
      report.completion_date = Date.now();
      console.log("Khóa học đã được đánh dấu hoàn thành!");
    }

    await report.save();
    console.log("Đã cập nhật báo cáo tiến trình thành công!");
  } catch (error) {
    console.error("Lỗi cập nhật báo cáo tiến trình:", error);
    throw new Error(error);
  }
}

export async function createAssessmentReport(data) {
  try {
    let report = await Report.findOne({
      course: data.courseId,
      student: data.userId,
    });
    if (!report) {
      report = await Report.create({
        course: data.courseId,
        student: data.userId,
        quizAssessment: data.quizAssessment,
        totalCompletedLessons: [], // Khởi tạo mảng rỗng
        totalCompletedModeules: [], // Khởi tạo mảng rỗng
      });
    } else {
      if (!report.quizAssessment) {
        report.quizAssessment = data.quizAssessment;
        await report.save();
      }
    }
  } catch (error) {
    console.error("Lỗi tạo báo cáo đánh giá:", error);
    throw new Error(error);
  }
}
