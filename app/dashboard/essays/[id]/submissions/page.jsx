import { getEssaySubmissions } from "@/app/actions/essaySubmission";
import { dbConnect } from "@/service/mongo";
import Essay from "@/model/essay";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EssaySubmissionsPage({ params }) {
  await dbConnect();
  const session = await auth();

  if (!session?.user || session.user.role !== "instructor") {
    return notFound();
  }

  const essay = await Essay.findOne({
    _id: params.id,
    createdBy: session.user.id,
  });

  if (!essay) {
    return notFound();
  }

  const submissions = await getEssaySubmissions(params.id);

  return (
    <div className="px-8 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/dashboard/essays">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          Danh sách bài nộp - {essay.title}
        </h1>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-md border p-6 text-center">
          <p className="text-muted-foreground">
            Chưa có học viên nộp bài tự luận này
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={submissions} />
      )}
    </div>
  );
}
