# PDF Editor

## 📌 Project Overview
This project is a **PDF editor** built with **React, TypeScript, Next.js, and Fabric.js**. It allows users to upload PDFs, annotate them with highlights, underlines, comments, and signatures, and export the annotated PDF.

---

## 🚀 Setup and Running Instructions

### Prerequisites
Make sure you have **Node.js (v16 or later)** and **npm/yarn** installed.

### 1️⃣ Clone the repository
```sh
git clone
cd pdf-editor
```

### 2️⃣ Install dependencies
```sh
yarn install  # or npm install
```

### 3️⃣ Run the development server
```sh
yarn dev  # or npm run dev
```

The application will be available at **http://localhost:3000**.

### 4️⃣ Build for production
```sh
yarn build && yarn start  # or npm run build && npm start
```

---

## 🛠️ Libraries & Tools Used

### 📜 PDF Handling
```sh
react-pdf          # Rendering PDFs in React
pdfjs-dist         # Handles PDF rendering internally
```

### 🎨 Annotation & Drawing
```sh
fabric.js          # Enables annotations (highlights, underlines, signatures)
```

### 💾 File Handling
```sh
react-dropzone     # Drag-and-drop PDF file uploads
```

### 🖼 Exporting PDF
```sh
html2canvas       # Captures annotations as an image
jspdf             # Converts annotations into a PDF file
```

### 🎬 Animations & UI
```sh
framer-motion    # Smooth animations and transitions
tailwindcss      # Utility-first styling framework
```

---

## ⚠️ Challenges & Solutions

### 1️⃣ **Annotations Not Updating Properly**
**Issue**: The Fabric.js canvas was not updating when new annotations were added.
```ts
canvas.renderAll(); // Ensure the canvas updates
```

### 2️⃣ **PDF Export Not Capturing Annotations**
**Issue**: `html2canvas` was not capturing annotations correctly.
```ts
const canvas = await html2canvas(element, {
  scale: 2, // Higher quality
  useCORS: true, // Fix cross-origin issues
  backgroundColor: "#ffffff"
});
```

### 3️⃣ **Signature Tool Not Working**
**Issue**: The signature tool was not drawing on the PDF.
```ts
canvas.isDrawingMode = true;
canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
canvas.freeDrawingBrush.color = "#000000";
canvas.freeDrawingBrush.width = 2;
```

### 4️⃣ **Mobile Responsiveness**
**Issue**: The canvas was not resizing properly on mobile.
```ts
window.addEventListener("resize", () => {
  canvas.setDimensions({
    width: pdfContainerRef.current.offsetWidth,
    height: pdfContainerRef.current.offsetHeight
  });
  canvas.renderAll();
});
```

---

## ✨ Features to Add with More Time

```sh
- Multi-page annotation support  # Allow users to annotate multiple pages
- Undo/Redo functionality        # Let users revert annotation actions
- Save and reload annotations    # Store annotations for later
- Collaborative annotation       # Multi-user real-time annotation
```

---

