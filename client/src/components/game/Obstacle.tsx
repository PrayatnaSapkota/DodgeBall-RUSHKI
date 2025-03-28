import React, { useEffect } from "react";
import { useDodgeball } from "@/lib/stores/useDodgeball";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";

interface ObstacleProps {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
}

// Component to manage falling stick obstacles
const Obstacle: React.FC<ObstacleProps> = ({ ctx, canvasWidth, canvasHeight }) => {
  const { 
    obstacles, 
    setObstacles, 
    ballPosition, 
    ballRadius,
    score,
    setScore,
    obstacleSpeed,
    increaseObstacleSpeed,
    obstacleSpawnRate,
    increaseSpawnRate
  } = useDodgeball();
  
  const { playHit, playSuccess } = useAudio();
  const { end } = useGame();
  
  // Create new obstacles
  useEffect(() => {
    const spawnObstacle = () => {
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
      
      setObstacles(prev => [...prev, newObstacle]);
    };
    
    // Set up obstacle spawning interval
    const spawnInterval = setInterval(spawnObstacle, obstacleSpawnRate);
    
    // Clear the interval on cleanup
    return () => clearInterval(spawnInterval);
  }, [setObstacles, canvasWidth, obstacleSpawnRate]);
  
  // Update and draw obstacles
  useEffect(() => {
    if (!ctx) return;
    
    // Update obstacle positions
    const updatedObstacles = obstacles.map(obstacle => {
      // Move obstacle down
      const updatedY = obstacle.y + obstacleSpeed;
      
      // Calculate ball's y position (same as in Ball component)
      const ballY = canvasHeight - ballRadius - 10;
      
      // Check for collisions with the ball
      if (
        !obstacle.passed &&
        updatedY + obstacle.height >= ballY - ballRadius &&
        updatedY <= ballY + ballRadius &&
        obstacle.x <= ballPosition + ballRadius &&
        obstacle.x + obstacle.width >= ballPosition - ballRadius
      ) {
        // Collision detected
        playHit();
        end(); // Game over
      }
      
      // Check if the obstacle has been successfully dodged
      if (
        !obstacle.passed && 
        updatedY > ballY + ballRadius
      ) {
        // Obstacle successfully dodged
        playSuccess();
        setScore(score + 10);
        
        // Every 5 obstacles dodged, increase difficulty
        if (score > 0 && score % 50 === 0) {
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
    setObstacles(filteredObstacles);
    
    // Draw all obstacles
    filteredObstacles.forEach(obstacle => {
      ctx.fillStyle = "#4D79FF"; // Blue sticks
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Add a border
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
  }, [
    ctx, 
    obstacles, 
    setObstacles, 
    obstacleSpeed, 
    canvasHeight, 
    ballPosition, 
    ballRadius,
    playHit,
    playSuccess, 
    end,
    score,
    setScore,
    increaseObstacleSpeed,
    increaseSpawnRate
  ]);
  
  return null; // Canvas component, no JSX to return
};

export default Obstacle;
