import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useCanvas } from "../hooks/useCanvas";
import { CanvasToolbar } from "../components/canvas/CanvasToolbar";
import { FrameShapeUtil } from "../components/canvas/VideoCanvasComponent";
import { VideoGenerationManager } from "../components/canvas/VideoGenerationManager";
import { ArrowActionMenu } from "../components/canvas/ArrowActionMenu";
const customShapeUtils = [FrameShapeUtil];


export default function Canvas() {
  const { handleMount, handleImport, handleClear, editorRef } = useCanvas();

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw 
        onMount={handleMount} 
        shapeUtils={customShapeUtils}
        persistenceKey="hack-western-canvas-v3"
      >
        <VideoGenerationManager />
        <ArrowActionMenu />
      </Tldraw>
      <CanvasToolbar
        onClear={handleClear}
        onImport={handleImport}
        editorRef={editorRef}
      />
    </div>
  );
}
