import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema({
  totalCompletedLessons: {
    required: true,
    type: Array,
    default: [],
  },
  totalCompletedModeules: {
    required: true,
    type: Array,
    default: [],
  },
  course: { type: Schema.ObjectId, ref: "Course" },

  student: { type: Schema.ObjectId, ref: "User" },

  quizAssessment: { type: Schema.ObjectId, ref: "Assessment" },
  completion_date: {
    required: false,
    type: Date,
  },
});

// Sửa lại cách khởi tạo model để tránh lỗi
let ReportModel;
try {
  // Kiểm tra xem model đã tồn tại chưa
  ReportModel = mongoose.model("Report");
} catch (error) {
  // Nếu chưa tồn tại, tạo mới model
  ReportModel = mongoose.model("Report", reportSchema);
}

export const Report = ReportModel;
