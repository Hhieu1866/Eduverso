import mongoose, { Schema } from "mongoose";

const watchSchema = new Schema({
  state: {
    required: true,
    type: String,
    default: "started",
  },
  created_at: {
    required: true,
    type: Date,
    default: Date.now(),
  },
  modified_at: {
    required: true,
    type: Date,
    default: Date.now(),
  },
  lesson: { type: Schema.ObjectId, ref: "Lesson" },
  module: { type: Schema.ObjectId, ref: "Module" },
  user: { type: Schema.ObjectId, ref: "User" },
  lastTime: {
    required: true,
    type: Number,
    default: 0,
  },
});

// Sửa lại cách khởi tạo model để tránh lỗi
let WatchModel;
try {
  // Kiểm tra xem model đã tồn tại chưa
  WatchModel = mongoose.model("Watch");
} catch (error) {
  // Nếu chưa tồn tại, tạo mới model
  WatchModel = mongoose.model("Watch", watchSchema);
}

export const Watch = WatchModel;
