"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ModuleList } from "./module-list";
import { getSlug } from "@/lib/convertData";
import { createModule, reOrderModules } from "@/app/actions/module";

const formSchema = z.object({
  title: z.string().min(1),
});
// const initialModules = [
//   {
//     id: "1",
//     title: "Module 1",
//     isPublished: true,
//   },
//   {
//     id: "2",
//     title: "Module 2",
//   },
// ];
export const ModulesForm = ({ initialData, courseId }) => {
  const [modules, setModules] = useState(initialData);
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const toggleCreating = () => {
    form.reset();
    setIsCreating((current) => !current);
  };

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("title", values?.title);
      formData.append("slug", getSlug(values?.title));
      formData.append("courseId", courseId);
      formData.append("order", modules.length);

      const module = await createModule(formData);

      setModules((modules) => [
        ...modules,
        {
          id: module?._id.toString(),
          title: values.title,
        },
      ]);
      toast.success("Đã tạo module mới");
      form.reset();
      toggleCreating();
      router.refresh();
    } catch (error) {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const onReorder = async (updateData) => {
    console.log({ updateData });
    try {
      reOrderModules(updateData);
      setIsUpdating(true);

      toast.success("Đã sắp xếp lại thứ tự module");
      router.refresh();
    } catch {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id) => {
    router.push(`/dashboard/courses/${courseId}/modules/${id}`);
  };

  return (
    <div className="relative mt-6 rounded-md border bg-slate-100 p-4">
      {isUpdating && (
        <div className="absolute right-0 top-0 flex h-full w-full items-center justify-center rounded-md bg-gray-500/20">
          <Loader2 className="h-6 w-6 animate-spin text-sky-700" />
        </div>
      )}
      <div className="flex items-center justify-between font-medium">
        Danh sách module
        <Button variant="ghost" onClick={toggleCreating}>
          {isCreating ? (
            <>Hủy</>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm module
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Ví dụ: 'Giới thiệu về khóa học...'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!isValid || isSubmitting} type="submit">
              Tạo mới
            </Button>
          </form>
        </Form>
      )}
      {!isCreating && (
        <div
          className={cn(
            "mt-2 text-sm",
            !modules?.length && "italic text-slate-500",
          )}
        >
          {!modules?.length && "Chưa có module nào"}
          <ModuleList
            onEdit={onEdit}
            onReorder={onReorder}
            items={modules || []}
          />
        </div>
      )}
      {!isCreating && (
        <p className="mt-4 text-xs text-muted-foreground">
          Kéo thả để sắp xếp lại thứ tự module
        </p>
      )}
    </div>
  );
};
