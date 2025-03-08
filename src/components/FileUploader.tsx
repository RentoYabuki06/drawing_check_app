import React, { useState } from "react";
import { FaFileUpload } from "react-icons/fa";
import { Color } from "@/const/Color";

type FileUploaderProps = {
  onFileSelect: (file: File | null) => void;
  uploadedImageUrl: string;
};

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    if (!file) {
      setError("ファイルが選択されていません。");
      return false;
    }

    if (file.type !== "application/pdf") {
      setError("PDFファイルのみアップロード可能です。");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      } else {
        onFileSelect(null);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      } else {
        onFileSelect(null);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
  };

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        padding: "10px",
        border: dragging ? "2px dashed #000" : "2px solid #ddd",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <FaFileUpload
        style={{
          fontSize: "96px",
          marginBottom: "40px",
          color: Color.BLUE_DEEP,
        }}
      />
      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
      ドラック＆ドロップまたはファイルを選択
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "10px 40px",
          backgroundColor: Color.BLUE_DEEP,
          color: "#ffffff",
          borderRadius: "35px",
          cursor: "pointer",
          marginTop: "40px",
        }}
      >
        <FaFileUpload style={{ marginRight: "10px" }} /> ファイルを選択
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
};

export default FileUploader;
