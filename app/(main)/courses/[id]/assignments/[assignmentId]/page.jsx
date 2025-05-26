"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
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
      <h1 className="mb-4 text-2xl font-bold">{assignment.title}</h1>
      <p>{assignment.description}</p>

      <AssignmentFileUpload
        assignmentId={assignmentId}
        onSubmit={handleFileUpload}
      />

      <div className="mb-4">
        <label
          htmlFor="submissionText"
          className="mb-2 block text-sm font-bold text-gray-700"
        >
          Nội dung bài làm:
        </label>
        <Textarea
          id="submissionText"
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
        />
      </div>

      <Button onClick={handleSubmit}>Nộp bài</Button>
    </div>
  );
};

export default StudentAssignmentPage;
