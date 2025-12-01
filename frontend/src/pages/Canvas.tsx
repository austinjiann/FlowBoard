import { Tldraw, Editor, DefaultQuickActions, DefaultQuickActionsContent, TldrawUiMenuItem } from "tldraw";
import { useState } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { CanvasToolbar } from "../components/canvas/CanvasToolbar";
import { FrameShapeUtil } from "../components/canvas/VideoCanvasComponent";
import { VideoGenerationManager } from "../components/canvas/VideoGenerationManager";
import { ArrowActionMenu } from "../components/canvas/ArrowActionMenu";
import { CanvasNavigationMenu } from "../components/canvas/CanvasNavigationMenu";
import { FrameGraphProvider } from "../contexts/FrameGraphContext";
import { FrameGraphInitializer } from "../components/canvas/FrameGraphInitializer";
import "tldraw/tldraw.css";

const customShapeUtils = [FrameShapeUtil];

export default function Canvas() {
  const { handleMount, handleClear, editorRef } = useCanvas();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [hideUi, setHideUi] = useState(false);

  const handleEditorMount = (editorInstance: Editor) => {
    setEditor(editorInstance);
    handleMount(editorInstance);
  };

  return (
    <FrameGraphProvider editor={editor}>
      <div style={{ position: "fixed", inset: 0 }}>
        <Tldraw
          onMount={handleEditorMount}
          shapeUtils={customShapeUtils}
          persistenceKey="hack-western-canvas-v3"
          hideUi={hideUi}
          components={{
            OnTheCanvas: () => (
              <>
                <ArrowActionMenu />
              </>
            ),
            InFrontOfTheCanvas: () => (
              <>
                <VideoGenerationManager />
                <FrameGraphInitializer />
              </>
            ),
            QuickActions: () => (
              <DefaultQuickActions >
                <TldrawUiMenuItem id="profile" icon="github" onSelect={() => {open("https://github.com/austinjiann/flowboard")}} />
                <DefaultQuickActionsContent />
              </DefaultQuickActions>
            )
          }}
        ></Tldraw>
        <CanvasToolbar onClear={handleClear} editorRef={editorRef} />
        <CanvasNavigationMenu setHideUi={setHideUi} /> 
      </div>
    </FrameGraphProvider>
  );
}
