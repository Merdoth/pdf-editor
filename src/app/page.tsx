"use client";

import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import * as fabric from "fabric";
import { motion, AnimatePresence } from "framer-motion";


const FileUploader = dynamic(() => import("../components/FileUploader"), { ssr: false });
const PDFViewer = dynamic(() => import("../components/PDFViewer"), { ssr: false });
const AnnotationCanvas = dynamic(() => import("../components/AnnotationCanvas"), { ssr: false });
const ExportButton = dynamic(() => import("../components/ExportButton"), { ssr: false });


export default function Home() {

  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const editorRef = useRef<fabric.Canvas | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);


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

<AnimatePresence>
        {pdfFile && !isLoading && (
          <>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="fixed w-[90%] md:w-[60%] top-6 bottom-6 m-auto flex items-start justify-center rounded-lg shadow-lg overflow-y-auto z-50"
            >
              <div className="relative bg-white h-auto p-6 rounded-lg shadow-lg w-full max-w-5xl">
                <button
                  onClick={() => setPdfFile(null)}
                  className="absolute top-4 right-4 bg-gray-200 text-gray-500 p-2 rounded-full z-50 text-[15px] font-black"
                >
                  ✕
                </button>

                <div className="relative p-4 rounded-lg shadow-md w-full max-w-4xl m-auto">
                  <PDFViewer pdfFile={pdfFile} />
                  <AnnotationCanvas editorRef={editorRef} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
            />
          </>
        )}
      </AnimatePresence>
      <ExportButton pdfContainerRef={pdfContainerRef} />
      </div>
  );
}
