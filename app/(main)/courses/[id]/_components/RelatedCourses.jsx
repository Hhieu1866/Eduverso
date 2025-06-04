import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { getImageUrl, shouldDisplayImage } from "@/lib/imageUtils";

const RelatedCourses = ({ relatedCourses }) => {
  return (
    <section className="">
      <div className="container">
        <p className="mb-6 text-2xl font-bold">
          Các lộ trình có thể bạn quan tâm
        </p>
        <Carousel
          opts={{
            align: "start",
          }}
          className="mx-auto w-full max-2xl:w-[90%]"
        >
          <CarouselPrevious />
          <CarouselNext />
          <CarouselContent>
            {relatedCourses.map((course) => {
              // console.log("Related course data:", course?._id, {
              //   thumbnailUrl: course?.thumbnailUrl,
              //   thumbnail: course?.thumbnail,
              // });

              let imageSrc;

              if (course?.thumbnailUrl) {
                imageSrc = course.thumbnailUrl;
              } else if (typeof course?.thumbnail === "string") {
                imageSrc = getImageUrl(course.thumbnail, "course");
              } else if (typeof course?.thumbnail === "object") {
                imageSrc = getImageUrl(course.thumbnail, "course");
              } else {
                imageSrc = getImageUrl(null, "course");
              }

              const showImage = shouldDisplayImage(imageSrc);

              // console.log(
              //   "Related image source:",
              //   imageSrc,
              //   "Should show:",
              //   showImage,
              // );

              return (
                <CarouselItem
                  key={course._id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <Link href={`/courses/${course._id.toString()}`}>
                    <div className="group h-full overflow-hidden rounded-lg border p-3 transition hover:shadow-sm">
                      <div className="relative aspect-video w-full overflow-hidden rounded-md">
                        {showImage && (
                          <Image
                            src={imageSrc}
                            alt="Course thumbnail"
                            className="object-cover"
                            fill
                          />
                        )}
                      </div>
                      <div className="flex flex-col pt-2">
                        <div className="line-clamp-2 text-lg font-medium group-hover:text-sky-700 md:text-base">
                          {course.title}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {course.category?.title || "Development"}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-md font-medium text-slate-700 md:text-sm">
                            {formatPrice(course.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default RelatedCourses;
