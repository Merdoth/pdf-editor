"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const FileUploader = dynamic(() => import("../components/FileUploader"), { ssr: false });

export default function Home() {

  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileUpload = (file: File) => {
    setIsLoading(true);
    const fileUrl = URL.createObjectURL(file);

    setTimeout(() => {
      setPdfFile(fileUrl);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-4 w-full h-screen bg-gray-100">
        <FileUploader onFileUpload={handleFileUpload} />

        {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50 z-50">
          <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
