import Image from "next/image";
import React from "react";

const support = () => {
  return (
    <div className="bg-darkBlue mb-14 py-5 text-black">
      <div className="container">
        <div className="mx-auto flex max-w-7xl flex-col items-center space-y-12 md:flex-row md:space-x-8 md:space-y-0">
          <div className="flex-1">
            <p className="mt-5 font-poppins text-3xl font-bold leading-tight text-gray-900 sm:text-4xl sm:leading-tight lg:leading-tight">
              <span className="relative inline-flex sm:inline">
                <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] opacity-30 blur-lg filter"></span>
                <span className="relative">
                  Cần hỗ trợ, liên hệ với chúng tôi!
                </span>
              </span>
            </p>

            <p className="mb-8 mt-8 leading-relaxed text-black">
              Là người sáng lập Eduverse và cũng là người truyền cảm hứng, chia
              sẻ kiến thức đến các bạn. Mục tiêu của chúng tôi là giúp các bạn,
              dù mới bắt đầu hay đã có kinh nghiệm, nâng cao kỹ năng, cải thiện
              thu nhập và thay đổi cuộc sống theo hướng tích cực hơn.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#"
                className="w-40 rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white shadow transition hover:bg-colors-primaryHover"
              >
                Liên hệ ngay
              </a>

              <a
                href="#"
                className="w-40 rounded-lg border border-primary bg-secondary px-6 py-3 text-center font-semibold text-primary shadow transition hover:bg-colors-secondaryHover"
              >
                Gọi hỗ trợ
              </a>
            </div>
          </div>

          <div className="flex flex-1 justify-center">
            <Image
              src="/assets/images/support1.png"
              alt="Support"
              width={500}
              height={400}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default support;
