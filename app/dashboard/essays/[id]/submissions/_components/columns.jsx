"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "student",
    accessorKey: "studentId.name",
    header: "Học viên",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.studentId.name}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.studentId.email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "courseId.title",
    header: "Khóa học",
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate">
          {row.original.courseId.title}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày nộp",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);

      return (
        <div className="flex flex-col">
          <span>
            {formatDistanceToNow(date, {
              addSuffix: true,
              locale: vi,
            })}
          </span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status;

      let badgeContent = "Chưa chấm";
      let badgeVariant = "outline";

      if (status === "graded") {
        badgeContent = `Đã chấm (${row.original.grade}/10)`;
        badgeVariant = "default";
      } else if (status === "returned") {
        badgeContent = "Đã trả lại";
        badgeVariant = "secondary";
      } else if (status === "approved") {
        badgeContent = "Đã duyệt";
        badgeVariant = "default";
        badgeContent = (
          <span className="flex items-center gap-1 text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            Đã duyệt
          </span>
        );
      } else if (status === "rejected") {
        badgeContent = (
          <span className="flex items-center gap-1 text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            Từ chối
          </span>
        );
      }

      return <Badge variant={badgeVariant}>{badgeContent}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end gap-2">
          {row.original.fileUrl && (
            <a
              href={row.original.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background p-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <FileText className="h-4 w-4" />
              <span className="sr-only">Xem bài làm</span>
            </a>
          )}
          <Link href={`/dashboard/essays/submissions/${row.original._id}`}>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
              <span className="sr-only">Chấm điểm</span>
            </Button>
          </Link>
        </div>
      );
    },
  },
];
