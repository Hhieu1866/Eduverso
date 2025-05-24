import { EssayForm } from "../_components/essay-form";

export default function CreateEssayPage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Tạo bài tự luận mới</h1>
      <div className="rounded-md border bg-card p-6">
        <EssayForm />
      </div>
    </div>
  );
}
