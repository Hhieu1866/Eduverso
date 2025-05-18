import mongoose, { Schema } from "mongoose";

const lessonSchema = new Schema({
  title: {
    required: true,
    type: String,
  },
  description: {
    required: false,
    type: String,
  },
  duration: {
    required: true,
    default: 0,
    type: Number,
  },
  content_type: {
    required: true,
    default: "video",
    type: String, // "video" hoặc "text"
    enum: ["video", "text"],
  },
  video_url: {
    required: false,
    type: String,
  },
  text_content: {
    required: false,
    type: String,
  },
  active: {
    required: true,
    default: false,
    type: Boolean,
  },
  slug: {
    required: true,
    type: String,
  },
  access: {
    required: true,
    default: "private",
    type: String,
  },
  order: {
    required: true,
    type: Number,
  },
});

// Sửa lại cách khởi tạo model để tránh lỗi
let LessonModel;
try {
  // Kiểm tra xem model đã tồn tại chưa
  LessonModel = mongoose.model("Lesson");
} catch (error) {
  // Nếu chưa tồn tại, tạo mới model
  LessonModel = mongoose.model("Lesson", lessonSchema);
}

export const Lesson = LessonModel;
