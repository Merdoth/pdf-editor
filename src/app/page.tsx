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
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  const editorRef = useRef<fabric.Canvas | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);

  const handleFileUpload = (file: File) => {
    setIsLoading(true);
    const fileUrl = URL.createObjectURL(file);

    setTimeout(() => {
      setPdfFile(fileUrl);
      setIsLoading(false);
      setShowInstructions(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center p-4 md:p-6 min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <header className="w-full max-w-5xl mb-8 text-center mt-18">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">PDF Editor</h1>
        <p className="text-sm md:text-base text-gray-600">Upload, annotate and sign your PDF documents</p>
      </header>

      {!pdfFile && (
        <div className="w-full max-w-5xl flex flex-col items-center">
          <FileUploader onFileUpload={handleFileUpload} />
          
          {showInstructions && (
            <div className="mt-12 p-6 bg-white rounded-lg shadow-md w-full max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Features:</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Highlight text with customizable colors</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Underline text with customizable colors</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Add comments to specific parts of the document</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Draw signatures anywhere on the document</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Export annotated document as PDF</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading PDF...</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {pdfFile && !isLoading && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-0 pt-4 pb-20 px-4 md:p-8 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-6xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">PDF Annotator</h2>
                  
                  <div className="flex items-center space-x-2">
                    <ExportButton pdfContainerRef={pdfContainerRef} />
                    
                    <button
                      onClick={() => setPdfFile(null)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Close"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="relative flex-grow overflow-hidden">
                  <PDFViewer pdfFile={pdfFile} pdfContainerRef={pdfContainerRef} />
                  <AnnotationCanvas editorRef={editorRef} pdfContainerRef={pdfContainerRef} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setPdfFile(null)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}