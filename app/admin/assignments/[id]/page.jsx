"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AdminAssignmentDetailPage = ({ params }) => {
  const [assignment, setAssignment] = useState(null);
  const { id } = params;
  const router = useRouter();

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const response = await axios.get(`/api/assignments/${id}`);
      setAssignment(response.data);
    } catch (error) {
      console.error("Error fetching assignment:", error);
    }
  };

  if (!assignment) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
      </div>
      <p>{assignment.description}</p>
      {/* Thêm các thông tin chi tiết khác về assignment */}
    </div>
  );
};

export default AdminAssignmentDetailPage;
