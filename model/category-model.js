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

// // Sửa lại cách khởi tạo model để tránh lỗi
// let CategoryModel;
// try {
//   // Kiểm tra xem model đã tồn tại chưa
//   CategoryModel = mongoose.model("Category");
// } catch (error) {
//   // Nếu chưa tồn tại, tạo mới model
//   CategoryModel = mongoose.model("Category", categorySchema);
// }

// export const Category = CategoryModel;

export const Category =
  mongoose.models?.Category || mongoose.model("Category", categorySchema);
