"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get("/api/assignments");
      setAssignments(response.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý Bài tập Tự luận</h1>
        <Link href="/dashboard/assignments/create">
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Thêm Bài tập
          </Button>
        </Link>
      </div>
      {assignments.length > 0 ? (
        <ul className="list-disc pl-5">
          {assignments.map((assignment) => (
            <li key={assignment._id} className="py-2">
              <Link href={`/dashboard/assignments/${assignment._id}`}>
                {assignment.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có bài tập nào.</p>
      )}
    </div>
  );
};

export default AssignmentsPage;
