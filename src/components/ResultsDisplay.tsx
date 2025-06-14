
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy } from "lucide-react";
import StatisticsCards from './StatisticsCards';

interface ResultsDisplayProps {
  result: {
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
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>
          Watermark removal completed successfully
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        <StatisticsCards stats={result.stats} />

        {/* Detected Watermarks */}
        {result.stats.detectedWatermarks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Detected Watermarks</h3>
            <div className="flex flex-wrap gap-2">
              {result.stats.detectedWatermarks.map((watermark, index) => (
                <Badge key={index} variant="secondary" className="text-xs transition-all duration-200 hover:scale-105">
                  {watermark.name} ({watermark.count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Cleaned Text */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Cleaned Text</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopyToClipboard(result.cleaned)}
              className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <pre className="whitespace-pre-wrap text-sm">
              {result.cleaned}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
