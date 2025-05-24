"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

const AssignmentFileUpload = ({ assignmentId, onSubmit }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn file");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    axios
      .post("/api/upload/assignment-files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        // Gửi URL file lên server để lưu vào submission
        onSubmit(response.data.url);
        alert("Upload thành công!");
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
        alert("Upload thất bại!");
      })
      .finally(() => {
        setUploading(false);
      });
  };

  return (
    <div>
      <Input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Đang upload..." : "Upload"}
      </Button>
    </div>
  );
};

export default AssignmentFileUpload;
