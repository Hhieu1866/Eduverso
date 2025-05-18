"use client";
import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Checkbox } from "@/components/ui/checkbox";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useFilterLoading from "@/hooks/useFilterLoading";

const PRICE_OPTIONS = [
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
];

const FilterCourse = ({
  categories = [],
  initialFilters = { categories: [], price: [], sort: "" },
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filter, setFilter] = useState(initialFilters);
  const { setLoading } = useFilterLoading();

  // Theo dõi thay đổi của initialFilters từ URL
  useEffect(() => {
    setFilter(initialFilters);
  }, [initialFilters]);

  // Cập nhật URL khi filter thay đổi
  const updateURL = (newFilter) => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);

    // Xóa các params hiện tại
    params.delete("categories");
    params.delete("price");

    // Thêm params mới
    newFilter.categories.forEach((category) => {
      params.append("categories", category);
    });

    newFilter.price.forEach((price) => {
      params.append("price", price);
    });

    if (newFilter.sort) {
      params.set("sort", newFilter.sort);
    } else {
      params.delete("sort");
    }

    // Cập nhật URL và sau đó set isUpdating về false
    router.push(`${pathname}?${params.toString()}`);

    // Đặt timeout để hiển thị loading trong một khoảng thời gian ngắn
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  //   apply checkbox filter
  const applyArrayFilter = ({ type, value }) => {
    const isFilterApplied = filter[type].includes(value);

    const newFilter = { ...filter };

    if (isFilterApplied) {
      newFilter[type] = newFilter[type].filter((v) => v !== value);
    } else {
      newFilter[type] = [...newFilter[type], value];
    }

    setFilter(newFilter);
    updateURL(newFilter);
  };

  return (
    <div className="hidden lg:block">
      <Accordion defaultValue={["categories"]} type="multiple">
        {/* Categories filter */}
        <AccordionItem value="categories">
          <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
            <span className="font-medium text-gray-900">Categories</span>
          </AccordionTrigger>

          <AccordionContent className="animate-none pt-6">
            <ul className="space-y-4">
              {categories.map((category, optionIdx) => (
                <li key={category.id} className="flex items-center">
                  <Checkbox
                    type="checkbox"
                    id={`category-${optionIdx}`}
                    onCheckedChange={() => {
                      applyArrayFilter({
                        type: "categories",
                        value: category.id,
                      });
                    }}
                    checked={filter.categories.includes(category.id)}
                  />
                  <label
                    htmlFor={`category-${optionIdx}`}
                    className="ml-3 cursor-pointer text-sm text-gray-600"
                  >
                    {category.title}
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        {/* Price filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
            <span className="font-medium text-gray-900">Price</span>
          </AccordionTrigger>

          <AccordionContent className="animate-none pt-6">
            <ul className="space-y-4">
              {PRICE_OPTIONS.map((option, optionIdx) => (
                <li key={option.value} className="flex items-center">
                  <Checkbox
                    type="checkbox"
                    id={`price-${optionIdx}`}
                    onCheckedChange={() => {
                      applyArrayFilter({
                        type: "price",
                        value: option.value,
                      });
                    }}
                    checked={filter.price.includes(option.value)}
                  />
                  <label
                    htmlFor={`price-${optionIdx}`}
                    className="ml-3 cursor-pointer text-sm text-gray-600"
                  >
                    {option.label}
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FilterCourse;
