import mongoose, { Schema } from "mongoose";
import { dbConnect } from "@/service/mongo";

const userSchema = new Schema({
  firstName: {
    required: true,
    type: String,
  },
  lastName: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  role: {
    required: true,
    type: String,
  },
  phone: {
    required: false,
    type: String,
  },
  bio: {
    required: false,
    type: String,
    default: "",
  },
  socialMedia: {
    required: false,
    type: Object,
  },

  profilePicture: {
    required: false,
    type: String,
  },
  designation: {
    required: false,
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Xử lý an toàn hơn để tránh lỗi khi mongoose chưa được kết nối
let User;

// Sử dụng mô hình người dùng nếu đã tồn tại, nếu không thì tạo mới
if (mongoose.models && mongoose.models.User) {
  User = mongoose.models.User;
} else {
  User = mongoose.model("User", userSchema);
}

export { User };
