import { useEffect } from "react";
import GameCanvas from "./components/game/GameCanvas";
import GameOverScreen from "./components/game/GameOverScreen";
import StartScreen from "./components/game/StartScreen";
import ScoreDisplay from "./components/game/ScoreDisplay";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import "@fontsource/inter";

// Main App component for DodgeBall RASHKI game
function App() {
  const { phase } = useGame();
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Load sound effects and background music
  useEffect(() => {
    try {
      // Set up audio elements
      const bgMusic = new Audio("/sounds/background.mp3");
      bgMusic.loop = true;
      bgMusic.volume = 0.3;
      
      const hitSfx = new Audio("/sounds/hit.mp3");
      const successSfx = new Audio("/sounds/success.mp3");
      
      // Store them in the global audio state
      setBackgroundMusic(bgMusic);
      setHitSound(hitSfx);
      setSuccessSound(successSfx);
      
      // Clean up on unmount
      return () => {
        bgMusic.pause();
        hitSfx.pause();
        successSfx.pause();
      };
    } catch (error) {
      console.error("Error loading audio:", error);
    }
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Score display appears during gameplay */}
      {phase === "playing" && <ScoreDisplay />}
      
      {/* Game canvas shows in playing phase */}
      <div className="relative w-full h-full">
        <GameCanvas />
        
        {/* Show start screen when game is ready to start */}
        {phase === "ready" && <StartScreen />}
        
        {/* Show game over screen when game has ended */}
        {phase === "ended" && <GameOverScreen />}
      </div>
    </div>
  );
}

export default App;
