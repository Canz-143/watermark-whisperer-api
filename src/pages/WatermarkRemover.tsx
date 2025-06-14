
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Zap, Loader } from "lucide-react";
import { toast } from "sonner";
import ProcessingAnimation from '@/components/ProcessingAnimation';
import ResultsDisplay from '@/components/ResultsDisplay';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ApiDocumentation from '@/components/ApiDocumentation';

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
            
            <ProcessingAnimation 
              isLoading={isLoading}
              progress={progress}
              processingStage={processingStage}
            />
            
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
        {isLoading && !result && <LoadingSkeleton />}

        {/* Results Section */}
        {result && !isLoading && (
          <ResultsDisplay 
            result={result} 
            onCopyToClipboard={copyToClipboard}
          />
        )}

        {/* API Documentation */}
        <ApiDocumentation />
      </div>
    </div>
  );
};

export default WatermarkRemover;
