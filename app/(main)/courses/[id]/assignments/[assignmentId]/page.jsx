"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import AssignmentFileUpload from "@/components/assignment-file-upload";
import { Textarea } from "@/components/ui/textarea";

const StudentAssignmentPage = ({ params }) => {
  const [assignment, setAssignment] = useState(null);
  const [submittedFiles, setSubmittedFiles] = useState([]);
  const [submissionText, setSubmissionText] = useState("");
  const { id, assignmentId } = params;
  const router = useRouter();

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await axios.get(`/api/assignments/${assignmentId}`);
      setAssignment(response.data);
    } catch (error) {
      console.error("Error fetching assignment:", error);
    }
  };

  const handleFileUpload = (fileUrl) => {
    setSubmittedFiles((prevFiles) => [...prevFiles, { url: fileUrl }]);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`/api/assignments/${assignmentId}/submit`, {
        submittedFiles: submittedFiles,
        submissionText: submissionText,
      });
      alert("Nộp bài thành công!");
      router.push(`/courses/${id}`);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Nộp bài thất bại!");
    }
  };

  if (!assignment) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{assignment.title}</h1>
      <p>{assignment.description}</p>

      <AssignmentFileUpload assignmentId={assignmentId} onSubmit={handleFileUpload} />

      <div className="mb-4">
        <label htmlFor="submissionText" className="block text-gray-700 text-sm font-bold mb-2">
          Nội dung bài làm:
        </label>
        <Textarea
          id="submissionText"
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <Button onClick={handleSubmit}>Nộp bài</Button>
    </div>
  );
};

export default StudentAssignmentPage;
