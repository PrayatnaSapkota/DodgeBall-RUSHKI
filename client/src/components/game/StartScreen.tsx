import React, { useEffect } from "react";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { cn } from "@/lib/utils";

// Game start screen component
const StartScreen: React.FC = () => {
  const { start } = useGame();
  const { backgroundMusic, toggleMute, isMuted } = useAudio();
  
  // Set up keyboard listeners to start game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        start();
        
        // Start background music when game starts
        if (backgroundMusic && !backgroundMusic.paused) {
          backgroundMusic.currentTime = 0;
        } else if (backgroundMusic) {
          backgroundMusic.play().catch(err => {
            console.warn("Couldn't play audio automatically:", err);
          });
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [start, backgroundMusic]);

  // Handle click to start
  const handleStart = () => {
    start();
    
    // Start background music when game starts
    if (backgroundMusic) {
      backgroundMusic.play().catch(err => {
        console.warn("Couldn't play audio automatically:", err);
      });
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <div className={cn(
        "bg-card p-8 rounded-xl shadow-lg",
        "flex flex-col items-center justify-center",
        "text-center max-w-md w-full mx-4"
      )}>
        <h1 className="text-4xl font-bold text-primary mb-2">DodgeBall RASHKI</h1>
        <p className="text-muted-foreground mb-8">Dodge the falling sticks to survive!</p>
        
        <div className="space-y-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Controls</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-end">
                <span className="mr-2">Left:</span>
                <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded">←</span>
                <span className="mx-1">or</span>
                <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded">A</span>
              </div>
              <div className="flex items-center justify-start">
                <span className="mr-2">Right:</span>
                <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded">→</span>
                <span className="mx-1">or</span>
                <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded">D</span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-1">Objective</h2>
            <p className="text-sm text-muted-foreground">
              Avoid falling obstacles for as long as possible.
              <br />
              Score +10 points for each obstacle you dodge!
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={handleStart}
            className={cn(
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "py-3 px-6 rounded-lg font-medium text-lg flex-1",
              "transition-colors duration-200 ease-in-out"
            )}
          >
            Start Game
          </button>
          
          <button
            onClick={toggleMute}
            className={cn(
              "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
              "py-2 px-4 rounded-lg font-medium",
              "transition-colors duration-200 ease-in-out"
            )}
          >
            {isMuted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
        </div>
        
        <p className="mt-6 text-xs text-muted-foreground">
          Press SPACE or ENTER to start
        </p>
      </div>
    </div>
  );
};

export default StartScreen;
