/* eslint-disable */
import { createSnowflakes, drawSnowflakes } from "@/utils";
import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

export default function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Snowflakes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    const snowflakes: { x: number; y: number; radius: number; speed: number }[] = [];
  
    const moveSnowflakes = () => {
      snowflakes.forEach((flake) => {
        flake.y += flake.speed;
        if (flake.y > canvas.height) {
          flake.y = 0;
          flake.x = Math.random() * canvas.width;
        }
      });
    };
  
    const animateSnow = () => {
      drawSnowflakes(ctx, snowflakes, canvas, moveSnowflakes);
      requestAnimationFrame(animateSnow);
    };
  
    createSnowflakes(100, snowflakes, canvas);
    drawSnowflakes(ctx, snowflakes, canvas, moveSnowflakes);
    animateSnow();
  }, []);
  
 

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false);

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file.");
        return;
      }

      onFileUpload(file);
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  return (
    <div className="relative w-full max-w-2xl">
      {/* Snowfall Canvas */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none"></canvas>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
          flex flex-col items-center justify-center space-y-3`}
      >
        <input {...getInputProps()} />

        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>

        <div className="text-lg font-medium text-gray-700">
          {isDragActive ? "Drop your PDF here" : "Drag & drop your PDF here"}
        </div>

        <p className="text-sm text-gray-500">or click to browse files</p>

        <div className="text-xs text-gray-400 mt-2">Only PDF files are accepted</div>
      </div>
    </div>
  );
}
