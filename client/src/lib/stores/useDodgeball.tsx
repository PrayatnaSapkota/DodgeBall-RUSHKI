import { create } from "zustand";

// Define obstacle interface
interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
}

interface DodgeballState {
  // Ball properties
  ballPosition: number;
  ballRadius: number;
  ballSpeed: number;
  setBallPosition: (position: number) => void;
  
  // Obstacle properties
  obstacles: Obstacle[];
  obstacleSpeed: number;
  obstacleSpawnRate: number;
  setObstacles: (obstacles: Obstacle[]) => void;
  increaseObstacleSpeed: () => void;
  increaseSpawnRate: () => void;
  
  // Game state
  score: number;
  setScore: (score: number) => void;
  
  // Reset game
  resetGame: () => void;
}

// Calculate default initial position (center of standard canvas width)
const DEFAULT_BALL_POSITION = 400; // Half of the 800px canvas width

export const useDodgeball = create<DodgeballState>((set) => ({
  // Ball properties
  ballPosition: DEFAULT_BALL_POSITION,
  ballRadius: 20,
  ballSpeed: 8,
  setBallPosition: (position) => set({ ballPosition: position }),
  
  // Obstacle properties
  obstacles: [],
  obstacleSpeed: 5,
  obstacleSpawnRate: 1500, // 1.5 seconds between new obstacles
  setObstacles: (obstacles) => set({ obstacles }),
  
  // Increase difficulty functions
  increaseObstacleSpeed: () => set((state) => ({ 
    obstacleSpeed: state.obstacleSpeed + 0.5 
  })),
  
  increaseSpawnRate: () => set((state) => ({ 
    obstacleSpawnRate: Math.max(500, state.obstacleSpawnRate - 100) 
  })),
  
  // Game state
  score: 0,
  setScore: (score) => set({ score }),
  
  // Reset game function
  resetGame: () => set({
    ballPosition: DEFAULT_BALL_POSITION,
    obstacles: [],
    obstacleSpeed: 5,
    obstacleSpawnRate: 1500,
    score: 0
  })
}));
