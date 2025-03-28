import React, { useEffect, useState } from "react";
import { useDodgeball } from "@/lib/stores/useDodgeball";
import { useGame } from "@/lib/stores/useGame";
import { cn } from "@/lib/utils";

// Game over screen component
const GameOverScreen: React.FC = () => {
  const { score } = useDodgeball();
  const { restart } = useGame();
  const [highScore, setHighScore] = useState<number>(0);
  const [previousScores, setPreviousScores] = useState<number[]>([]);
  
  // Load high score and previous scores from localStorage
  useEffect(() => {
    try {
      // Get high score
      const savedHighScore = localStorage.getItem('dodgeball_high_score');
      if (savedHighScore) {
        setHighScore(parseInt(savedHighScore));
      }
      
      // Get previous scores
      const savedScores = localStorage.getItem('dodgeball_scores');
      if (savedScores) {
        setPreviousScores(JSON.parse(savedScores));
      }
    } catch (e) {
      console.error("Error loading scores from localStorage:", e);
    }
  }, [score]); // Re-run when score changes
  
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
          
          {/* High Score */}
          {highScore > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-300">High Score:</p>
              <p className="text-2xl font-bold text-green-400">{highScore}</p>
            </div>
          )}
        </div>
        
        {/* Previous Scores */}
        {previousScores.length > 0 && (
          <div className="w-full mb-4 bg-slate-700 rounded-lg p-3">
            <p className="text-sm text-gray-300 mb-2">Recent Scores:</p>
            <div className="flex justify-center flex-wrap gap-2">
              {previousScores.map((prevScore, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "px-3 py-1 rounded",
                    prevScore === score ? "bg-yellow-600" : "bg-slate-600"
                  )}
                >
                  <span className="text-white">{prevScore}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-gray-300 mb-6">
          {
            score < 50 ? "Keep practicing!" :
            score < 100 ? "Good job!" :
            score < 200 ? "Amazing skills!" :
            "You're a dodgeball master!"
          }
        </p>
        
        {/* Obstacle Types Information */}
        <div className="w-full mb-4 bg-slate-700 rounded-lg p-3 text-left text-sm">
          <p className="text-center text-gray-300 mb-2 font-medium">Obstacle Types:</p>
          <ul className="space-y-1 text-gray-300">
            <li>• <span className="text-blue-400">Blue:</span> Normal obstacle</li>
            <li>• <span className="text-orange-400">Orange:</span> Wide obstacle (harder to avoid)</li>
            <li>• <span className="text-green-400">Green:</span> Moving obstacle (shifts horizontally)</li>
          </ul>
        </div>
        
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
