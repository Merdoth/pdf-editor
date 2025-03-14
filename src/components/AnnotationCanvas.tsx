import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

export default function AnnotationCanvas({ editorRef }: { editorRef: React.RefObject<fabric.Canvas | null> }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState<string>("yellow");

  useEffect(() => {
    if (canvasRef.current && !editorRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: false,
        selection: false,
      });

      editorRef.current = fabricCanvas;

      return () => {
        fabricCanvas.dispose();
        editorRef.current = null;
      };
    }
  }, [editorRef]);

  const addHighlight = () => {
    if (!editorRef.current) return;
    const rect = new fabric.Rect({
      left: 50,
      top: 50,
      width: 200,
      height: 30,
      fill: color,
      opacity: 0.4,
    });
    editorRef.current.add(rect);
  };

  const addUnderline = () => {
    if (!editorRef.current) return;
    const line = new fabric.Line([50, 100, 250, 100], {
      stroke: color,
      strokeWidth: 3,
    });
    editorRef.current.add(line);
  };

  const addComment = () => {
    if (!editorRef.current) return;
    const text = new fabric.Textbox("Comment here...", {
      left: 50,
      top: 150,
      fontSize: 14,
      fill: "black",
      backgroundColor: "white",
      padding: 5,
      editable: true,
    });
    editorRef.current.add(text);
  };

  const enableSignatureMode = () => {
    if (!editorRef.current) return;
    editorRef.current.isDrawingMode = true;
    if (editorRef.current.freeDrawingBrush) {
      editorRef.current.freeDrawingBrush.color = color;
      editorRef.current.freeDrawingBrush.width = 2;
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full border border-gray-300" />

      {/* Toolbar UI */}
      <div className="absolute top-2 left-2 bg-white p-3 rounded shadow-lg flex gap-2">
        <button onClick={addHighlight} className="p-2 bg-yellow-400 text-black rounded">Highlight</button>
        <button onClick={addUnderline} className="p-2 bg-blue-400 text-white rounded">Underline</button>
        <button onClick={addComment} className="p-2 bg-green-400 text-white rounded">Comment</button>
        <button onClick={enableSignatureMode} className="p-2 bg-gray-500 text-white rounded">Sign</button>

        {/* Color Picker */}
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          className="w-10 h-10 ml-2 cursor-pointer border-none"
        />
      </div>
    </div>
  );
}
