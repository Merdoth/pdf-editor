import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// PDF worker config
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PDFViewer({ 
  pdfFile, 
  pdfContainerRef 
}: { 
  pdfFile: string; 
  pdfContainerRef: React.RefObject<HTMLDivElement | null>; 
}) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingComplete, setIsLoadingComplete] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"single" | "all">("single");

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoadingComplete(true);
  };

  const handleLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "single" ? "all" : "single");
  };

  return (
    <div className="relative w-full h-[80vh] bg-white p-4">
    {/* PDF Controls */}
    {isLoadingComplete && (
      <div className="sticky top-0 z-20 flex flex-wrap justify-between items-center mb-4 p-2 bg-white bg-opacity-90 border-b border-gray-200 rounded-t-lg shadow-sm">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || viewMode === "all"}
            className="p-1 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-100"
            title="Previous Page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-gray-400">
            {viewMode === "all" ? "All Pages" : `Page ${currentPage} of ${numPages}`}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= numPages || viewMode === "all"}
            className="p-1 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-100"
            title="Next Page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
  
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer hover:scale-85"
            title="Zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <span className="text-sm text-gray-400">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer hover:scale-85"
            title="Zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          <button
            onClick={toggleViewMode}
            className="p-1 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer hover:scale-85"
            title={viewMode === "single" ? "Show All Pages" : "Single Page View"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    )}
  
    {/* PDF Document */}
    <div
      ref={pdfContainerRef} // Only one ref is needed here
      className="relative w-full h-[calc(80vh-64px)] overflow-y-auto bg-amber-200 py-4"
    >
      <div className="flex justify-center">
        <Document 
          file={pdfFile} 
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          className="mx-auto"
        >
          {viewMode === "all" ? (
            // All pages view
            Array.from(new Array(numPages), (_, index) => (
              <div key={`page_${index + 1}`} className="mb-4 shadow-lg">
                <Page 
                  pageNumber={index + 1} 
                  scale={scale}
                  className="mx-auto"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </div>
            ))
          ) : (
            // Single page view
            <div className="shadow-lg">
              <Page 
                pageNumber={currentPage} 
                scale={scale}
                className="mx-auto"
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </div>
          )}
        </Document>
      </div>
    </div>
  </div>
  );
}