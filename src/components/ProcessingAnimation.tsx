
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface ProcessingAnimationProps {
  isLoading: boolean;
  progress: number;
  processingStage: string;
}

const ProcessingAnimation = ({ isLoading, progress, processingStage }: ProcessingAnimationProps) => {
  if (!isLoading) return null;

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{processingStage}</span>
        <span className="text-gray-600">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default ProcessingAnimation;
