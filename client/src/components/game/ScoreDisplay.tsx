import React, { useEffect, useState } from "react";
import { useDodgeball } from "@/lib/stores/useDodgeball";
import { cn } from "@/lib/utils";

// Score display component
const ScoreDisplay: React.FC = () => {
  const { score } = useDodgeball();
  const [isScoreIncreased, setIsScoreIncreased] = useState(false);
  
  // Flash animation when score increases
  useEffect(() => {
    if (score > 0) {
      setIsScoreIncreased(true);
      const timer = setTimeout(() => setIsScoreIncreased(false), 300);
      return () => clearTimeout(timer);
    }
  }, [score]);
  
  return (
    <div className="absolute top-4 left-0 right-0 z-10 flex justify-center">
      <div className={cn(
        "bg-black/70 text-white px-6 py-3 rounded-full",
        "border-2 border-blue-500 shadow-lg",
        "flex items-center justify-center",
        "transition-all duration-300",
        isScoreIncreased && "scale-110 border-green-500"
      )}>
        <span className="mr-2 font-medium">Score:</span>
        <span className={cn(
          "text-xl font-bold",
          isScoreIncreased ? "text-green-400" : "text-blue-400"
        )}>
          {score}
        </span>
      </div>
    </div>
  );
};

export default ScoreDisplay;
