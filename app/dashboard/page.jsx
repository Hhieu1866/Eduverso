import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatPrice";
import { getCourseDetailsByInstructor } from "@/queries/courses";

const DashboardPage = async () => {
  // Lấy instructor từ layout đã kiểm tra quyền
  // Có thể truyền instructor qua props nếu muốn tối ưu sâu hơn
  // Ở đây chỉ render nội dung
  // Nếu cần lấy lại instructor, có thể lấy lại từ session

  // ...

  // Để đơn giản, giả sử instructorId đã được lấy từ layout
  // const courseStatus = await getCourseDetailsByInstructor(instructorId);
  // Ở đây giữ nguyên logic cũ, chỉ bỏ kiểm tra quyền

  return (
    <div className="p-6">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* total courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* courseStatus?.courses */}
            </div>
          </CardContent>
        </Card>
        {/* total enrollments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* courseStatus?.enrollments */}
            </div>
          </CardContent>
        </Card>
        {/* total revinue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* formatPrice(courseStatus?.revenue) */}
            </div>
          </CardContent>
        </Card>
      </div>
      {/*  */}
    </div>
  );
};

export default DashboardPage;
