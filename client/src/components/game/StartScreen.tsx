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
        "bg-card bg-slate-800 p-8 rounded-xl shadow-lg",
        "flex flex-col items-center justify-center",
        "text-center max-w-md w-full mx-4 border-2 border-blue-500"
      )}>
        <h1 className="text-4xl font-bold text-white mb-2">DodgeBall RASHKI</h1>
        <p className="text-gray-300 mb-8">Dodge the falling sticks to survive!</p>
        
        <div className="space-y-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Controls</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-white">
              <div className="flex items-center justify-end">
                <span className="mr-2">Left:</span>
                <span className="px-2 py-1 bg-blue-600 text-white rounded">←</span>
                <span className="mx-1">or</span>
                <span className="px-2 py-1 bg-blue-600 text-white rounded">A</span>
              </div>
              <div className="flex items-center justify-start">
                <span className="mr-2">Right:</span>
                <span className="px-2 py-1 bg-blue-600 text-white rounded">→</span>
                <span className="mx-1">or</span>
                <span className="px-2 py-1 bg-blue-600 text-white rounded">D</span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Objective</h2>
            <p className="text-sm text-gray-300">
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
              "bg-red-600 hover:bg-red-700 text-white",
              "py-3 px-6 rounded-lg font-medium text-lg flex-1",
              "transition-colors duration-200 ease-in-out"
            )}
          >
            Start Game
          </button>
          
          <button
            onClick={toggleMute}
            className={cn(
              "bg-blue-600 hover:bg-blue-700 text-white",
              "py-2 px-4 rounded-lg font-medium",
              "transition-colors duration-200 ease-in-out"
            )}
          >
            {isMuted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
        </div>
        
        <p className="mt-6 text-xs text-gray-300">
          Press SPACE or ENTER to start
        </p>
      </div>
    </div>
  );
};

export default StartScreen;
