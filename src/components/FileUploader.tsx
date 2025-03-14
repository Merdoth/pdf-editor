import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

export default function FileUploader({ onFileUpload }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      onFileUpload(acceptedFiles[0]); // Pass file to parent
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-6 text-center cursor-pointer bg-gray-100 rounded-lg w-full">
      <input {...getInputProps()} />
      <p className="text-gray-500">{isDragActive ? "Drop the file here..." : "Drag & drop a PDF or click to select"}</p>
    </div>
  );
}
