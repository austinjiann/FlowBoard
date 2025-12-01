import {
  Tldraw,
  Editor,
  DefaultQuickActions,
  DefaultQuickActionsContent,
} from "tldraw";
import { useState } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { CanvasToolbar } from "../components/canvas/CanvasToolbar";
import { FrameShapeUtil } from "../components/canvas/VideoCanvasComponent";
import { VideoGenerationManager } from "../components/canvas/VideoGenerationManager";
import { ArrowActionMenu } from "../components/canvas/ArrowActionMenu";
import { CanvasNavigationMenu } from "../components/canvas/CanvasNavigationMenu";
import { FrameGraphProvider } from "../contexts/FrameGraphContext";
import { FrameGraphInitializer } from "../components/canvas/FrameGraphInitializer";
//import { GitHubStars } from "../components/GitHubStars";
import "tldraw/tldraw.css";

const GitHubButton = () => {
  return (
    <button
      onClick={() =>
        window.open("https://github.com/austinjiann/flowboard", "_blank")
      }
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
      style={{ width: "100%" }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
      {
        //<GitHubStars repo="austinjiann/flowboard" />
      }
    </button>
  );
};

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
              <DefaultQuickActions>
                <GitHubButton />
                <DefaultQuickActionsContent />
              </DefaultQuickActions>
            ),
          }}
        ></Tldraw>
        <CanvasToolbar onClear={handleClear} editorRef={editorRef} />
        <CanvasNavigationMenu setHideUi={setHideUi} />
      </div>
    </FrameGraphProvider>
  );
}
