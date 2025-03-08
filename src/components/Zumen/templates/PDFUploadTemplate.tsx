"use client";

import {
  Button,
  Stack,
  Typography,
} from "@mui/material";
import React, { useRef } from "react";

interface PDFUploaderProps {
  onFileSelect: (file: File | null) => void;
  uploadedImageUrl: string | null;
}

export const PDFUploadTemplate: React.FC<PDFUploaderProps> = ({ onFileSelect, uploadedImageUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Stack spacing={3} alignItems="center" p={4}>
      <Typography variant="h5" component="h2">
        自社規格PDFアップロード
      </Typography>
      
      <Stack spacing={2} width="100%" maxWidth={600}>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <Button
            variant="contained"
            onClick={() => fileInputRef.current?.click()}
          >
            PDFを選択
          </Button>
          
          {uploadedImageUrl && (
            <div className="mt-4">
              <p className="text-green-600 font-medium">
                PDFをアップロードしました
              </p>
              <div className="flex justify-center">
                {/* <img 
                  src={uploadedImageUrl} 
                  alt="PDF Preview" 
                  className="w-32 h-auto object-contain mt-2"
                /> */}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">注意事項:</h3>
          <ul className="text-sm text-gray-600 list-disc pl-5">
            <li>PDFファイル形式のみ対応しています</li>
            <li>アップロードされたPDFは図面チェック時の参照として使用されます</li>
            <li>最新の自社規格PDFを使用してください</li>
          </ul>
        </div>
      </Stack>
    </Stack>
  );
}; 