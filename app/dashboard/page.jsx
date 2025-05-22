import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/formatPrice";
import {
  getInstructorDashboardData,
  REVIEW_DATA,
  ENROLLMENT_DATA,
} from "@/lib/dashboard-helper";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  BookOpen,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  Calendar,
  BarChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Helper để định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  } catch {
    return "";
  }
};

// Helper tối ưu để lấy dữ liệu dashboard từ server
const fetchDashboardData = async () => {
  try {
    // Gọi Promise.all để thực hiện các request đồng thời
    const [generalStats, reviewData, enrollmentData] = await Promise.all([
      getInstructorDashboardData(),
      getInstructorDashboardData(REVIEW_DATA),
      getInstructorDashboardData(ENROLLMENT_DATA),
    ]);

    return {
      stats: generalStats || null,
      recentReviews: (reviewData || []).slice(0, 3),
      allEnrollments: enrollmentData || [],
    };
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu dashboard:", error);
    return {
      stats: null,
      recentReviews: [],
      allEnrollments: [],
    };
  }
};

// Component con: Thẻ thống kê
const StatCard = ({ title, value, icon, iconColor, description }) => (
  <Card className="shadow-sm transition-shadow hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// Component con: Danh sách khóa học
const CoursesList = ({ courses = [] }) => (
  <Card className="shadow-sm lg:col-span-2">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle>Khóa học của bạn</CardTitle>
        <Link
          href="/dashboard/courses"
          className="text-sm text-primary hover:underline"
        >
          Xem tất cả
        </Link>
      </div>
      <CardDescription>
        {courses.length > 0
          ? "Danh sách khóa học gần đây của bạn"
          : "Bạn chưa có khóa học nào"}
      </CardDescription>
    </CardHeader>
    <CardContent className="pb-2">
      {courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseItem key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <EmptyCourseState />
      )}
    </CardContent>
    {courses.length > 0 && (
      <CardFooter className="pt-2">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard/courses">Quản lý tất cả khóa học</Link>
        </Button>
      </CardFooter>
    )}
  </Card>
);

// Component con: Hiển thị một khóa học
const CourseItem = ({ course }) => (
  <div className="flex items-center rounded-lg border p-3 transition-colors hover:bg-muted">
    <div className="relative mr-4 h-12 w-20 overflow-hidden rounded border">
      {course.thumbnailUrl ? (
        <Image
          src={course.thumbnailUrl}
          alt={course.title}
          fill
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
    </div>
    <div className="min-w-0 flex-1">
      <h4 className="truncate text-sm font-medium">{course.title}</h4>
      <div className="mt-1 flex items-center gap-2">
        <Badge
          variant={
            course.status === "approved"
              ? "success"
              : course.status === "pending"
                ? "warning"
                : "outline"
          }
        >
          {course.status === "approved"
            ? "Đã duyệt"
            : course.status === "pending"
              ? "Chờ duyệt"
              : "Bản nháp"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {course.price > 0 ? formatPrice(course.price) : "Miễn phí"}
        </span>
      </div>
    </div>
    <Button variant="ghost" size="icon" className="ml-2" asChild>
      <Link href={`/dashboard/courses/${course._id}`}>
        <ChevronRight className="h-4 w-4" />
      </Link>
    </Button>
  </div>
);

// Component con: Hiển thị khi không có khóa học
const EmptyCourseState = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
    <h3 className="text-lg font-medium">Chưa có khóa học nào</h3>
    <p className="mb-4 mt-1 text-sm text-muted-foreground">
      Bắt đầu tạo khóa học đầu tiên của bạn ngay bây giờ
    </p>
    <Button asChild>
      <Link href="/dashboard/courses/add">Tạo khóa học mới</Link>
    </Button>
  </div>
);

// Component con: Hiển thị tỷ lệ hoàn thành
const CompletionRateCard = ({ completionRate }) => (
  <Card className="shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">
        Tỷ lệ hoàn thành khóa học
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="mb-2 text-3xl font-bold">{completionRate}%</div>
      <Progress value={completionRate} className="h-2" />
      <p className="mt-3 text-xs text-muted-foreground">
        Tỷ lệ học viên hoàn thành ít nhất 80% khóa học
      </p>
    </CardContent>
  </Card>
);

// Component con: Hiển thị đánh giá gần đây
const RecentReviewsCard = ({ reviews = [] }) => (
  <Card className="shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Đánh giá gần đây</CardTitle>
    </CardHeader>
    <CardContent>
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <ReviewItem key={index} review={review} />
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <Star className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Chưa có đánh giá nào</p>
        </div>
      )}
    </CardContent>
  </Card>
);

