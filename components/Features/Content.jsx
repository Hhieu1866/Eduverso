import React from "react";
import { MarqueeDemoVertical } from "./MarqueeDemoVertical";
import FeatureCard from "./FeatureCard";
import FAQAccordion from "./FAQAccordion";

const Content = () => {
  return (
    <section className="space-y-20">
      <FeatureCard />
      <div className="flex items-start justify-between px-2">
        <div className="flex-1">
          {/* <FeatureCard /> */}
          <p className="mt-4 text-2xl font-semibold tracking-tighter text-colors-navy sm:text-5xl">
            Học viên nói gì về chúng tôi?
          </p>
        </div>
        <div className="flex-1">
          <MarqueeDemoVertical />
        </div>
      </div>

      <div className="flex items-start justify-between px-2">
        <div className="flex-1">
          {/* <FeatureCard /> */}
          <p className="mt-5 text-2xl font-semibold tracking-tighter text-colors-navy sm:text-5xl">
            FAQs
          </p>
        </div>
        <div className="flex-1">
          <FAQAccordion />
        </div>
      </div>
    </section>
  );
};

export default Content;
