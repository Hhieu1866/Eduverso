"use client";
import { Button } from "@/components/ui/button";
import { ReviewModal } from "./review-modal";
import { useState } from "react";
import { ThumbsUp } from "lucide-react";

export const GiveReview = ({ courseId, loginid }) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsReviewModalOpen(true)}
        variant="outline"
        className="w-full justify-start gap-2"
        size="lg"
      >
        <ThumbsUp className="h-4 w-4 text-primary" />
        Đánh giá khóa học
      </Button>
      <ReviewModal
        open={isReviewModalOpen}
        setOpen={setIsReviewModalOpen}
        courseId={courseId}
        loginid={loginid}
      />
    </>
  );
};
