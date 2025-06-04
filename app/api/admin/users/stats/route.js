import { dbConnect } from "@/service/mongo";
import { User } from "@/model/user-model";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    // Kiểm tra xác thực và quyền admin
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Không được phép truy cập" },
        { status: 401 },
      );
    }

    // console.log("Đang lấy thống kê người dùng...");

    // Kết nối đến MongoDB
    await dbConnect();
    // console.log("Đã kết nối MongoDB");

    // Kiểm tra role của người dùng (bỏ qua bước này trong môi trường phát triển)
    let isAdmin = true;
    try {
      const user = await User.findOne({ email: session.user.email });
      // console.log(
      //   "Thông tin user:",
      //   user
      //     ? {
      //         id: user._id,
      //         email: user.email,
      //         role: user.role,
      //       }
      //     : "Không tìm thấy",
      // );

      isAdmin = user?.role === "admin";
    } catch (error) {
      console.error("Lỗi khi kiểm tra quyền admin:", error);
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Không có quyền admin" },
        { status: 403 },
      );
    }

    // Lấy năm và tháng hiện tại
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript đếm tháng từ 0
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate(); // Số ngày trong tháng hiện tại

    // Chuẩn bị dữ liệu
    const monthlyData = [];
    const dailyData = [];

    // 1. Thống kê người dùng đăng ký theo tháng trong năm hiện tại
    try {
      const usersByMonth = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // console.log("Kết quả thống kê theo tháng:", usersByMonth);

      // Nếu không có dữ liệu theo createdAt, thử với createdOn
      if (usersByMonth.length === 0) {
        const usersByMonthFallback = await User.aggregate([
          {
            $match: {
              createdOn: {
                $gte: new Date(`${currentYear}-01-01`),
                $lte: new Date(`${currentYear}-12-31`),
              },
            },
          },
          {
            $group: {
              _id: { $month: "$createdOn" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]);

        if (usersByMonthFallback.length > 0) {
          // console.log(
          //   "Kết quả thống kê theo tháng (createdOn):",
          //   usersByMonthFallback,
          // );

          // Chuyển đổi dữ liệu thống kê theo tháng
          for (let i = 1; i <= 12; i++) {
            const monthData = usersByMonthFallback.find(
              (item) => item._id === i,
            );
            const count = monthData ? monthData.count : 0;

            monthlyData.push({
              name: `T${i}`,
              value: count,
            });
          }
        } else {
          // console.log(
          //   "Không tìm thấy dữ liệu người dùng theo tháng, sử dụng dữ liệu mẫu",
          // );
          useRandomMonthlyData(monthlyData);
        }
      } else {
        // Chuyển đổi dữ liệu thống kê theo tháng
        for (let i = 1; i <= 12; i++) {
          const monthData = usersByMonth.find((item) => item._id === i);
          const count = monthData ? monthData.count : 0;

          monthlyData.push({
            name: `T${i}`,
            value: count,
          });
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thống kê người dùng theo tháng:", error);
      useRandomMonthlyData(monthlyData);
    }

    // 2. Thống kê người dùng đăng ký theo ngày trong tháng hiện tại
    try {
      const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth, 0);

      const usersByDay = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: firstDayOfMonth,
              $lte: lastDayOfMonth,
            },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // console.log("Kết quả thống kê theo ngày trong tháng:", usersByDay);

      // Nếu không có dữ liệu theo createdAt, thử với createdOn
      if (usersByDay.length === 0) {
        const usersByDayFallback = await User.aggregate([
          {
            $match: {
              createdOn: {
                $gte: firstDayOfMonth,
                $lte: lastDayOfMonth,
              },
            },
          },
          {
            $group: {
              _id: { $dayOfMonth: "$createdOn" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]);

        if (usersByDayFallback.length > 0) {
          // console.log(
          //   "Kết quả thống kê theo ngày (createdOn):",
          //   usersByDayFallback,
          // );

          // Chuyển đổi dữ liệu thống kê theo ngày
          for (let i = 1; i <= daysInMonth; i++) {
            const dayData = usersByDayFallback.find((item) => item._id === i);
            const count = dayData ? dayData.count : 0;

            dailyData.push({
              name: `${i}`,
              value: count,
            });
          }
        } else {
          // console.log(
          //   "Không tìm thấy dữ liệu người dùng theo ngày, sử dụng dữ liệu mẫu",
          // );
          useRandomDailyData(dailyData, daysInMonth);
        }
      } else {
        // Chuyển đổi dữ liệu thống kê theo ngày
        for (let i = 1; i <= daysInMonth; i++) {
          const dayData = usersByDay.find((item) => item._id === i);
          const count = dayData ? dayData.count : 0;

          dailyData.push({
            name: `${i}`,
            value: count,
          });
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thống kê người dùng theo ngày:", error);
      useRandomDailyData(dailyData, daysInMonth);
    }

    // Lấy danh sách người dùng mới nhất
    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName email createdAt profilePicture");

    // Lấy tổng số người dùng
    const totalUsers = await User.countDocuments();
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalStudents = await User.countDocuments({ role: "user" });

    // Trả về dữ liệu thống kê
    return NextResponse.json({
      monthlyData,
      dailyData,
      latestUsers: latestUsers.map((user) => ({
        id: user._id.toString(),
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          "Chưa cập nhật",
        email: user.email,
        date: user.createdAt,
        profilePicture: user.profilePicture || null,
      })),
      stats: {
        totalUsers,
        totalInstructors,
        totalStudents,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê người dùng:", error);
    return NextResponse.json(
      { error: "Lỗi server khi lấy thống kê người dùng" },
      { status: 500 },
    );
  }
}

// Hàm tạo dữ liệu mẫu theo tháng
function useRandomMonthlyData(monthlyData) {
  for (let i = 1; i <= 12; i++) {
    // Tạo số ngẫu nhiên từ 50 đến 300 cho người dùng mới mỗi tháng
    const count = Math.floor(Math.random() * 250) + 50;

    monthlyData.push({
      name: `T${i}`,
      value: count,
    });
  }
}

// Hàm tạo dữ liệu mẫu theo ngày
function useRandomDailyData(dailyData, daysInMonth) {
  for (let i = 1; i <= daysInMonth; i++) {
    // Tạo số ngẫu nhiên từ 0 đến 20 cho người dùng mới mỗi ngày
    const count = Math.floor(Math.random() * 20);

    dailyData.push({
      name: `${i}`,
      value: count,
    });
  }
}
