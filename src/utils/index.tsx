import * as fabric from "fabric";

type Snowflake = {
  x: number;
  y: number;
  radius: number;
  speed: number;
};

export type Color = "yellow" | "green" | "blue" | "pink" | "red";

export interface Comment {
  id: string;
  text: string;
  left: number;
  top: number;
}

export const createSnowflakes = (
  count: number,
  snowflakes: Snowflake[],
  canvas: HTMLCanvasElement
) => {
  for (let i = 0; i < count; i++) {
    snowflakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 1,
    });
  }
};

export const drawSnowflakes = (
  ctx: CanvasRenderingContext2D,
  snowflakes: Snowflake[],
  canvas: HTMLCanvasElement,
  moveSnowflakes: () => void
) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fbbf24"; // Amber-400 color
  ctx.beginPath();

  snowflakes.forEach((flake) => {
    ctx.moveTo(flake.x, flake.y);
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
  });

  ctx.fill();
  moveSnowflakes();
};

export const handleLoadError = (error: Error) => {
  console.error("Error loading PDF:", error);
};

export const handleZoomIn = (
  setScale: React.Dispatch<React.SetStateAction<number>>
) => {
  setScale((prevScale) => Math.min(prevScale + 0.2, 2.5));
};

export const handleZoomOut = (
  setScale: React.Dispatch<React.SetStateAction<number>>
) => {
  setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
};

export const handlePageChange = (
  newPage: number,
  setCurrentPage: (page: number) => void,
  numPages: number
) => {
  if (newPage >= 1 && newPage <= numPages) {
    setCurrentPage(newPage);
  }
};

// Convert color name to hex
export const getColorHex = (color: Color): string => {
  const colorMap: Record<Color, string> = {
    yellow: "#FFD700",
    green: "#00FF00",
    blue: "#0000FF",
    pink: "#FFC0CB",
    red: "#FF0000",
  };

  return colorMap[color] || "#FFD700"; // Default to yellow if color is not found
};


export const handleTouchMove = (
  e: TouchEvent,
  activeTool: string,
  isDrawing: boolean,
  pdfContainer: HTMLDivElement,
  canvas: fabric.Canvas
) => {
  if (!isDrawing || activeTool === "select" || activeTool === "comment") return;

  // Prevent scrolling while annotating
  e.preventDefault();

  const touch = e.touches[0];
  const rect = pdfContainer.getBoundingClientRect();
  const x = touch.clientX - rect.left;

  const activeObj = canvas.getActiveObject() as fabric.Rect;
  if (activeObj && (activeTool === "highlight" || activeTool === "underline")) {
    const newWidth = x - activeObj.left!;
    activeObj.set({ width: Math.max(newWidth, 5) });
    canvas.renderAll();
  }
};

export const handleTouchStart = (
  e: TouchEvent,
  activeTool: string,
  activeColor: Color,
  setIsDrawing: (value: boolean) => void,
  setActiveComment: (value: string) => void,
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
  pdfContainer: HTMLDivElement,
  canvas: fabric.Canvas
) => {
  if (activeTool === "select") return;

  // Prevent scrolling while annotating
  e.preventDefault();

  const touch = e.touches[0];
  const rect = pdfContainer.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  if (activeTool === "comment") {
    const id = `comment-${Date.now()}`;
    setComments((prev) => [...prev, { id, text: "", left: x, top: y }]);
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
      originX: "left",
      originY: "top",
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
  }
};

 // Handle window resize
 export const handleResize = (pdfContainerRef: React.RefObject<HTMLDivElement | null>,
  canvas: fabric.Canvas) => {
  if (!pdfContainerRef.current) return;

  canvas.setDimensions({
    width: pdfContainerRef.current.clientWidth,
    height: pdfContainerRef.current.clientHeight,
  });
  canvas.renderAll();
};