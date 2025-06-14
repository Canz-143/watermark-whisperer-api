
import React from 'react';

interface StatisticsCardsProps {
  stats: {
    originalLength: number;
    cleanedLength: number;
    charactersRemoved: number;
    detectedWatermarks: Array<{ name: string; count: number }>;
  };
}

const StatisticsCards = ({ stats }: StatisticsCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105">
        <div className="text-2xl font-bold text-blue-600">
          {stats.originalLength}
        </div>
        <div className="text-sm text-gray-600">Original Length</div>
      </div>
      <div className="text-center p-4 bg-green-50 rounded-lg transition-all duration-200 hover:scale-105">
        <div className="text-2xl font-bold text-green-600">
          {stats.cleanedLength}
        </div>
        <div className="text-sm text-gray-600">Cleaned Length</div>
      </div>
      <div className="text-center p-4 bg-red-50 rounded-lg transition-all duration-200 hover:scale-105">
        <div className="text-2xl font-bold text-red-600">
          {stats.charactersRemoved}
        </div>
        <div className="text-sm text-gray-600">Removed</div>
      </div>
      <div className="text-center p-4 bg-purple-50 rounded-lg transition-all duration-200 hover:scale-105">
        <div className="text-2xl font-bold text-purple-600">
          {stats.detectedWatermarks.length}
        </div>
        <div className="text-sm text-gray-600">Types Found</div>
      </div>
    </div>
  );
};

export default StatisticsCards;
