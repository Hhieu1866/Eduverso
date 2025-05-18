"use client";

export const TextContentDisplay = ({ content }) => {
  if (!content) {
    return (
      <div className="p-4 border rounded-md bg-gray-50 text-gray-500 italic">
        Chưa có nội dung văn bản
      </div>
    );
  }

  return (
    <div className="prose prose-slate max-w-none p-4 border rounded-md bg-white">
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
};
