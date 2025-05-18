import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import Content from "./Content";

// SVG Avatar Components
const Avatar1 = () => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
  >
    <mask
      id="mask__beam1"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="36"
      height="36"
    >
      <rect width="36" height="36" rx="18" fill="white" />
    </mask>
    <g mask="url(#mask__beam1)">
      <rect width="36" height="36" fill="#0ea5e9" />
      <rect
        x="0"
        y="0"
        width="36"
        height="36"
        transform="translate(5 -1) rotate(189 18 18) scale(1)"
        fill="#f43f5e"
        opacity="0.75"
      />
      <g transform="translate(-1 4.5) rotate(9 18 18)">
        <path d="M13,19 a1,0.75 0 0,0 10,0" fill="white" />
        <rect
          x="12"
          y="14"
          width="1.5"
          height="2"
          rx="1"
          stroke="none"
          fill="white"
        />
        <rect
          x="22"
          y="14"
          width="1.5"
          height="2"
          rx="1"
          stroke="none"
          fill="white"
        />
      </g>
    </g>
  </svg>
);

const Avatar2 = () => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
  >
    <mask
      id="mask__beam2"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="36"
      height="36"
    >
      <rect width="36" height="36" rx="18" fill="white" />
    </mask>
    <g mask="url(#mask__beam2)">
      <rect width="36" height="36" fill="#7c3aed" />
      <rect
        x="0"
        y="0"
        width="36"
        height="36"
        transform="translate(0 7) rotate(120 18 18) scale(1)"
        fill="#10b981"
        opacity="0.85"
      />
      <g transform="translate(-1 4.5) rotate(9 18 18)">
        <path d="M13,20 a1,0.75 0 0,0 10,0" fill="white" />
        <rect
          x="12"
          y="14"
          width="1.5"
          height="2"
          rx="1"
          stroke="none"
          fill="white"
        />
        <rect
          x="22"
          y="14"
          width="1.5"
          height="2"
          rx="1"
          stroke="none"
          fill="white"
        />
      </g>
    </g>
  </svg>
);

const Avatar3 = () => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
  >
    <mask
      id="mask__beam3"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="36"
      height="36"
    >
      <rect width="36" height="36" rx="18" fill="white" />
    </mask>
    <g mask="url(#mask__beam3)">
      <rect width="36" height="36" fill="#f59e0b" />
      <rect
        x="0"
        y="0"
        width="36"
        height="36"
        transform="translate(4 -8) rotate(90 18 18) scale(1)"
        fill="#4f46e5"
        opacity="0.75"
      />
      <g transform="translate(-1 4.5) rotate(9 18 18)">
        <path d="M13,21 a1,0.75 0 0,0 10,0" fill="white" />
        <rect
          x="12"
          y="14"
          width="1.5"
          height="2"
          rx="1"
          stroke="none"
          fill="white"
        />
        <rect
          x="22"
          y="14"
          width="1.5"
          height="2"
          rx="1"
          stroke="none"
          fill="white"
        />
      </g>
    </g>
  </svg>
);

const Avatar4 = () => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
  >
    <mask
      id="mask__beam4"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="36"
      height="36"
    >
      <rect width="36" height="36" rx="18" fill="white" />
    </mask>
    <g mask="url(#mask__beam4)">
      <rect width="36" height="36" fill="#06b6d4" />
      <rect
        x="0"
        y="0"
        width="36"
        height="36"
        transform="translate(9 -5) rotate(219 18 18) scale(1)"
        fill="#8b5cf6"
        opacity="0.75"
      />
      <g transform="translate(-1 4.5) rotate(9 18 18)">
        <path d="M13,19 a1,0.75 0 0,0 10,0" fill="white" />
        <rect
          x="12"
          y="14"
          width="1.5"
          height="2"
          rx="1"
          stroke="none"
          fill="white"
        />
        <rect
          x="22"
          y="14"
          width="1.5"
          height="2"
          rx="1"
          stroke="none"
          fill="white"
        />
      </g>
    </g>
  </svg>
);

const Avatar5 = () => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
  >
    <mask
      id="mask__beam5"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="36"
      height="36"
    >
      <rect width="36" height="36" rx="18" fill="white" />
    </mask>
    <g mask="url(#mask__beam5)">
      <rect width="36" height="36" fill="#ec4899" />
      <rect
        x="0"
        y="0"
        width="36"
        height="36"
        transform="translate(-6 2) rotate(40 18 18) scale(1)"
        fill="#a855f7"
        opacity="0.75"
      />
      <g transform="translate(-1 4.5) rotate(9 18 18)">
        <path d="M13,19 a1,0.75 0 0,0 10,0" fill="white" />
        <rect
          x="12"
          y="14"
          width="1.5"
          height="2"
          rx="1"
          stroke="none"
          fill="white"
        />
        <rect
          x="22"
          y="14"
          width="1.5"
          height="2"
          rx="1"
          stroke="none"
          fill="white"
        />
      </g>
    </g>
  </svg>
);

const testimonials = [
  {
    id: 1,
    avatar: Avatar1,
    name: "Nguyễn Văn A",
    username: "@nguyena",
    content:
      "Tôi đã học được rất nhiều điều từ các khóa học ở đây. Nội dung dễ hiểu và giảng viên rất tận tâm!",
  },
  {
    id: 2,
    avatar: Avatar2,
    name: "Trần Thị B",
    username: "@tranb",
    content:
      "Khóa học thiết kế đồ họa đã giúp tôi tìm được công việc mới. Đây là nền tảng học trực tuyến tốt nhất mà tôi từng sử dụng.",
  },
  {
    id: 3,
    avatar: Avatar3,
    name: "Lê Văn C",
    username: "@levanc",
    content:
      "Giao diện dễ sử dụng, học liệu chất lượng và cộng đồng học viên rất hỗ trợ. Tôi đã giới thiệu cho rất nhiều bạn của mình!",
  },
  {
    id: 4,
    avatar: Avatar4,
    name: "Phạm Thị D",
    username: "@phamd",
    content:
      "Tôi đã hoàn thành khóa học lập trình web và đã có thể tự xây dựng trang web cho riêng mình. Cảm ơn Easy Learning!",
  },
  {
    id: 5,
    avatar: Avatar5,
    name: "Hoàng Văn E",
    username: "@hoange",
    content:
      "Chất lượng video bài giảng rất tốt, nội dung cập nhật thường xuyên và bài tập thực hành rất hữu ích. Tuyệt vời!",
  },
];

export default function WhyChooseUs() {
  return (
    <section
      className="w-full bg-white py-12 dark:bg-gray-950 md:py-24 lg:py-32"
      id="testimonials"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge variant="secondary" className="text-base">
              Tính năng nổi bật
            </Badge>
            <h2 className="text-colors-navy text-3xl font-bold tracking-tighter sm:text-5xl">
              Tại sao chọn Eduverse?
            </h2>
            {/* <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Chúng tôi cung cấp nền tảng học tập toàn diện với nhiều tính năng
              vượt trội
            </p> */}
          </div>
        </div>

        <div className="mt-12">
          <Content />
        </div>
      </div>
    </section>
  );
}
