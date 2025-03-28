import React, { useEffect, useRef, useState } from "react";
import { useCanvas } from "@/lib/hooks/useCanvas";
import { useGame } from "@/lib/stores/useGame";
import { useDodgeball, Obstacle, PowerUp } from "@/lib/stores/useDodgeball";
import { useAudio } from "@/lib/stores/useAudio";

// Main game canvas component
const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ctx, canvasWidth, canvasHeight } = useCanvas(canvasRef);
  const { phase } = useGame();
  const { resetGame } = useDodgeball();
  
  // useState hook for shield state updates
  const [shieldActive, setShieldActive] = useState<boolean>(false);
  
  // Reset game when phase changes to "ready"
  useEffect(() => {
    if (phase === "ready") {
      // Important: Clear all intervals and timers
      resetGame();
      
      // Reset shield state
      setShieldActive(false);
    }
  }, [phase, resetGame, setShieldActive]);
  
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
    
    // Get initial state values
    const { 
      obstacleSpawnRate, 
      obstacleCount, 
      obstacles, 
      setObstacles 
    } = useDodgeball.getState();
    
    const spawnObstacle = () => {
      if (useGame.getState().phase !== "playing") return;
      
      // Get the latest state values
      const { 
        obstacleCount: currentObstacleCount,
        activeSlowTime 
      } = useDodgeball.getState();
      
      // Create multiple obstacles based on obstacleCount
      const newObstacles: Obstacle[] = [];
      
      // Standardize how many obstacles can fit horizontally
      // Divide the canvas into equal sections for better distribution
      const maxPossibleObstacles = 4; // Allow max 4 normal obstacles side by side
      const sectionWidth = canvasWidth / maxPossibleObstacles;
      
      for (let i = 0; i < currentObstacleCount; i++) {
        // Determine obstacle type (10% chance for special obstacles after 300 points)
        const score = useDodgeball.getState().score;
        let obstacleType: "normal" | "wide" | "moving" = "normal";
        
        if (score > 300 && Math.random() < 0.1) {
          obstacleType = Math.random() < 0.5 ? "wide" : "moving";
        }
        
        // Set obstacle properties based on type - sizes are now relative to section width
        let width: number;
        if (obstacleType === "wide") {
          // Wide obstacles take up 1.5 to 2 sections
          width = Math.floor(Math.random() * (sectionWidth * 0.5)) + sectionWidth * 1.5;
        } else {
          // Normal and moving obstacles take 40-80% of a section
          width = Math.floor(Math.random() * (sectionWidth * 0.4)) + (sectionWidth * 0.4);
        }
        
        // Ensure obstacles don't overlap by using available sections
        let x: number = 0;
        let attempts = 0;
        const maxAttempts = 15;
        
        // Try to find a good position
        do {
          // Pick a random position that fits the obstacle
          x = Math.floor(Math.random() * (canvasWidth - width));
          attempts++;
        } while (
          attempts < maxAttempts && 
          newObstacles.some(obs => 
            // Check for overlap with existing obstacles
            (x < obs.x + obs.width && x + width > obs.x)
          )
        );
        
        // Create the obstacle
        const newObstacle: Obstacle = {
          x,
          y: 0, // Start at the top
          width,
          height: 20, // Fixed height
          passed: false, // Track if player has dodged this obstacle
          type: obstacleType
        };
        
        // Add movement properties for moving obstacles
        if (obstacleType === "moving") {
          newObstacle.moveDirection = Math.random() < 0.5 ? -1 : 1;
          newObstacle.moveSpeed = Math.random() * 2 + 1; // 1-3 pixels per frame
        }
        
        newObstacles.push(newObstacle);
      }
      
      const currentObstacles = useDodgeball.getState().obstacles;
      setObstacles([...currentObstacles, ...newObstacles]);
    };
    
    // Set up obstacle spawning interval
    const baseSpawnInterval = obstacleSpawnRate;
    const spawnInterval = setInterval(() => {
      // Check if slow time is active
      const { activeSlowTime } = useDodgeball.getState();
      // If slow time is active, decrease spawn frequency by spawning obstacles less often
      if (!activeSlowTime || Math.random() < 0.3) { // 30% chance to spawn during slow time
        spawnObstacle();
      }
    }, baseSpawnInterval);
    
    // Clear the interval on cleanup
    return () => clearInterval(spawnInterval);
  }, [phase, canvasWidth]);
  
  // Spawn power-ups periodically
  useEffect(() => {
    if (phase !== "playing") return;
    
    const { powerUps, setPowerUps } = useDodgeball.getState();
    
    const spawnPowerUp = () => {
      if (useGame.getState().phase !== "playing") return;
      
      // Only spawn power-ups if we don't have too many already (max 2 on screen)
      const activePowerUps = useDodgeball.getState().powerUps.filter(p => !p.collected);
      if (activePowerUps.length >= 2) return;
      
      // Get current score - only spawn power-ups after 200 points
      const score = useDodgeball.getState().score;
      if (score < 200) return;
      
      // Random power-up type
      const powerUpTypes: ("slowTime" | "shield" | "extraLife")[] = ["slowTime", "shield", "extraLife"];
      const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      
      // Random position, ensuring it's fully on screen
      const radius = 15;
      const x = Math.floor(Math.random() * (canvasWidth - radius * 2)) + radius;
      
      const newPowerUp: PowerUp = {
        x,
        y: 0,
        type,
        radius,
        collected: false
      };
      
      const currentPowerUps = useDodgeball.getState().powerUps;
      setPowerUps([...currentPowerUps, newPowerUp]);
    };
    
    // Set up power-up spawning interval (less frequent than obstacles)
    const spawnInterval = setInterval(spawnPowerUp, 10000); // Every 10 seconds
    
    // Clear the interval on cleanup
    return () => clearInterval(spawnInterval);
  }, [phase, canvasWidth]);

  // Game main loop - rendering and collision detection
  useEffect(() => {
    if (!ctx) return;
    
    console.log('GameCanvas - Game phase:', phase);
    
    // Handle game elements update and collision detection
    let lastUpdateTime = 0;
    const baseUpdateInterval = 1000 / 60; // 60 FPS
    
    // Clear all timers when phase changes to prevent bugs after restart
    if (phase !== "playing") {
      return;
    }
    
    // Set up animation frame tracking
    let animationFrameId = 0;
    
    // Animation loop
    const animate = (timestamp: number) => {
      // Get game state
      const { 
        activeSlowTime,
        activeShield,
        powerUps,
        setPowerUps
      } = useDodgeball.getState();
      
      // Modify update interval based on slow time effect
      const updateInterval = activeSlowTime ? baseUpdateInterval * 2 : baseUpdateInterval;
      
      // Physics and game logic update
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
          increaseSpawnRate,
          increaseObstacleCount,
          activateSlowTime,
          activateShield,
          addExtraLife,
          useExtraLife
        } = useDodgeball.getState();
        
        // Calculate ball position (same in all uses)
        const ballY = canvasHeight - ballRadius - 10;
        
        if (phase === "playing") {
          // Update power-ups positions and check for collisions
          const updatedPowerUps = powerUps.map(powerUp => {
            // Calculate movement speed (slower if slow time is active)
            const powerUpSpeed = activeSlowTime ? obstacleSpeed * 0.5 : obstacleSpeed;
            
            // Move power-up down
            const updatedY = powerUp.y + powerUpSpeed;
            
            // Check for collisions with the ball if not already collected
            if (
              !powerUp.collected &&
              Math.sqrt(
                Math.pow(ballPosition - powerUp.x, 2) + 
                Math.pow(ballY - updatedY, 2)
              ) < powerUp.radius + ballRadius
            ) {
              // Power-up collected!
              // Apply effects based on type
              switch (powerUp.type) {
                case "slowTime":
                  activateSlowTime();
                  useAudio.getState().playSuccess(); // Play success sound
                  break;
                case "shield":
                  activateShield();
                  useAudio.getState().playSuccess(); // Play success sound
                  break;
                case "extraLife":
                  addExtraLife();
                  useAudio.getState().playSuccess(); // Play success sound
                  break;
              }
              
              return { ...powerUp, collected: true };
            }
            
            return { ...powerUp, y: updatedY };
          });
          
          // Remove power-ups that are off screen or collected
          const filteredPowerUps = updatedPowerUps.filter(
            powerUp => !powerUp.collected && powerUp.y < canvasHeight + 50
          );
          
          // Update power-ups state
          if (JSON.stringify(filteredPowerUps) !== JSON.stringify(powerUps)) {
            setPowerUps(filteredPowerUps);
          }
          
          // Update obstacle positions and check for collisions
          const updatedObstacles = obstacles.map(obstacle => {
            // Calculate obstacle movement speed (slower if slow time is active)
            const currentObstacleSpeed = activeSlowTime ? obstacleSpeed * 0.5 : obstacleSpeed;
            
            // Move obstacle down
            let updatedY = obstacle.y + currentObstacleSpeed;
            
            // Handle horizontal movement for moving obstacles
            let updatedX = obstacle.x;
            if (obstacle.type === "moving" && obstacle.moveDirection && obstacle.moveSpeed) {
              // Move horizontally
              updatedX += obstacle.moveDirection * obstacle.moveSpeed * (activeSlowTime ? 0.5 : 1);
              
              // Reverse direction if hitting edge of screen
              let newMoveDirection = obstacle.moveDirection;
              if (updatedX <= 0 || updatedX + obstacle.width >= canvasWidth) {
                newMoveDirection *= -1;
              }
              
              obstacle = { ...obstacle, x: updatedX, moveDirection: newMoveDirection };
            }
            
            // Check for collisions with the ball
            if (
              !obstacle.passed &&
              updatedY + obstacle.height >= ballY - ballRadius &&
              updatedY <= ballY + ballRadius &&
              obstacle.x <= ballPosition + ballRadius &&
              obstacle.x + obstacle.width >= ballPosition - ballRadius
            ) {
              // Collision detected
              
              // Check if player has shield active
              if (activeShield) {
                // Shield blocks one hit, but is consumed
                useAudio.getState().playSuccess(); // Play success sound
                setShieldActive(false); // Update local state
                const dodgeballStore = useDodgeball.getState();
                dodgeballStore.activateShield(); // This will reset the timer and toggle off shield
                return { ...obstacle, passed: true }; // Mark as passed so it doesn't trigger collision again
              }
              
              // Check if player has an extra life
              if (useExtraLife()) {
                // Use an extra life but continue game
                useAudio.getState().playHit();
                return { ...obstacle, passed: true }; // Mark as passed
              }
              
              // No protection - game over
              useAudio.getState().playHit();
              useGame.getState().end();
            }
            
            // Check if the obstacle has been successfully dodged
            if (
              !obstacle.passed && 
              updatedY > ballY + ballRadius
            ) {
              // Obstacle successfully dodged
              
              // Increase score
              const newScore = score + 10;
              setScore(newScore);
              
              // Play success sound only at every 100 points to avoid sound frustration
              if (newScore % 100 === 0) {
                useAudio.getState().playSuccess();
              }
              
              // Check if we need to increase difficulty
              if (newScore > 0) {
                // Increase speed and spawn rate at regular intervals
                if (newScore % 50 === 0) {
                  increaseObstacleSpeed();
                  increaseSpawnRate();
                }
                
                // Increase obstacle count at specific score thresholds
                if (newScore === 500 || newScore === 1000) {
                  increaseObstacleCount();
                }
              }
              
              return { ...obstacle, passed: true };
            }
            
            return { ...obstacle, y: updatedY, x: updatedX };
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
      
      // Add attribution text (always visible)
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 0.3; // Semi-transparent
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      ctx.fillText("GAME BY Prayatna", canvasWidth - 10, canvasHeight - 25);
      ctx.fillText("Developed By Replit AI", canvasWidth - 10, canvasHeight - 10);
      ctx.globalAlpha = 1.0; // Reset transparency
      
      // If game is in playing phase, draw game elements
      if (phase === "playing") {
        // Get latest state for drawing
        const { 
          ballPosition, 
          ballRadius, 
          obstacles, 
          powerUps,
          activeSlowTime,
          activeShield,
          extraLives
        } = useDodgeball.getState();
        
        const yPosition = canvasHeight - ballRadius - 10;
        
        // Draw power-ups
        powerUps.forEach(powerUp => {
          if (powerUp.collected) return; // Skip collected power-ups
          
          let color;
          switch (powerUp.type) {
            case "slowTime":
              color = "#9966FF"; // Purple
              break;
            case "shield":
              color = "#66FFFF"; // Cyan
              break;
            case "extraLife":
              color = "#FF66FF"; // Pink
              break;
          }
          
          // Draw power-up circle
          ctx.beginPath();
          ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.closePath();
          
          // Draw icon or letter inside
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 14px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          let icon;
          switch (powerUp.type) {
            case "slowTime":
              icon = "T"; // Time
              break;
            case "shield":
              icon = "S"; // Shield
              break;
            case "extraLife":
              icon = "L"; // Life
              break;
          }
          
          ctx.fillText(icon, powerUp.x, powerUp.y);
        });
        
        // Draw obstacles with different colors based on type
        obstacles.forEach(obstacle => {
          // Pick color based on obstacle type
          switch(obstacle.type) {
            case "normal":
              ctx.fillStyle = "#4D79FF"; // Blue sticks
              break;
            case "wide":
              ctx.fillStyle = "#FF794D"; // Orange for wide obstacles
              break;
            case "moving":
              ctx.fillStyle = "#79FF4D"; // Green for moving obstacles
              break;
            default:
              ctx.fillStyle = "#4D79FF"; // Default blue
          }
          
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          
          // Add a border
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2;
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Draw the ball with effects
        ctx.beginPath();
        ctx.arc(ballPosition, yPosition, ballRadius, 0, Math.PI * 2);
        
        // Ball color (red, with effects if active)
        ctx.fillStyle = "#FF4D4D"; // Default red ball
        ctx.fill();
        
        // Draw shield effect if active
        if (activeShield) {
          ctx.beginPath();
          ctx.arc(ballPosition, yPosition, ballRadius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = "#66FFFF"; // Cyan shield
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.closePath();
        }
        
        // Draw slow time effect if active
        if (activeSlowTime) {
          ctx.beginPath();
          ctx.arc(ballPosition, yPosition, ballRadius + 10, 0, Math.PI * 2);
          ctx.strokeStyle = "#9966FF"; // Purple time effect
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]); // Dashed line
          ctx.stroke();
          ctx.setLineDash([]); // Reset dash
          ctx.closePath();
        }
        
        // Ball outline
        ctx.beginPath();
        ctx.arc(ballPosition, yPosition, ballRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "#000000"; // Black outline
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Draw extra lives indicators
        for (let i = 0; i < extraLives; i++) {
          const lifeX = 30 + (i * 25);
          const lifeY = 30;
          
          ctx.beginPath();
          ctx.arc(lifeX, lifeY, 10, 0, Math.PI * 2);
          ctx.fillStyle = "#FF4D4D"; // Red ball
          ctx.fill();
          ctx.strokeStyle = "#000000"; // Black outline
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.closePath();
        }
      }
      
      // Request next frame using the reference we defined
      if (phase === "playing") {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    // Start the animation loop
    animationFrameId = requestAnimationFrame(animate);
    
    // Cleanup function - important to prevent bugs on restart
    return () => {
      console.log('Cleaning up game animation frame');
      cancelAnimationFrame(animationFrameId);
    };
  }, [ctx, canvasWidth, canvasHeight, phase, setShieldActive]);
  
  // Fixed size canvas for all screen sizes
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-[800px]">
        {/* Maintain aspect ratio */}
        <div className="aspect-[4/3] w-full">
          <canvas
            ref={canvasRef}
            width={800} 
            height={600}
            className="absolute inset-0 w-full h-full border-2 border-gray-800 rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
