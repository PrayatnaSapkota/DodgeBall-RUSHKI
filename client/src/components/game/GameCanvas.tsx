import React, { useEffect, useRef } from "react";
import Ball from "./Ball";
import Obstacle from "./Obstacle";
import { useCanvas } from "@/lib/hooks/useCanvas";
import { useGame } from "@/lib/stores/useGame";
import { useDodgeball } from "@/lib/stores/useDodgeball";

// Main game canvas component
const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ctx, canvasWidth, canvasHeight } = useCanvas(canvasRef);
  const { phase } = useGame();
  const { resetGame } = useDodgeball();
  
  // Reset game when phase changes to "ready"
  useEffect(() => {
    if (phase === "ready") {
      resetGame();
    }
  }, [phase, resetGame]);
  
  // Clear canvas and draw background
  useEffect(() => {
    if (!ctx) return;
    
    // Animation loop
    const animate = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw background (dark gradient)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, "#121212");
      gradient.addColorStop(1, "#303030");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Request next frame
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => cancelAnimationFrame(animationId);
  }, [ctx, canvasWidth, canvasHeight]);
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800} 
        height={600}
        className="max-w-full max-h-full border-2 border-gray-800 rounded-lg shadow-lg"
      />
      
      {/* Only render game elements when the game is in playing phase */}
      {phase === "playing" && ctx && (
        <>
          <Ball ctx={ctx} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
          <Obstacle ctx={ctx} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
        </>
      )}
    </div>
  );
};

export default GameCanvas;
