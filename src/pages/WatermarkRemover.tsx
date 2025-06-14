import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, FileText, Zap, Loader } from "lucide-react";
import { toast } from "sonner";

const WatermarkRemover = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');

  const simulateProgress = () => {
    setProgress(0);
    setProcessingStage('Analyzing text...');
    
    const stages = [
      { progress: 20, stage: 'Analyzing text...' },
      { progress: 45, stage: 'Detecting watermarks...' },
      { progress: 70, stage: 'Removing characters...' },
      { progress: 90, stage: 'Finalizing results...' },
      { progress: 100, stage: 'Complete!' }
    ];

    stages.forEach((stage, index) => {
      setTimeout(() => {
        setProgress(stage.progress);
        setProcessingStage(stage.stage);
      }, index * 800);
    });
  };

  const handleRemoveWatermarks = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to process');
      return;
    }

    setIsLoading(true);
    simulateProgress();
    
    try {
      const response = await fetch('https://watermark-whisperer-api.vercel.app/api/remove-watermarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        toast.success(`Successfully removed ${data.stats.charactersRemoved} watermark characters!`);
      } else {
        toast.error(data.error || 'Failed to process text');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to connect to API');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProcessingStage('');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const addSampleWatermarks = () => {
    const sampleText = "This is a sample text with hidden watermarks.";
    // Add some invisible watermark characters
    const watermarkedText = sampleText.replace(/\s/g, '\u200B \u202F');
    setInputText(watermarkedText);
    toast.info('Added sample text with watermarks');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ChatGPT Watermark Remover
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Remove hidden watermark characters from ChatGPT-generated text. 
            Our API detects and removes 14 different types of watermark characters.
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Input Text
            </CardTitle>
            <CardDescription>
              Paste your text below to remove hidden watermarks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`transition-all duration-300 ${isLoading ? 'animate-pulse ring-2 ring-blue-300' : ''}`}>
              <Textarea
                placeholder="Paste your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[150px] resize-none transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            
            {/* Progress Bar */}
            {isLoading && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{processingStage}</span>
                  <span className="text-gray-600">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleRemoveWatermarks} 
                disabled={isLoading}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  isLoading ? 'animate-pulse' : 'hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {isLoading ? 'Processing...' : 'Remove Watermarks'}
              </Button>
              <Button 
                variant="outline" 
                onClick={addSampleWatermarks}
                disabled={isLoading}
                className="transition-all duration-200 hover:scale-105"
              >
                Add Sample Text
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading Skeleton for Results */}
        {isLoading && !result && (
          <Card className="animate-fade-in">
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statistics Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Skeleton className="h-8 w-12 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>
              
              {/* Badges Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-20" />
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Text Result Skeleton */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {result && !isLoading && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                Watermark removal completed successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.stats.originalLength}
                  </div>
                  <div className="text-sm text-gray-600">Original Length</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg transition-all duration-200 hover:scale-105">
                  <div className="text-2xl font-bold text-green-600">
                    {result.stats.cleanedLength}
                  </div>
                  <div className="text-sm text-gray-600">Cleaned Length</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg transition-all duration-200 hover:scale-105">
                  <div className="text-2xl font-bold text-red-600">
                    {result.stats.charactersRemoved}
                  </div>
                  <div className="text-sm text-gray-600">Removed</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg transition-all duration-200 hover:scale-105">
                  <div className="text-2xl font-bold text-purple-600">
                    {result.stats.detectedWatermarks.length}
                  </div>
                  <div className="text-sm text-gray-600">Types Found</div>
                </div>
              </div>

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
                    onClick={() => copyToClipboard(result.cleaned)}
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
        )}

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Use this API programmatically in your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Endpoint</h4>
                <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                  POST https://watermark-whisperer-api.vercel.app/api/remove-watermarks
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Request Body</h4>
                <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto">
{`{
  "text": "Your text with watermarks here"
}`}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Response</h4>
                <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto">
{`{
  "success": true,
  "original": "original text",
  "cleaned": "cleaned text",
  "stats": {
    "originalLength": 100,
    "cleanedLength": 95,
    "charactersRemoved": 5,
    "watermarksDetected": true,
    "detectedWatermarks": [...]
  }
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WatermarkRemover;
