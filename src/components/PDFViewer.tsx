import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useState } from "react";

// PDF worker config
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PDFViewer({ pdfFile }: { pdfFile: string }) {
  const [numPages, setNumPages] = useState<number>(0);

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden p-2">
      <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
        {Array.from({ length: numPages }, (_, i) => (
          <Page key={i} pageNumber={i + 1} width={800} className="pb-4 bg-white" />
        ))}
      </Document>
    </div>
  );
}
