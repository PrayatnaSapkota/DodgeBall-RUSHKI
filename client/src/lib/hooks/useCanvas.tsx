import { useState, useEffect, RefObject } from "react";

interface CanvasHookReturn {
  ctx: CanvasRenderingContext2D | null;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Custom hook to access canvas context and dimensions
 */
export function useCanvas(canvasRef: RefObject<HTMLCanvasElement>): CanvasHookReturn {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas context
    const context = canvas.getContext("2d");
    setCtx(context);
    
    // Get initial dimensions
    setDimensions({
      width: canvas.width,
      height: canvas.height
    });

    // Handle resize (if needed)
    const handleResize = () => {
      if (!canvas) return;
      
      // Maintain the original canvas size ratio when container size changes
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      
      // Only update if there's a significant change to avoid performance issues
      const sizeChanged = canvas.width !== displayWidth || canvas.height !== displayHeight;
      if (sizeChanged) {
        // Update canvas dimensions and set state
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        setDimensions({
          width: displayWidth,
          height: displayHeight
        });
      }
    };

    // Set initial size
    handleResize();
    
    // Add resize listener
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef]);

  return {
    ctx,
    canvasWidth: dimensions.width,
    canvasHeight: dimensions.height
  };
}