// Component con: Hiển thị một đánh giá
const ReviewItem = ({ review }) => {
  const dateStr = formatDate(review.createdAt);
  const avatarUrl = review.studentAvatar;
  const fullName = review.studentName || "U";

  return (
    <div className="flex items-center gap-4 rounded-lg bg-secondary p-3">
      <div className="flex-shrink-0">
        <Avatar className="h-12 w-12">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
          <AvatarFallback className="bg-gray-200 text-xl font-medium uppercase text-black">
            {(fullName.charAt(0) || "U").toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-semibold text-colors-navy">Người dùng</p>
        <div className="line-clamp-2 text-sm text-gray-700">
          {review.content || review.comment || "Không có nội dung đánh giá"}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
          </div>
          <span className="ml-2 text-xs text-gray-500">{dateStr}</span>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = async () => {
  // Lấy dữ liệu dashboard cho instructor - gọi một lần duy nhất
  const { stats, recentReviews, allEnrollments } = await fetchDashboardData();

  // Chuẩn hóa xử lý các biến thống kê
  const totalCourses = stats?.courses?.length || 0;
  const totalEnrollments = stats?.enrollments?.length || 0;
  const totalRevenue = stats?.revenue || 0;
  const avgRating = stats?.ratings || 0;
  const recentCourses = stats?.courses?.slice(0, 4) || [];

  // Tính toán tỷ lệ hoàn thành khóa học
  let completionRate = 0;
  if (allEnrollments.length > 0) {
    const completedEnrollments = allEnrollments.filter(
      (e) => e.progress >= 80,
    ).length;
    completionRate = Math.round(
      (completedEnrollments / allEnrollments.length) * 100,
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Dashboard Giảng Viên
          </h1>
          <p className="text-muted-foreground">
            Chào mừng trở lại, {stats?.fullInsName || "Giảng viên"}. Đây là tổng
            quan về hoạt động của bạn.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/courses/add">
            <span>Tạo khóa học mới</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Thống kê chính */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Khóa Học"
          value={totalCourses}
          icon={<BookOpen className="h-4 w-4 text-primary" />}
          description="Số lượng khóa học đã tạo"
        />

        <StatCard
          title="Học Viên"
          value={totalEnrollments}
          icon={<Users className="h-4 w-4 text-blue-500" />}
          description="Tổng số học viên đã đăng ký"
        />

        <StatCard
          title="Doanh Thu"
          value={formatPrice(totalRevenue)}
          icon={<DollarSign className="h-4 w-4 text-green-500" />}
          description="Tổng doanh thu từ khóa học"
        />

        <StatCard
          title="Đánh Giá"
          value={`${Number(avgRating).toFixed(1)}/5.0`}
          icon={<Star className="h-4 w-4 text-yellow-500" />}
          description="Điểm đánh giá trung bình"
        />
      </div>

      {/* Phần nội dung chính */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Khóa học nổi bật */}
        <CoursesList courses={recentCourses} />

        {/* Thông tin bên phải */}
        <div className="space-y-6">
          {/* Tỷ lệ hoàn thành */}
          <CompletionRateCard completionRate={completionRate} />

          {/* Đánh giá gần đây */}
          <RecentReviewsCard reviews={recentReviews} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
