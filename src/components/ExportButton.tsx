import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ExportButton({ pdfContainerRef }: { pdfContainerRef: React.RefObject<HTMLDivElement> }) {
  const handleExport = async () => {
    if (!pdfContainerRef.current) return;

    const canvas = await html2canvas(pdfContainerRef.current);
    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");

    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    pdf.save("annotated-document.pdf");
  };

  return (
    <button onClick={handleExport} className="p-3 bg-red-500 text-white rounded mt-4">
      Export PDF
    </button>
  );
}
