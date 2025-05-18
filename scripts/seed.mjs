import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Chuỗi kết nối MongoDB (thay thế bằng chuỗi kết nối của bạn)
const MONGODB_URI = "mongodb+srv://hoanghieu7a3:wdhGeWqbNKWJLISw@hieuhoang.ft7111u.mongodb.net/lms?retryWrites=true&w=majority&appName=hieuhoang";

// Định nghĩa schema User trong file này để tránh vấn đề import
const userSchema = new mongoose.Schema({
  firstName: {
    required: true,
    type: String
  },
  lastName: {
    required: true,
    type: String
  },
  password: {
    required: true,
    type: String
  },
  email: {
    required: true,
    type: String
  },
  role: {
    required: true,
    type: String
  },
  phone: {
    required: false,
    type: String
  },
  bio: {
    required: false,
    type: String,
    default: ""
  },
  socialMedia: {
    required: false,
    type: Object
  },
  profilePicture: {
    required: false,
    type: String
  },
  designation: {
    required: false,
    type: String,
    default: ""
  }
});

// Kết nối đến MongoDB
async function dbConnect() {
  try {
    return await mongoose.connect(MONGODB_URI);
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error);
    throw error;
  }
}

async function main() {
  console.log("Bắt đầu seeding database...");
  
  // Kết nối đến MongoDB
  await dbConnect();

  // Khởi tạo model User
  const User = mongoose.models.User || mongoose.model("User", userSchema);

  // Thông tin tài khoản admin
  const adminData = {
    email: "admin@example.com",
    password: "Admin@123",
    firstName: "Admin",
    lastName: "System",
    role: "admin",
    phone: "0987654321",
    bio: "Quản trị viên hệ thống với nhiều năm kinh nghiệm trong lĩnh vực giáo dục trực tuyến.",
    profilePicture: "https://placekitten.com/500/500?image=1",
    designation: "Senior System Administrator",
    socialMedia: {
      facebook: "https://facebook.com/admin.example",
      twitter: "https://twitter.com/admin_example",
      linkedin: "https://linkedin.com/in/admin-example"
    }
  };

  // Kiểm tra và tạo tài khoản admin
  const hashedPassword = await bcrypt.hash(adminData.password, 10);
  const existingAdmin = await User.findOne({ email: adminData.email });
  
  if (!existingAdmin) {
    const admin = await User.create({
      email: adminData.email,
      password: hashedPassword,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      role: adminData.role,
      phone: adminData.phone,
      bio: adminData.bio,
      profilePicture: adminData.profilePicture,
      designation: adminData.designation,
      socialMedia: adminData.socialMedia
    });
    
    console.log(`Đã tạo tài khoản admin: ${admin.email} (${admin.firstName} ${admin.lastName})`);
  } else {
    console.log(`Tài khoản admin ${adminData.email} đã tồn tại, bỏ qua.`);
  }

  console.log("Seeding database hoàn tất!");
}

main()
  .catch((e) => {
    console.error("Lỗi trong quá trình seeding:", e);
    process.exit(1);
  })
  .finally(() => {
    console.log("Đóng kết nối MongoDB...");
    mongoose.disconnect();
    process.exit(0);
  }); 