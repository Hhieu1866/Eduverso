import React from "react";
import { Check, Users, Calendar } from "lucide-react";

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
              Khóa học thiết kế đơn giản, dễ hiểu cho người mới làm quen với
              QA/QC
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Chuyên viên phát triển phần mềm</p>
            <p className="text-gray-600">
              Nâng cao hiểu biết về quy trình đảm bảo chất lượng trong phát
              triển
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Người có kinh nghiệm QA/QC</p>
            <p className="text-gray-600">
              Cập nhật các kỹ thuật và công cụ kiểm thử hiện đại
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Quản lý dự án</p>
            <p className="text-gray-600">
              Hiểu rõ hơn về quy trình đảm bảo chất lượng để quản lý dự án hiệu
              quả
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default CourseOverview;
