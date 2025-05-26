import React from "react";
import { Check } from "lucide-react";

const CourseOverview = ({ course }) => {
  return (
    <div className="mt-8">
      <h2 className="mb-6 text-2xl font-bold">Khóa học này phù hợp với ai?</h2>
      <ul className="space-y-4">
        <li className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Người mới bắt đầu</p>
            <p className="text-gray-600">
              Nội dung được thiết kế đơn giản, dễ hiểu giúp người học nắm vững
              kiến thức nền tảng
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Người muốn nâng cao kỹ năng</p>
            <p className="text-gray-600">
              Cập nhật các kiến thức mới nhất và phương pháp thực hành tiên tiến
              trong lĩnh vực
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Chuyên gia trong ngành</p>
            <p className="text-gray-600">
              Bổ sung góc nhìn mới và công cụ hiện đại để tối ưu hóa quy trình
              làm việc
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Người tìm kiếm cơ hội nghề nghiệp</p>
            <p className="text-gray-600">
              Nâng cao khả năng cạnh tranh và mở rộng cơ hội việc làm thông qua
              chứng chỉ và kỹ năng thực tế
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default CourseOverview;
