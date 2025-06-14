
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Sparkles, Search, Zap, CheckCircle } from "lucide-react";

interface ProcessingAnimationProps {
  isLoading: boolean;
  progress: number;
  processingStage: string;
}

const ProcessingAnimation = ({ isLoading, progress, processingStage }: ProcessingAnimationProps) => {
  if (!isLoading) return null;

  const getStageIcon = () => {
    if (progress < 25) return <Search className="h-4 w-4 text-blue-500" />;
    if (progress < 50) return <Sparkles className="h-4 w-4 text-purple-500" />;
    if (progress < 75) return <Zap className="h-4 w-4 text-yellow-500" />;
    if (progress < 100) return <Sparkles className="h-4 w-4 text-green-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              {getStageIcon()}
            </div>
            <span className="text-sm font-medium text-slate-700">{processingStage}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">{progress}%</span>
          </div>
        </div>
        
        <div className="relative">
          <Progress 
            value={progress} 
            className="h-3 bg-white/50 border border-white/20"
          />
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 w-4 h-full bg-white/30 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingAnimation;
