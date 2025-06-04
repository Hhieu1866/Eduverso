import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import StarRating from "@/components/start-rating";
import { Quote } from "lucide-react";

const Testimonials = ({ testimonials }) => {
  // Sắp xếp đánh giá mới nhất lên đầu
  const sortedTestimonials = [...testimonials].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <section className="pb-8 md:pb-12 lg:pb-24">
      <div className="container">
        <h2 className="mb-6 text-2xl font-bold">Đánh giá của học viên</h2>
        <Carousel
          opts={{
            align: "start",
          }}
          className="mx-auto w-full max-2xl:w-[90%]"
        >
          <CarouselPrevious />
          <CarouselNext />
          <CarouselContent className="py-4">
            {sortedTestimonials.map((testimonial) => (
              <CarouselItem
                key={testimonial.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <div className="sm:break-inside-avoid">
                  <blockquote className="relative rounded-2xl border border-gray-300 bg-gray-50 p-5">
                    <Quote className="absolute right-6 top-6 h-6 w-6 text-primary/30" />
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        alt="Profile"
                        src={testimonial?.user?.profilePicture}
                        width="56"
                        height="56"
                        className="size-14 rounded-full border-2 border-gray-300 object-cover"
                      />
                      <div>
                        <p className="mt-0.5 text-lg font-bold text-colors-navy">
                          {testimonial?.user?.firstName}{" "}
                          {testimonial?.user?.lastName}
                        </p>
                        {testimonial?.createdAt && (
                          <p className="text-xs font-medium text-gray-400">
                            {new Date(testimonial.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </p>
                        )}
                        <div className="mt-1 flex gap-0.5 text-yellow-600">
                          <StarRating rating={testimonial?.rating} />
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 italic text-gray-700">
                      {testimonial?.content}
                    </p>
                  </blockquote>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;
