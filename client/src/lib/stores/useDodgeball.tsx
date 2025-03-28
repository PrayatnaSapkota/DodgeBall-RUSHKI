import { create } from "zustand";

// Define obstacle interface
export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
  type?: "normal" | "wide" | "moving"; // Different obstacle types
  moveDirection?: number; // For moving obstacles
  moveSpeed?: number; // For moving obstacles
}

// Define power-up interface
export interface PowerUp {
  x: number;
  y: number;
  type: "slowTime" | "shield" | "extraLife";
  radius: number;
  collected: boolean;
}

// Game settings
const DIFFICULTY_LEVELS = {
  easy: { speedIncrease: 0.2, spawnRateDecrease: 50, obstacleBaseSpeed: 3 },
  medium: { speedIncrease: 0.3, spawnRateDecrease: 75, obstacleBaseSpeed: 4 },
  hard: { speedIncrease: 0.5, spawnRateDecrease: 100, obstacleBaseSpeed: 5 }
};

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
  obstacleCount: number; // Number of obstacles to spawn at once
  setObstacles: (obstacles: Obstacle[]) => void;
  increaseObstacleSpeed: () => void;
  increaseSpawnRate: () => void;
  increaseObstacleCount: () => void;
  
  // Power-up properties
  powerUps: PowerUp[];
  setPowerUps: (powerUps: PowerUp[]) => void;
  activeSlowTime: boolean;
  activateSlowTime: () => void;
  activeShield: boolean;
  activateShield: () => void;
  extraLives: number;
  addExtraLife: () => void;
  useExtraLife: () => boolean; // Returns true if life was available
  
  // Game state
  score: number;
  setScore: (score: number) => void;
  difficultyLevel: "easy" | "medium" | "hard";
  setDifficultyLevel: (level: "easy" | "medium" | "hard") => void;
  
  // Reset game
  resetGame: () => void;
}

// Calculate default initial position (center of standard canvas width)
const DEFAULT_BALL_POSITION = 400; // Half of the 800px canvas width

export const useDodgeball = create<DodgeballState>((set, get) => ({
  // Ball properties
  ballPosition: DEFAULT_BALL_POSITION,
  ballRadius: 20,
  ballSpeed: 8,
  setBallPosition: (position) => set({ ballPosition: position }),
  
  // Obstacle properties
  obstacles: [],
  obstacleSpeed: 4, // Start a bit slower
  obstacleSpawnRate: 1800, // 1.8 seconds between new obstacles
  obstacleCount: 1, // Start with single obstacles
  setObstacles: (obstacles: Obstacle[]) => set({ obstacles }),
  
  // Increase difficulty functions with more gradual scaling
  increaseObstacleSpeed: () => set((state) => {
    const { difficultyLevel } = state;
    const settings = DIFFICULTY_LEVELS[difficultyLevel];
    
    // More gradual speed increase
    const speedIncrease = state.score > 1000 
      ? settings.speedIncrease / 2 // Slow down increases after 1000 points
      : settings.speedIncrease;
    
    return { 
      obstacleSpeed: state.obstacleSpeed + speedIncrease 
    };
  }),
  
  increaseSpawnRate: () => set((state) => {
    const { difficultyLevel } = state;
    const settings = DIFFICULTY_LEVELS[difficultyLevel];
    
    // More gradual spawn rate decrease with a higher minimum (slower spawn)
    const decrease = state.score > 1000 
      ? settings.spawnRateDecrease / 2 
      : settings.spawnRateDecrease;
    
    return { 
      obstacleSpawnRate: Math.max(800, state.obstacleSpawnRate - decrease) 
    };
  }),
  
  increaseObstacleCount: () => set((state) => {
    // Only increase obstacle count at higher scores and cap at 3
    if (state.score >= 500 && state.obstacleCount < 3) {
      return { obstacleCount: state.obstacleCount + 1 };
    }
    return {};
  }),
  
  // Power-up properties
  powerUps: [],
  setPowerUps: (powerUps: PowerUp[]) => set({ powerUps }),
  activeSlowTime: false,
  activateSlowTime: () => {
    set({ activeSlowTime: true });
    
    // Slow time effect lasts for 5 seconds
    setTimeout(() => {
      set({ activeSlowTime: false });
    }, 5000);
  },
  activeShield: false,
  activateShield: () => {
    set({ activeShield: true });
    
    // Shield effect lasts for 10 seconds
    setTimeout(() => {
      set({ activeShield: false });
    }, 10000);
  },
  extraLives: 0,
  addExtraLife: () => set((state) => ({ extraLives: Math.min(3, state.extraLives + 1) })),
  useExtraLife: () => {
    const currentLives = get().extraLives;
    if (currentLives > 0) {
      set({ extraLives: currentLives - 1 });
      return true;
    }
    return false;
  },
  
  // Game state
  score: 0,
  setScore: (score) => set({ score }),
  difficultyLevel: "medium", // Default difficulty
  setDifficultyLevel: (level) => set({ difficultyLevel: level }),
  
  // Reset game function
  resetGame: () => {
    const difficulty = get().difficultyLevel;
    const settings = DIFFICULTY_LEVELS[difficulty];
    
    set({
      ballPosition: DEFAULT_BALL_POSITION,
      obstacles: [],
      powerUps: [],
      obstacleSpeed: settings.obstacleBaseSpeed,
      obstacleSpawnRate: 1800,
      obstacleCount: 1,
      score: 0,
      activeSlowTime: false,
      activeShield: false,
      extraLives: 0
    });
  }
}));
