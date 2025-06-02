/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import Marquee from "../magicui/marquee";

const reviews = [
  {
    name: "Nguyễn Thùy Linh",
    username: "@linhnguyen",
    body: "Eduverse giúp mình hoàn thành khóa học và nhận chứng chỉ rất dễ dàng. Giao diện đẹp, quiz và bài tự luận đều rất trực quan!",
    img: "https://avatar.vercel.sh/linh",
  },
  {
    name: "Trần Minh",
    username: "@minhtran",
    body: "Mình thích nhất là phần nộp bài tự luận, giảng viên phản hồi rất nhanh và chi tiết. Nhờ đó mình tiến bộ rõ rệt.",
    img: "https://avatar.vercel.sh/minh",
  },
  {
    name: "Lê Hoàng Phúc",
    username: "@phuclehoang",
    body: "Các bộ quiz trên Eduverse rất đa dạng, làm xong là biết mình yếu chỗ nào ngay. Chứng chỉ tải về cũng rất chuyên nghiệp!",
    img: "https://avatar.vercel.sh/phuc",
  },
  {
    name: "Phạm Quỳnh Anh",
    username: "@quynhanhpham",
    body: "Tôi là giảng viên, quản lý bài tập và chấm điểm trên Eduverse cực kỳ tiện lợi. Học viên nộp bài, nhận xét, duyệt chỉ vài click!",
    img: "https://avatar.vercel.sh/anh",
  },
  {
    name: "Vũ Nam",
    username: "@namvu",
    body: "Hỗ trợ kỹ thuật của Eduverse rất nhiệt tình, mình hỏi gì cũng được giải đáp nhanh chóng. Rất hài lòng!",
    img: "https://avatar.vercel.sh/nam",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({ img, name, username, body }) => {
  return (
    <figure
      className={cn(
        "w-full rounded-xl border p-5",
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function MarqueeDemoVertical() {
  return (
    <div className="relative flex h-[500px] w-full flex-row items-center justify-center overflow-hidden">
      <Marquee pauseOnHover vertical className="w-full [--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee
        reverse
        pauseOnHover
        vertical
        className="w-full [--duration:20s]"
      >
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background"></div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
    </div>
  );
}
