import { useState, useEffect, useRef, RefObject } from "react";

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
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 }); // Default values
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only run this effect once to prevent repeated dimension updates
    if (initializedRef.current) return;
    
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

    // Setup resize handler with debounce
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!canvas) return;
        
        // Only update if canvas size has significantly changed
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        // Prevent resizing that would cause constant updates
        if (Math.abs(displayWidth - dimensions.width) > 5 || 
            Math.abs(displayHeight - dimensions.height) > 5) {
          canvas.width = displayWidth;
          canvas.height = displayHeight;
          setDimensions({
            width: displayWidth,
            height: displayHeight
          });
        }
      }, 100); // 100ms debounce
    };

    // Set initial size
    const initialSize = () => {
      if (!canvas) return;
      // Keep the explicitly set dimensions if they're valid
      if (canvas.width > 0 && canvas.height > 0) {
        setDimensions({
          width: canvas.width,
          height: canvas.height
        });
      }
    };
    
    initialSize();
    initializedRef.current = true;
    
    // Add resize listener
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [canvasRef]); // Only depend on canvasRef

  return {
    ctx,
    canvasWidth: dimensions.width,
    canvasHeight: dimensions.height
  };
}
