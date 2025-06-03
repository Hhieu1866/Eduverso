"use client";
import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteQuiz } from "@/app/actions/quiz";

export const QuizCardActions = ({ quiz, quizSetId }) => {
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);

      switch (action) {
        case "edit-quiz": {
          // console.log(`Edting quiz: ${quiz.id} in quiz set: ${quizSetId} `);
          break;
        }
        case "delete-quiz": {
          await deleteQuiz(quizSetId, quiz.id);
          toast.success("Đã xóa câu hỏi thành công");
          router.refresh();
          break;
        }
        default: {
          throw new Error("Invalid Action");
        }
      }
    } catch (e) {
      toast.error(`Lỗi: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAction("edit-quiz")}
        disabled={loading}
      >
        <Pencil className="mr-1 w-3" /> Sửa
      </Button>
      <Button
        className="text-destructive"
        variant="ghost"
        size="sm"
        onClick={() => setAction("delete-quiz")}
        disabled={loading}
      >
        <Trash className="mr-1 w-3" /> Xóa
      </Button>
    </form>
  );
};
