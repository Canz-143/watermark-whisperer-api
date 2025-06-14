
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, CheckCircle, TrendingUp } from "lucide-react";
import StatisticsCards from './StatisticsCards';

interface ResultsDisplayProps {
  result: {
    original: string;
    cleaned: string;
    stats: {
      originalLength: number;
      cleanedLength: number;
      charactersRemoved: number;
      detectedWatermarks: Array<{ name: string; count: number }>;
    };
  };
  onCopyToClipboard: (text: string) => void;
}

const ResultsDisplay = ({ result, onCopyToClipboard }: ResultsDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const handleCopy = (text: string) => {
    onCopyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const improvementPercentage = Math.round(
    (result.stats.charactersRemoved / result.stats.originalLength) * 100
  );

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Processing Complete!</h3>
            <p className="text-sm text-green-700">
              Successfully cleaned your text and removed {result.stats.charactersRemoved} watermark characters
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-bold">{improvementPercentage}% cleaner</span>
          </div>
        </div>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-800">Cleaning Results</CardTitle>
          <CardDescription>
            Detailed analysis and cleaned output
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enhanced Statistics */}
          <StatisticsCards stats={result.stats} />

          {/* Detected Watermarks */}
          {result.stats.detectedWatermarks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                Detected Watermark Types
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {result.stats.detectedWatermarks.length}
                </Badge>
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.stats.detectedWatermarks.map((watermark, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-white/50 border-slate-200 hover:bg-slate-50 transition-all duration-200 hover:scale-105"
                  >
                    {watermark.name} 
                    <span className="ml-1 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                      {watermark.count}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-slate-200" />

          {/* Text Comparison Toggle */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Cleaned Text</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                className="border-slate-200 hover:bg-slate-50"
              >
                {showComparison ? 'Hide' : 'Show'} Comparison
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(result.cleaned)}
                className={`border-slate-200 hover:bg-slate-50 transition-all duration-200 ${
                  copied ? 'bg-green-50 border-green-200 text-green-700' : ''
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Text Display */}
          {showComparison ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-600">Original Text</h4>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                    {result.original}
                  </pre>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-600">Cleaned Text</h4>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                    {result.cleaned}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                {result.cleaned}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDisplay;
