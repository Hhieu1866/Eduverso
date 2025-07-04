"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Presentation, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";

// Component skeleton cho card thống kê
function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 rounded-md bg-muted"></div>
        <div className="h-4 w-4 rounded-md bg-muted"></div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 h-7 w-16 rounded-md bg-muted"></div>
        <div className="h-3 w-32 rounded-md bg-muted"></div>
      </CardContent>
    </Card>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
  bgColor = "bg-blue-100",
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${bgColor}`}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const [stats, setStats] = useState({
    users: { total: 0, increase: 0 },
    courses: { total: 0, increase: 0 },
    watches: { total: 0, increase: 0 },
    participation: { rate: 0, increase: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/admin/stats");
        // console.log("Dữ liệu thống kê:", response);
        setStats({
          users: {
            total: response.totalUsers || 0,
            increase: 12, // Giá trị mặc định nếu API chưa trả về
          },
          courses: {
            total: response.totalCourses || 0,
            increase: 8,
          },
          watches: {
            total: response.totalWatches || 56,
            increase: 15,
          },
          participation: {
            rate: response.participationRate || 89,
            increase: 2,
          },
        });
      } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num) => {
    return num.toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Tổng người dùng"
        value={formatNumber(stats.users.total)}
        description={`Tăng ${stats.users.increase}% so với tháng trước`}
        icon={<Users className="h-4 w-4 text-blue-600" />}
        bgColor="bg-blue-100"
      />
      <StatsCard
        title="Khóa học"
        value={formatNumber(stats.courses.total)}
        description={`Tăng ${stats.courses.increase}% so với tháng trước`}
        icon={<BookOpen className="h-4 w-4 text-purple-600" />}
        bgColor="bg-purple-100"
      />
      <StatsCard
        title="Buổi học trực tuyến"
        value={formatNumber(stats.watches.total)}
        description={`Tăng ${stats.watches.increase}% so với tháng trước`}
        icon={<Presentation className="h-4 w-4 text-emerald-600" />}
        bgColor="bg-emerald-100"
      />
      <StatsCard
        title="Tỷ lệ tham gia"
        value={`${stats.participation.rate}%`}
        description={`Tăng ${stats.participation.increase}% so với tháng trước`}
        icon={<Activity className="h-4 w-4 text-amber-600" />}
        bgColor="bg-amber-100"
      />
    </div>
  );
}
