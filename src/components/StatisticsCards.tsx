
import React, { useEffect, useState } from 'react';
import { FileText, Scissors, Target, Award } from 'lucide-react';

interface StatisticsCardsProps {
  stats: {
    originalLength: number;
    cleanedLength: number;
    charactersRemoved: number;
    detectedWatermarks: Array<{ name: string; count: number }>;
  };
}

const StatisticsCards = ({ stats }: StatisticsCardsProps) => {
  const [animatedStats, setAnimatedStats] = useState({
    originalLength: 0,
    cleanedLength: 0,
    charactersRemoved: 0,
    detectedWatermarks: 0
  });

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats({
        originalLength: Math.floor(stats.originalLength * easeOutQuart),
        cleanedLength: Math.floor(stats.cleanedLength * easeOutQuart),
        charactersRemoved: Math.floor(stats.charactersRemoved * easeOutQuart),
        detectedWatermarks: Math.floor(stats.detectedWatermarks.length * easeOutQuart)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats({
          originalLength: stats.originalLength,
          cleanedLength: stats.cleanedLength,
          charactersRemoved: stats.charactersRemoved,
          detectedWatermarks: stats.detectedWatermarks.length
        });
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats]);

  const cards = [
    {
      title: 'Original Length',
      value: animatedStats.originalLength,
      icon: FileText,
      color: 'blue',
      bgColor: 'from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700'
    },
    {
      title: 'Cleaned Length',
      value: animatedStats.cleanedLength,
      icon: Target,
      color: 'green',
      bgColor: 'from-green-50 to-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-700'
    },
    {
      title: 'Characters Removed',
      value: animatedStats.charactersRemoved,
      icon: Scissors,
      color: 'red',
      bgColor: 'from-red-50 to-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-700'
    },
    {
      title: 'Watermark Types',
      value: animatedStats.detectedWatermarks,
      icon: Award,
      color: 'purple',
      bgColor: 'from-purple-50 to-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-700'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={`relative overflow-hidden bg-gradient-to-br ${card.bgColor} border border-white/50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 bg-white/70 rounded-lg ${card.iconColor} group-hover:scale-110 transition-transform duration-200`}>
              <card.icon className="h-4 w-4" />
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
          </div>
          
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${card.textColor} tabular-nums`}>
              {card.value.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              {card.title}
            </div>
          </div>

          {/* Animated background decoration */}
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-white/10 rounded-full blur-xl" />
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
