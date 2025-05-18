import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Danh sách câu hỏi & trả lời
const faqList = [
  {
    question: "Eduverse có những khóa học nào?",
    answer:
      "EduLearn cung cấp hơn 1000+ khóa học đa dạng trong nhiều lĩnh vực như lập trình, thiết kế, kinh doanh, marketing, ngoại ngữ và nhiều lĩnh vực khác. Các khóa học được thiết kế phù hợp với mọi trình độ từ cơ bản đến nâng cao.",
  },
  {
    question: "Tôi có thể học trên những thiết bị nào?",
    answer:
      "Eduverse được tối ưu hóa để hoạt động trên mọi thiết bị bao gồm máy tính, laptop, máy tính bảng và điện thoại di động. Bạn có thể truy cập nền tảng thông qua trình duyệt web hoặc tải xuống ứng dụng di động của chúng tôi trên iOS và Android.",
  },
  {
    question: "EduLearn có hỗ trợ thanh toán bằng những phương thức nào?",
    answer:
      "Hiện tại, các khóa học trên Eduverse đang được cung cấp hoàn toàn miễn phí. Bạn có thể đăng ký và bắt đầu học ngay mà không cần thanh toán. Đây là cơ hội để bạn trải nghiệm nền tảng và nâng cao kiến thức mà không lo về chi phí.",
  },
  {
    question: "Tôi có thể truy cập khóa học trong bao lâu sau khi mua?",
    answer:
      "Sau khi mua khóa học, bạn sẽ có quyền truy cập vĩnh viễn vào nội dung khóa học. Điều này có nghĩa là bạn có thể học theo tốc độ của riêng mình và xem lại bài học bất cứ khi nào bạn cần, ngay cả sau khi đã hoàn thành khóa học.",
  },
];

const FAQAccordion = () => {
  return (
    <Accordion type="single" collapsible className="w-full px-2">
      {faqList.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionTrigger className="text-colors-navy text-2xl">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-xl text-gray-500">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQAccordion;
