import React from "react";
import { useDodgeball } from "@/lib/stores/useDodgeball";
import { useGame } from "@/lib/stores/useGame";
import { cn } from "@/lib/utils";

// Game over screen component
const GameOverScreen: React.FC = () => {
  const { score } = useDodgeball();
  const { restart } = useGame();
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <div className={cn(
        "bg-slate-800 p-8 rounded-xl shadow-lg",
        "flex flex-col items-center justify-center",
        "text-center max-w-md w-full mx-4",
        "border-2 border-red-600"
      )}>
        <h1 className="text-4xl font-bold text-red-500 mb-4">GAME OVER</h1>
        
        <div className="w-full py-4 mb-4">
          <p className="text-lg text-white mb-2">Final Score:</p>
          <p className="text-5xl font-bold text-yellow-400">{score}</p>
        </div>
        
        <p className="text-gray-300 mb-6">
          {
            score < 50 ? "Keep practicing!" :
            score < 100 ? "Good job!" :
            score < 200 ? "Amazing skills!" :
            "You're a dodgeball master!"
          }
        </p>
        
        <button
          onClick={restart}
          className={cn(
            "bg-red-600 hover:bg-red-700 text-white",
            "py-3 px-6 rounded-lg font-medium text-lg",
            "transition-colors duration-200 ease-in-out"
          )}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
