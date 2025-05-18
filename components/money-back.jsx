import Image from "next/image";
import React from "react";

const MoneyBack = () => {
  return (
    <div className="bg-blue-50">
      <div className="container py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="flex justify-center md:w-1/2">
            <Image
              src="/assets/images/money.png"
              alt="Money Back Guarantee"
              width={500}
              height={400}
              className="rounded-lg"
            />
          </div>
          <div className="text-center md:w-1/2 md:text-left">
            <h3 className="mb-2 text-lg font-semibold text-green-600">
              TRY IT FOR RISK FREE
            </h3>
            <h2 className="mb-4 text-5xl font-bold text-gray-800">
              30-Day Money-Back Guarantee
            </h2>
            <p className="text-gray-600">
              You can ask for a refund any time during the first 30 days if you
              decide the course isn't for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoneyBack;
