import { getEssays } from "@/app/actions/essay";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";

export default async function EssaysPage() {
  const essays = await getEssays();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Quản lý bài tự luận</h1>
      <DataTable columns={columns} data={essays || []} />
    </div>
  );
}
