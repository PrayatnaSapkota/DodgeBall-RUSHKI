import React, { useEffect, useRef } from "react";
import { useCanvas } from "@/lib/hooks/useCanvas";
import { useGame } from "@/lib/stores/useGame";
import { useDodgeball } from "@/lib/stores/useDodgeball";
import { useAudio } from "@/lib/stores/useAudio";

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
  
  // Set up keyboard listeners for ball movement
  useEffect(() => {
    if (phase !== "playing") return;
    
    const keysPressed = {} as Record<string, boolean>;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.code] = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    // Update position at a fixed interval
    const moveBall = () => {
      const { ballPosition, ballRadius, ballSpeed, setBallPosition } = useDodgeball.getState();
      
      const isLeftPressed = keysPressed["ArrowLeft"] || keysPressed["KeyA"];
      const isRightPressed = keysPressed["ArrowRight"] || keysPressed["KeyD"];
      
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
    
    const moveInterval = setInterval(moveBall, 16); // ~60fps
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearInterval(moveInterval);
    };
  }, [phase, canvasWidth]);
  
  // Create new obstacles periodically
  useEffect(() => {
    if (phase !== "playing") return;
    
    const { obstacleSpawnRate, obstacles, setObstacles } = useDodgeball.getState();
    
    const spawnObstacle = () => {
      if (useGame.getState().phase !== "playing") return;
      
      // Generate random width between 30 and 100
      const width = Math.floor(Math.random() * 70) + 30;
      
      // Generate random x position (ensuring obstacle is fully on screen)
      const x = Math.floor(Math.random() * (canvasWidth - width));
      
      // Create new obstacle
      const newObstacle = {
        x,
        y: 0, // Start at the top
        width,
        height: 20, // Fixed height
        passed: false // Track if player has dodged this obstacle
      };
      
      const currentObstacles = useDodgeball.getState().obstacles;
      setObstacles([...currentObstacles, newObstacle]);
    };
    
    // Set up obstacle spawning interval
    const spawnInterval = setInterval(spawnObstacle, obstacleSpawnRate);
    
    // Clear the interval on cleanup
    return () => clearInterval(spawnInterval);
  }, [phase, canvasWidth]);

  // Game main loop - rendering and collision detection
  useEffect(() => {
    if (!ctx) return;
    
    console.log('GameCanvas - Game phase:', phase);
    
    // Handle game elements update and collision detection
    let lastUpdateTime = 0;
    const updateInterval = 1000 / 60; // 60 FPS
    
    // Animation loop
    const animate = (timestamp: number) => {
      // Control update rate for physics
      if (timestamp - lastUpdateTime >= updateInterval && phase === "playing") {
        lastUpdateTime = timestamp;
        
        // Get the latest state values
        const { 
          ballPosition, 
          ballRadius, 
          obstacles, 
          setObstacles, 
          obstacleSpeed,
          score,
          setScore,
          increaseObstacleSpeed,
          increaseSpawnRate
        } = useDodgeball.getState();
        
        // Update obstacle positions and check for collisions
        const ballY = canvasHeight - ballRadius - 10;
        
        if (phase === "playing") {
          const updatedObstacles = obstacles.map(obstacle => {
            // Move obstacle down
            const updatedY = obstacle.y + obstacleSpeed;
            
            // Check for collisions with the ball
            if (
              !obstacle.passed &&
              updatedY + obstacle.height >= ballY - ballRadius &&
              updatedY <= ballY + ballRadius &&
              obstacle.x <= ballPosition + ballRadius &&
              obstacle.x + obstacle.width >= ballPosition - ballRadius
            ) {
              // Collision detected
              useAudio.getState().playHit();
              useGame.getState().end(); // Game over
            }
            
            // Check if the obstacle has been successfully dodged
            if (
              !obstacle.passed && 
              updatedY > ballY + ballRadius
            ) {
              // Obstacle successfully dodged
              useAudio.getState().playSuccess();
              
              // Increase score
              const newScore = score + 10;
              setScore(newScore);
              
              // Check if we need to increase difficulty
              if (newScore > 0 && newScore % 50 === 0) {
                increaseObstacleSpeed();
                increaseSpawnRate();
              }
              
              return { ...obstacle, passed: true };
            }
            
            return { ...obstacle, y: updatedY };
          });
          
          // Remove obstacles that are off screen
          const filteredObstacles = updatedObstacles.filter(
            obstacle => obstacle.y < canvasHeight + 50
          );
          
          // Update obstacles state
          if (JSON.stringify(filteredObstacles) !== JSON.stringify(obstacles)) {
            setObstacles(filteredObstacles);
          }
        }
      }
      
      // Drawing - happens every frame regardless of physics update rate
      // Clear the canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw background (dark gradient)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, "#121212");
      gradient.addColorStop(1, "#303030");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // If game is in playing phase, draw game elements
      if (phase === "playing") {
        // Get latest state for drawing
        const { ballPosition, ballRadius, obstacles } = useDodgeball.getState();
        const yPosition = canvasHeight - ballRadius - 10;
        
        // Draw the ball
        ctx.beginPath();
        ctx.arc(ballPosition, yPosition, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#FF4D4D"; // Red ball
        ctx.fill();
        ctx.strokeStyle = "#000000"; // Black outline
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Draw obstacles
        obstacles.forEach(obstacle => {
          ctx.fillStyle = "#4D79FF"; // Blue sticks
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          
          // Add a border
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2;
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
      }
      
      // Request next frame
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => cancelAnimationFrame(animationId);
  }, [ctx, canvasWidth, canvasHeight, phase]);
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800} 
        height={600}
        className="max-w-full max-h-full border-2 border-gray-800 rounded-lg shadow-lg"
      />
    </div>
  );
};

export default GameCanvas;
