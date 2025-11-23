import { Editor } from 'tldraw'

export const createCustomEraserOverride = () => {
  return {
    tools(editor: Editor, tools: any) {
      // Override the eraser tool to behave like a white pen
      tools.eraser = {
        ...tools.eraser,
        onPointerDown: (info: any) => {
          // Switch to draw tool with white color
          editor.setCurrentTool('draw')
          editor.setStyleForNextShapes('color', 'white')
          editor.setStyleForSelectedShapes('color', 'white')
          
          // Trigger the draw tool's pointer down
          const drawTool = editor.getCurrentTool()
          if (drawTool && 'onPointerDown' in drawTool) {
            (drawTool as any).onPointerDown(info)
          }
        },
        onPointerMove: (info: any) => {
          const drawTool = editor.getCurrentTool()
          if (drawTool && 'onPointerMove' in drawTool) {
            (drawTool as any).onPointerMove(info)
          }
        },
        onPointerUp: (info: any) => {
          const drawTool = editor.getCurrentTool()
          if (drawTool && 'onPointerUp' in drawTool) {
            (drawTool as any).onPointerUp(info)
          }
        },
      }
      return tools
    },
  }
}

