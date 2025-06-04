import Support from "@/components/support";
import WhyChooseUs from "@/components/Features/WhyChooseUs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCourseList } from "@/queries/courses";
import Link from "next/link";
import { getCategories } from "@/queries/categories";
import PopularCourses from "@/components/PopularCourses/PopularCourses";

const HomePage = async () => {
  const courses = await getCourseList();
  const categories = await getCategories();
  // console.log(cat);

  return (
    <>
      <section className="grainy space pb-8 pt-6 md:pb-12 md:pt-10 lg:py-40">
        <div className="container relative isolate flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#009688] to-[#4dd0e1] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>
          <span className="rounded-2xl border bg-muted px-4 py-1.5 text-sm font-semibold text-colors-navy shadow-lg">
            Chào mừng bạn đến với Eduverse
          </span>
          <h1 className="font-heading whitespace-nowrap text-3xl font-bold text-colors-navy sm:text-5xl md:text-6xl lg:text-7xl">
            Bắt đầu lộ trình học tập mới với <br /> Eduverse
          </h1>
          <div class="w-max">
            <h1 class="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-5 font-medium text-muted-foreground sm:text-xl sm:leading-8">
              Khám phá các lộ trình học tập phù hợp, giúp bạn học theo tiến độ
              và nhu cầu riêng...
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/courses"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Khám phá ngay
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Trở thành giảng viên
            </Link>
          </div>
        </div>
      </section>

      {/* <Element /> */}

      <WhyChooseUs />

      <PopularCourses />

      {/* Categories Section */}
      {/* <section
        id="categories"
        className="container space-y-6 py-8 md:py-12 lg:py-24"
      >
        <div className="flex items-center justify-between">
          <SectionTitle>Categories</SectionTitle>

          <Link
            href={""}
            className="flex items-center gap-1 text-sm font-medium hover:opacity-80"
          >
            Browse All <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="mx-auto grid grid-cols-2 justify-center gap-4 md:grid-cols-3 2xl:grid-cols-4">
          {categories.map((category) => {
            return (
              <Link
                href={`/categories/${category.id}`}
                key={category.id}
                className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all duration-500 ease-in-out hover:scale-105"
              >
                <div className="flex flex-col items-center justify-between gap-4 rounded-md p-6">
                  <Image
                    src={`/assets/images/categories/${category.thumbnail}`}
                    alt={category.title}
                    width={100}
                    height={100}
                  />
                  <h3 className="font-bold">{category.title}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section> */}

      <Support />

      <section className="w-full bg-primary py-8 text-primary-foreground md:py-20 lg:py-28">
        <div className="container">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
                Bạn muốn chia sẻ kiến thức và tạo dấu ấn riêng?
              </h2>
              <p className="mx-auto max-w-[750px] text-sm text-primary-foreground/80 sm:text-base md:text-xl">
                Hãy bắt đầu hành trình trở thành giảng viên cùng chúng tôi - nơi
                bạn có thể xây dựng khóa học của riêng mình và tiếp cận hàng
                nghìn người học đang chờ đón.
              </p>
            </div>
            <div className="text-base font-medium">
              <input
                type="text"
                placeholder="Email của bạn"
                className="rounded-l-sm p-2 pr-14 placeholder:text-gray-500"
              />
              <button className="rounded-r-sm bg-secondary px-4 py-2 text-primary">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default HomePage;
