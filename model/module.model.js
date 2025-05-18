import mongoose, { Schema } from "mongoose";

const moduleSchema = new Schema({
  title: {
    required: true,
    type: String,
  },
  description: {
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
  course: {
    required: true,
    type: Schema.ObjectId,
  },
  lessonIds: [{ type: Schema.ObjectId, ref: "Lesson" }],
  order: {
    require: true,
    type: Number,
  },
});

// Sửa lại cách khởi tạo model để tránh lỗi
let ModuleModel;
try {
  // Kiểm tra xem model đã tồn tại chưa
  ModuleModel = mongoose.model("Module");
} catch (error) {
  // Nếu chưa tồn tại, tạo mới model
  ModuleModel = mongoose.model("Module", moduleSchema);
}

export const Module = ModuleModel;
