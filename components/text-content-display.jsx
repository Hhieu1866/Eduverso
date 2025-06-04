"use client";

export const TextContentDisplay = ({ content }) => {
  if (!content) {
    return (
      <div className="rounded-md border bg-gray-50 p-4 italic text-gray-500">
        Chưa có nội dung văn bản
      </div>
    );
  }

  return (
    <div className="prose prose-slate max-w-none rounded-md border bg-white p-4">
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
};
