import { Award, BookOpen, Clock, Globe, Shield, Users } from "lucide-react";
import React from "react";
import { Card, CardDescription, CardTitle } from "../ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Khóa học đa dạng",
    description:
      "Hơn 1000+ khóa học từ cơ bản đến nâng cao trong nhiều lĩnh vực khác nhau.",
  },
  {
    icon: Users,
    title: "Giảng viên chất lượng",
    description:
      "Đội ngũ giảng viên có kinh nghiệm và chuyên môn cao trong từng lĩnh vực.",
  },
  {
    icon: Clock,
    title: "Học mọi lúc, mọi nơi",
    description:
      "Truy cập nội dung học tập 24/7 trên mọi thiết bị, không giới hạn thời gian.",
  },
];

const FeatureCard = () => {
  return (
    <div className="flex gap-4">
      {features.map((feature, index) => (
        <div
          className="flex w-11/12 flex-col items-start space-y-4 rounded-2xl border p-5 transition"
          key={index}
        >
          <div className="rounded-lg bg-secondary p-3">
            <feature.icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl text-colors-navy">
            {feature.title}
          </CardTitle>
          <CardDescription className="text-base">
            {feature.description}
          </CardDescription>
        </div>
      ))}
    </div>
  );
};

export default FeatureCard;
