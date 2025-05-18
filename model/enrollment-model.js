import mongoose, { Schema } from "mongoose";

const enrollmentSchema = new Schema({
  enrollment_date: {
    required: true,
    type: Date,
  },
  status: {
    required: true,
    type: String,
  },
  completion_date: {
    required: false,
    type: Date,
  },
  method: {
    required: true,
    type: String,
  },
  course: { type: Schema.ObjectId, ref: "Course" },

  student: { type: Schema.ObjectId, ref: "User" },
});

// Cách khởi tạo model an toàn hơn, không kiểm tra readyState
let EnrollmentModel;

// Kiểm tra an toàn cho cả client và server side rendering
try {
  // Kiểm tra xem model đã tồn tại chưa
  EnrollmentModel =
    mongoose.models.Enrollment ||
    mongoose.model("Enrollment", enrollmentSchema);
} catch (error) {
  // Trong trường hợp có lỗi, tạo model mới
  EnrollmentModel = mongoose.model("Enrollment", enrollmentSchema);
}

export { EnrollmentModel as Enrollment };
