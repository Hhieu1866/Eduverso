"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const AssignmentForm = ({ courseId, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [lesson, setLesson] = useState(initialData?.lesson || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (initialData) {
        // Cập nhật assignment
        await axios.put(`/api/assignments/${initialData._id}`, {
          title,
          description,
          course: courseId,
          lesson,
        });
        toast({
          title: "Success",
          description: "Assignment updated successfully.",
        });
      } else {
        // Tạo assignment mới
        await axios.post("/api/assignments", {
          title,
          description,
          course: courseId,
          lesson,
        });
        toast({
          title: "Success",
          description: "Assignment created successfully.",
        });
      }
      router.push(`/dashboard/assignments`);
    } catch (error) {
      console.error("Error creating/updating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to create/update assignment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
          Tiêu đề:
        </label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
          Mô tả:
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="lesson" className="block text-gray-700 text-sm font-bold mb-2">
          Lesson:
        </label>
        <Input
          type="text"
          id="lesson"
          value={lesson}
          onChange={(e) => setLesson(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="flex items-center justify-between">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isSubmitting ? "Đang xử lý..." : initialData ? "Cập nhật" : "Tạo"}
        </Button>
      </div>
    </form>
  );
};

export default AssignmentForm;
