import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useCanvas } from "../hooks/useCanvas";
import { CanvasToolbar } from "../components/canvas/CanvasToolbar";
import { FrameShapeUtil } from "../components/canvas/VideoCanvasComponent";
import { VideoGenerationManager } from "../components/canvas/VideoGenerationManager";
import { ArrowActionMenu } from "../components/canvas/ArrowActionMenu";
import { useMemo } from "react";

const customShapeUtils = [FrameShapeUtil];


export default function Canvas() {
  const { handleMount, handleClear, editorRef } = useCanvas();

  const overrides = useMemo(() => {
    return {
      actions(_editor: any, actions: any) {
        // Intercept eraser tool activation
        const originalEraser = actions['toggle-tool-eraser']
        actions['toggle-tool-eraser'] = {
          ...originalEraser,
          onSelect() {
            // Switch to draw tool with white color instead
            _editor.setCurrentTool('draw')
            _editor.setStyleForNextShapes('color', 'white')
            _editor.setStyleForNextShapes('size', 'm')
          }
        }
        return actions
      }
    }
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw 
        onMount={handleMount} 
        shapeUtils={customShapeUtils}
        persistenceKey="hack-western-canvas-v3"
        overrides={overrides}
        components={{
          OnTheCanvas: () => (
            <>
              <ArrowActionMenu />
            </>
          ),
          InFrontOfTheCanvas: () => (
            <>
              <VideoGenerationManager />
            </>
          ),
        }}
      >
      </Tldraw>
      <CanvasToolbar
        onClear={handleClear}
        editorRef={editorRef}
      />
    </div>
  );
}
