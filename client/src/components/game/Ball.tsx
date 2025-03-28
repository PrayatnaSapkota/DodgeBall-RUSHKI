import React, { useRef, useEffect } from "react";
import { useDodgeball } from "@/lib/stores/useDodgeball";

interface BallProps {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
}

// The player-controlled ball component
const Ball: React.FC<BallProps> = ({ ctx, canvasWidth, canvasHeight }) => {
  const { ballPosition, setBallPosition, ballRadius, ballSpeed } = useDodgeball();
  const keysPressed = useRef<Record<string, boolean>>({});

  // Set up event listeners for key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Update ball position based on keyboard input
  useEffect(() => {
    const updatePosition = () => {
      const isLeftPressed = keysPressed.current["ArrowLeft"] || keysPressed.current["KeyA"];
      const isRightPressed = keysPressed.current["ArrowRight"] || keysPressed.current["KeyD"];
      
      let newPosition = ballPosition;
      
      if (isLeftPressed) {
        newPosition = Math.max(ballRadius, newPosition - ballSpeed);
      }
      
      if (isRightPressed) {
        newPosition = Math.min(canvasWidth - ballRadius, newPosition + ballSpeed);
      }
      
      if (newPosition !== ballPosition) {
        setBallPosition(newPosition);
      }
    };
    
    const animationId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationId);
  }, [ballPosition, setBallPosition, ballRadius, ballSpeed, canvasWidth]);

  // Draw the ball
  useEffect(() => {
    if (!ctx) return;
    
    // Calculate the y position (fixed at the bottom with a small margin)
    const yPosition = canvasHeight - ballRadius - 10;
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ballPosition, yPosition, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#FF4D4D"; // Red ball
    ctx.fill();
    ctx.strokeStyle = "#000000"; // Black outline
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    
  }, [ctx, ballPosition, ballRadius, canvasHeight]);

  return null; // This is a canvas component, so no JSX to return
};

export default Ball;
