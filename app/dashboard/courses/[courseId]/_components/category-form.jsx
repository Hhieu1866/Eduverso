"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Pencil, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { updateCourse } from "@/app/actions/course";

const formSchema = z.object({
  value: z.string().min(1),
});

const newCategorySchema = z.object({
  title: z.string().min(1, { message: "Tên danh mục là bắt buộc" }),
});

export const CategoryForm = ({ initialData, courseId, options }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // Đồng bộ options từ props với state nội bộ
  useEffect(() => {
    if (options && Array.isArray(options)) {
      // Chỉ cập nhật nếu options thay đổi
      setCategoryOptions(options);
    }
  }, [options]);

  const toggleEdit = useCallback(
    () => setIsEditing((current) => !current),
    [],
  );

  const toggleCreateNew = useCallback(() => {
    setIsCreatingNew((current) => !current);
    if (isCreatingNew) {
      newCategoryForm.reset();
    }
  }, [isCreatingNew]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: initialData?.value || "",
    },
  });

  const newCategoryForm = useForm({
    resolver: zodResolver(newCategorySchema),
    defaultValues: {
      title: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;
  const { isSubmitting: isSubmittingNew, isValid: isValidNew } =
    newCategoryForm.formState;

  const onSubmit = async (values) => {
    try {
      const selectedCategory = categoryOptions.find(
        (option) => option.value === values.value,
      );

      if (!selectedCategory) {
        toast.error("Danh mục không hợp lệ");
        return;
      }

      await updateCourse(courseId, { category: selectedCategory.id });
      toast.success("Đã cập nhật danh mục khóa học");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật");
    }
  };

  const onCreateCategory = async (values) => {
    try {
      setIsCreating(true);

      // Đảm bảo title không trống và được trim
      const title = values.title?.trim();
      if (!title) {
        throw new Error("Tên danh mục không được để trống");
      }

      // Chuẩn bị dữ liệu gửi đi với các trường bắt buộc
      const categoryData = {
        title: title,
        description: "",
        thumbnail: "default-category.jpg",
      };

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      // Kiểm tra response trước khi parse JSON
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Lỗi HTTP ${response.status}`,
        }));
        throw new Error(errorData.error || `Lỗi HTTP ${response.status}`);
      }

      // Parse JSON response an toàn
      const data = await response.json().catch((error) => {
        console.error("Lỗi parse JSON:", error);
        throw new Error("Không thể đọc phản hồi từ server");
      });

      if (!data || !data._id) {
        throw new Error("Dữ liệu phản hồi không hợp lệ");
      }

      // Thêm danh mục mới vào danh sách options
      const newOption = {
        value: data.title,
        label: data.title,
        id: data._id,
      };

      // Cẩn thận với việc cập nhật mảng để tránh tham chiếu không mong muốn
      setCategoryOptions((prevOptions) => [...prevOptions, newOption]);

      // Tự động chọn danh mục mới
      form.setValue("value", newOption.value);

      // Reset form tạo danh mục
      newCategoryForm.reset();
      setIsCreatingNew(false);

      toast.success("Đã tạo danh mục mới");

      // Làm mới trang để lấy danh sách categories mới nhất từ server
      router.refresh();
    } catch (error) {
      console.error("Lỗi khi tạo danh mục:", error);
      toast.error(error.message || "Đã xảy ra lỗi khi tạo danh mục");
    } finally {
      setIsCreating(false);
    }
  };

  // Sử dụng useMemo để tránh tạo lại giá trị mỗi khi render
  const selectedOption = useMemo(
    () => categoryOptions.find((option) => option.value === initialData.value),
    [categoryOptions, initialData.value],
  );

  return (
    <div className="mt-6 border bg-gray-50 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course Category
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Category
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.value && "text-slate-500 italic",
          )}
        >
          {selectedOption?.label || "No category"}
        </p>
      )}
      {isEditing && (
        <>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Combobox options={categoryOptions} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-x-2">
                <Button disabled={!isValid || isSubmitting} type="submit">
                  Save
                </Button>

                {!isCreatingNew && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleCreateNew}
                    className="ml-auto"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Thêm danh mục mới
                  </Button>
                )}
              </div>
            </form>
          </Form>

          {isCreatingNew && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Tạo danh mục mới</h3>
              <Form {...newCategoryForm}>
                <form
                  onSubmit={newCategoryForm.handleSubmit(onCreateCategory)}
                  className="space-y-4"
                >
                  <FormField
                    control={newCategoryForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Tên danh mục mới"
                            {...field}
                            disabled={isCreating}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-x-2">
                    <Button
                      type="submit"
                      disabled={!isValidNew || isCreating}
                      size="sm"
                    >
                      {isCreating && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Tạo danh mục
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleCreateNew}
                      disabled={isCreating}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </>
      )}
    </div>
  );
};
