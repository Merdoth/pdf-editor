/* eslint-disable */


import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

type Color = "yellow" | "green" | "blue" | "pink" | "red";

interface Comment {
  id: string;
  text: string;
  left: number;
  top: number;
}

export default function AnnotationCanvas({ 
  editorRef, 
  pdfContainerRef 
}: { 
  editorRef: React.RefObject<fabric.Canvas | null>;
  pdfContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [activeTool, setActiveTool] = useState<"select" | "highlight" | "underline" | "comment" | "signature">("select");
  const [activeColor, setActiveColor] = useState<Color>("yellow");
  const [isDrawing, setIsDrawing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (!canvasRef.current || !pdfContainerRef.current) return;
    
    // Create fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: pdfContainerRef.current.clientWidth,
      height: pdfContainerRef.current.clientHeight
    });
    
    editorRef.current = canvas;
    
    // Position canvas absolutely within PDF container
    const canvasElement = canvas.getElement();
    canvasElement.style.position = 'absolute';
    canvasElement.style.top = '0';
    canvasElement.style.left = '0';
    canvasElement.style.pointerEvents = 'none';
    
    // Make sure canvas wrapper has the right positioning
    const canvasWrapper = canvasElement.parentElement as HTMLElement;
    if (canvasWrapper) {
      canvasWrapper.style.position = 'absolute';
      canvasWrapper.style.top = '0';
      canvasWrapper.style.left = '0';
      canvasWrapper.style.width = '100%';
      canvasWrapper.style.height = '100%';
      canvasWrapper.style.zIndex = '10';

    }
    
    // Add canvas to PDF container
    if (pdfContainerRef.current) {
      // Make sure PDF container has position relative for proper positioning context
      pdfContainerRef.current.style.position = 'relative';
      pdfContainerRef.current.style.overflow = 'hidden';
    }
    
    // Handle window resize
    const handleResize = () => {
      if (!pdfContainerRef.current) return;
      
      canvas.setDimensions({
        width: pdfContainerRef.current.clientWidth,
        height: pdfContainerRef.current.clientHeight
      });
      canvas.renderAll();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle mouse events
  useEffect(() => {
    if (!editorRef.current || !pdfContainerRef.current) return;
    
    const canvas = editorRef.current;
    const pdfContainer = pdfContainerRef.current;
    
    // Create a transparent overlay div for capturing events
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '20';
    overlay.style.cursor = activeTool === 'select' ? 'default' : 'crosshair';
    
    pdfContainer.appendChild(overlay);
    
    const handleMouseDown = (e: MouseEvent) => {
      if (activeTool === "select") {
        // Enable object selection on canvas
        canvas.selection = true;
        canvas.getObjects().forEach(obj => obj.selectable = true);
        return;
      } else {
        // Disable object selection
        canvas.selection = false;
        canvas.getObjects().forEach(obj => obj.selectable = false);
      }
      
      // Get coordinates relative to the overlay
      const rect = overlay.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Special case for comments
      if (activeTool === "comment") {
        const id = `comment-${Date.now()}`;
        setComments(prev => [...prev, {id, text: "", left: x, top: y}]);
        setActiveComment(id);
        return;
      }
      
      setIsDrawing(true);
      
      // Start drawing highlight or underline
      if (activeTool === "highlight" || activeTool === "underline") {
        const rect = new fabric.Rect({
          left: x,
          top: y,
          width: 0,
          height: activeTool === "highlight" ? 20 : 2,
          fill: getColorHex(activeColor),
          opacity: activeTool === "highlight" ? 0.3 : 1,
          selectable: true,
          originX: 'left',
          originY: 'top',
        });
        
        canvas.add(rect);
        canvas.setActiveObject(rect);
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing || activeTool === "select" || activeTool === "comment") return;
      
      // Get coordinates relative to the overlay
      const rect = overlay.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      const activeObj = canvas.getActiveObject() as fabric.Rect;
      if (activeObj && (activeTool === "highlight" || activeTool === "underline")) {
        const newWidth = x - activeObj.left!;
        activeObj.set({width: Math.max(newWidth, 5)});
        canvas.renderAll();
      }
    };
    
    const handleMouseUp = () => {
      setIsDrawing(false);
      
      // Re-enable selection after drawing
      if (activeTool !== "select") {
        setTimeout(() => {
          canvas.selection = true;
          canvas.getObjects().forEach(obj => obj.selectable = true);
        }, 100);
      }
    };
    
    overlay.addEventListener("mousedown", handleMouseDown);
    overlay.addEventListener("mousemove", handleMouseMove);
    overlay.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      overlay.removeEventListener("mousedown", handleMouseDown);
      overlay.removeEventListener("mousemove", handleMouseMove);
      overlay.removeEventListener("mouseup", handleMouseUp);
      if (pdfContainer.contains(overlay)) {
        pdfContainer.removeChild(overlay);
      }
    };
  }, [activeTool, activeColor, isDrawing]);

  // Handle touch events for mobile
  useEffect(() => {
    if (!editorRef.current || !pdfContainerRef.current) return;
    
    const canvas = editorRef.current;
    const pdfContainer = pdfContainerRef.current;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (activeTool === "select") return;
      
      // Prevent scrolling while annotating
      e.preventDefault();
      
      const touch = e.touches[0];
      const rect = pdfContainer.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      if (activeTool === "comment") {
        const id = `comment-${Date.now()}`;
        setComments(prev => [...prev, {id, text: "", left: x, top: y}]);
        setActiveComment(id);
        return;
      }
      
      setIsDrawing(true);
      
      // Start drawing highlight or underline
      if (activeTool === "highlight" || activeTool === "underline") {
        const rect = new fabric.Rect({
          left: x,
          top: y,
          width: 0,
          height: activeTool === "highlight" ? 20 : 2,
          fill: getColorHex(activeColor),
          opacity: activeTool === "highlight" ? 0.3 : 1,
          selectable: true,
          originX: 'left',
          originY: 'top',
        });
        
        canvas.add(rect);
        canvas.setActiveObject(rect);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawing || activeTool === "select" || activeTool === "comment") return;
      
      // Prevent scrolling while annotating
      e.preventDefault();
      
      const touch = e.touches[0];
      const rect = pdfContainer.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      
      const activeObj = canvas.getActiveObject() as fabric.Rect;
      if (activeObj && (activeTool === "highlight" || activeTool === "underline")) {
        const newWidth = x - activeObj.left!;
        activeObj.set({width: Math.max(newWidth, 5)});
        canvas.renderAll();
      }
    };
    
    const handleTouchEnd = () => {
      setIsDrawing(false);
    };
    
    pdfContainer.addEventListener("touchstart", handleTouchStart, { passive: false });
    pdfContainer.addEventListener("touchmove", handleTouchMove, { passive: false });
    pdfContainer.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      pdfContainer.removeEventListener("touchstart", handleTouchStart);
      pdfContainer.removeEventListener("touchmove", handleTouchMove);
      pdfContainer.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeTool, activeColor, isDrawing, pdfContainerRef, editorRef]);

  // Convert color name to hex
  const getColorHex = (color: Color): string => {
    switch (color) {
      case "yellow": return "#FFD700";
      case "green": return "#00FF00";
      case "blue": return "#0000FF";
      case "pink": return "#FFC0CB";
      case "red": return "#FF0000";
      default: return "#FFD700";
    }
  };

  // Save comment
  const saveComment = () => {
    if (!activeComment || !commentText.trim()) return;
    
    setComments(prev => prev.map(comment => 
      comment.id === activeComment ? {...comment, text: commentText} : comment
    ));
    
    setActiveComment(null);
    setCommentText("");
  };

  // Clear all annotations
  const clearAnnotations = () => {
    if (!editorRef.current) return;
    editorRef.current.clear();
    setComments([]);
  };

  return (
    <>
      {/* PDF content would go here */}
      
      {/* Canvas for annotations */}
      <canvas ref={canvasRef} />
      
      {/* Annotation Toolbar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-amber-50 p-2 rounded-lg shadow-lg flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 z-50">
        <div className="flex space-x-2 justify-center">
          <button 
            onClick={() => setActiveTool("select")} 
            className={`p-2 rounded ${activeTool === "select" ? "bg-gray-300 text-black" : "bg-gray-200 text-gray-400"} hover:scale-85 cursor-pointer`}
            title="Select"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </button>
          
          <button 
            onClick={() => setActiveTool("highlight")} 
            className={`p-2 rounded ${activeTool === "highlight" ? "bg-gray-300 text-black" : "bg-gray-200 text-gray-400"} hover:scale-85 cursor-pointer`}
            title="Highlight"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          
          <button 
            onClick={() => setActiveTool("underline")} 
            className={`p-2 rounded ${activeTool === "underline" ? "bg-gray-300 text-black" : "bg-gray-200 text-gray-400"} hover:scale-85 cursor-pointer`}
            title="Underline"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19.5v-15A2.5 2.5 0 016.5 2h12A2.5 2.5 0 0121 4.5v15m-4 0h4m-4 0a2.5 2.5 0 01-2.5 2.5H6.5A2.5 2.5 0 014 19.5m11 0H6.5" />
            </svg>
          </button>
          
          <button 
            onClick={() => setActiveTool("comment")} 
            className={`p-2 rounded ${activeTool === "comment" ? "bg-gray-300 text-black" : "bg-gray-200 text-gray-400"} hover:scale-85 cursor-pointer`}
            title="Comment"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
          
          <button 
            onClick={() => setActiveTool("signature")} 
            className={`p-2 rounded ${activeTool === "signature" ? "bg-gray-300 text-black" : "bg-gray-200 text-gray-400"} hover:scale-85 cursor-pointer`}
            title="Signature"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          
          {/* Color selection */}
          <div className="flex space-x-2 justify-center items-center">
            {["yellow", "green", "blue", "pink", "red"].map((color) => (
              <button
                key={color}
                onClick={() => setActiveColor(color as Color)}
                className={`w-4 h-5 rounded-full ${activeColor === color ? 'ring-2 ring-offset-2 ring-black' : ''} hover:scale-85 cursor-pointer`}
                style={{ backgroundColor: getColorHex(color as Color) }}
                title={color.charAt(0).toUpperCase() + color.slice(1)}
              />
            ))}
          </div>
          
          <button 
            onClick={clearAnnotations} 
            className="p-2 rounded bg-red-500 text-white hover:bg-red-700 cursor-pointer hover:scale-85"
            title="Clear All"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        {/* Comment Modal */}
        {activeComment && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-amber-100 p-4 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg text-gray-500 font-bold mb-2">Add Comment</h3>
              <textarea
                className="w-full border rounded p-2 mb-4 h-32 text-gray-500"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter your comment here..."
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => {
                    setActiveComment(null);
                    setCommentText("");
                    setComments(prev => prev.filter(c => c.id !== activeComment));
                  }}
                  className="px-4 py-2 bg-gray-400 rounded cursor-pointer hover:scale-85"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveComment}
                  className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:scale-85"
                  disabled={!commentText.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Display Comments */}
        {comments.filter(comment => comment.text).map((comment) => (
          <div 
            key={comment.id}
            className="absolute bg-yellow-100 p-2 rounded shadow-md text-sm max-w-xs z-40"
            style={{ left: comment.left, top: comment.top }}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm text-gray-400">Comment</span>
              <button 
                onClick={() => setComments(prev => prev.filter(c => c.id !== comment.id))}
                className="text-gray-600 hover:text-red-500"
              >
                &times;
              </button>
            </div>
            <p className="text-sm font-normal text-gray-400">{comment.text}</p>
          </div>
        ))}
      </>
    );
  };
  