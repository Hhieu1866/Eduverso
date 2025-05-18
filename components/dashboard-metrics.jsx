"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Code,
  Hourglass,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function MetricsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tổng quan hiệu suất</CardTitle>
        <CardDescription>
          Các chỉ số hiệu suất chính của hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today">
          <TabsList className="mb-4">
            <TabsTrigger value="today">Hôm nay</TabsTrigger>
            <TabsTrigger value="week">Tuần này</TabsTrigger>
            <TabsTrigger value="month">Tháng này</TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="space-y-4">
            <MetricItem
              icon={<CalendarDays className="h-4 w-4 text-blue-600" />}
              title="Lượt truy cập"
              value="234"
              change="+14%"
              positive={true}
              progress={75}
            />
            <MetricItem
              icon={<Clock className="h-4 w-4 text-green-600" />}
              title="Thời gian trung bình"
              value="4m 32s"
              change="-8%"
              positive={false}
              progress={45}
            />
            <MetricItem
              icon={<CheckCircle className="h-4 w-4 text-orange-600" />}
              title="Hoàn thành bài học"
              value="86"
              change="+5%"
              positive={true}
              progress={65}
            />
          </TabsContent>
          <TabsContent value="week" className="space-y-4">
            <MetricItem
              icon={<CalendarDays className="h-4 w-4 text-blue-600" />}
              title="Lượt truy cập"
              value="1,345"
              change="+8%"
              positive={true}
              progress={68}
            />
            <MetricItem
              icon={<Clock className="h-4 w-4 text-green-600" />}
              title="Thời gian trung bình"
              value="5m 14s"
              change="+2%"
              positive={true}
              progress={55}
            />
            <MetricItem
              icon={<CheckCircle className="h-4 w-4 text-orange-600" />}
              title="Hoàn thành bài học"
              value="543"
              change="+12%"
              positive={true}
              progress={78}
            />
          </TabsContent>
          <TabsContent value="month" className="space-y-4">
            <MetricItem
              icon={<CalendarDays className="h-4 w-4 text-blue-600" />}
              title="Lượt truy cập"
              value="5,346"
              change="+24%"
              positive={true}
              progress={85}
            />
            <MetricItem
              icon={<Clock className="h-4 w-4 text-green-600" />}
              title="Thời gian trung bình"
              value="6m 2s"
              change="+5%"
              positive={true}
              progress={62}
            />
            <MetricItem
              icon={<CheckCircle className="h-4 w-4 text-orange-600" />}
              title="Hoàn thành bài học"
              value="2,187"
              change="+18%"
              positive={true}
              progress={88}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MetricItem({ icon, title, value, change, positive, progress }) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center">
          <p className="text-sm font-medium leading-none">{title}</p>
          <div
            className={`ml-auto text-sm font-medium ${
              positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {change}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold">{value}</div>
          <Progress value={progress} className="h-2 flex-1" />
        </div>
      </div>
    </div>
  );
}
