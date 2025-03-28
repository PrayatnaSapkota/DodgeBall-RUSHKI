import GameCanvas from "./components/game/GameCanvas";
import GameOverScreen from "./components/game/GameOverScreen";
import StartScreen from "./components/game/StartScreen";
import ScoreDisplay from "./components/game/ScoreDisplay";
import AudioLoader from "./components/game/AudioLoader";
import { useGame } from "./lib/stores/useGame";
import "@fontsource/inter";

// Main App component for DodgeBall RASHKI game
function App() {
  const { phase } = useGame();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Audio controls */}
      <AudioLoader />
      
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
