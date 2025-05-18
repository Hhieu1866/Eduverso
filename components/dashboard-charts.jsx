"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";

// Dữ liệu mẫu cho biểu đồ đăng ký theo ngày trong tháng hiện tại
const dailyRegistrationData = Array.from({ length: 31 }, (_, i) => ({
  name: `${i + 1}`,
  value: Math.floor(Math.random() * 20) + 1,
}));

// Dữ liệu mẫu cho biểu đồ đăng ký theo tháng trong năm
const monthlyRegistrationData = [
  { name: "T1", value: 120 },
  { name: "T2", value: 180 },
  { name: "T3", value: 150 },
  { name: "T4", value: 200 },
  { name: "T5", value: 250 },
  { name: "T6", value: 300 },
  { name: "T7", value: 280 },
  { name: "T8", value: 320 },
  { name: "T9", value: 350 },
  { name: "T10", value: 400 },
  { name: "T11", value: 420 },
  { name: "T12", value: 450 },
];

// Skeleton dành cho biểu đồ
function ChartSkeleton() {
  return (
    <div className="h-full w-full">
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-1/3 rounded-md bg-muted"></div>
        <div className="flex h-[280px] flex-col justify-end gap-1">
          <div className="flex w-full items-end justify-between px-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-[7%] rounded-t bg-muted"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              ></div>
            ))}
          </div>
          <div className="h-[1px] w-full bg-muted"></div>
          <div className="flex justify-between px-3 pt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-3 w-[7%] rounded-md bg-muted"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MonthlyRegistrationsChart() {
  const [data, setData] = useState(dailyRegistrationData);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toLocaleString("vi-VN", { month: "long", year: "numeric" }),
  );

  // Fetch dữ liệu đăng ký người dùng theo ngày trong tháng hiện tại
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await axios.get("/api/admin/users/stats");
        console.log("Dữ liệu đăng ký người dùng theo ngày:", response);

        if (response && response.dailyData) {
          setData(response.dailyData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thống kê người dùng theo ngày:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký người dùng trong tháng hiện tại</CardTitle>
        <CardDescription>
          Thống kê số người dùng đăng ký mới theo ngày trong {currentMonth}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">
                                Ngày
                              </span>
                              <span className="font-bold text-foreground">
                                {payload[0].payload.name}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">
                                Số người đăng ký
                              </span>
                              <span className="font-bold text-primary">
                                {payload[0].value} người dùng
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  name="Số người đăng ký"
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function YearlyRegistrationsChart() {
  const [data, setData] = useState(monthlyRegistrationData);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Fetch dữ liệu đăng ký người dùng theo tháng trong năm
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await axios.get("/api/admin/users/stats");
        console.log("Dữ liệu đăng ký người dùng theo tháng:", response);

        if (response && response.monthlyData) {
          setData(response.monthlyData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thống kê người dùng theo tháng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký người dùng theo tháng</CardTitle>
        <CardDescription>
          Thống kê số người dùng đăng ký mới trong từng tháng của năm{" "}
          {currentYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
                barSize={30}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">
                                Tháng
                              </span>
                              <span className="font-bold text-foreground">
                                {payload[0].payload.name}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">
                                Số người đăng ký
                              </span>
                              <span className="font-bold text-emerald-600">
                                {payload[0].value} người dùng
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  name="Đăng ký trong tháng"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
