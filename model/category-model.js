import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
  title: {
    required: true,
    type: String,
  },
  description: {
    required: false,
    type: String,
  },
  thumbnail: {
    required: false,
    type: String,
    default: "default-category.jpg",
  },
});

// Đảm bảo model được đăng ký đúng cách
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export { Category };
