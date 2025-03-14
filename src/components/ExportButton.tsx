import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useState } from "react";

export default function ExportButton({ pdfContainerRef }: { pdfContainerRef: React.RefObject<HTMLDivElement | null> }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!pdfContainerRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Get the PDF container with annotations
      const element = pdfContainerRef.current;
      
      // Create a canvas from the PDF container
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true, // Handle cross-origin images
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff"
      });
      
      // Create a new PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Calculate aspect ratio to fit the content properly
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add the first page
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      heightLeft -= pageHeight;
      
      // Add additional pages if the document is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      pdf.save("annotated-document.pdf");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting || !pdfContainerRef.current}
      className={`px-6 py-3 rounded-lg shadow-md transition-all
        ${isExporting 
          ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
          : "bg-blue-600 hover:bg-blue-700 text-white active:transform active:scale-95 cursor-pointer"
        }
        flex items-center justify-center space-x-2 text-sm font-semibold`}
    >
      {isExporting ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          <span>Export PDF</span>
        </>
      )}
    </button>
  );
}