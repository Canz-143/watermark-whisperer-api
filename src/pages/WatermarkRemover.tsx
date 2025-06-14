
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Zap, Loader, Upload, Sparkles } from "lucide-react";
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
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputText]);

  const simulateProgress = () => {
    setProgress(0);
    setProcessingStage('Analyzing text...');
    
    const stages = [
      { progress: 20, stage: 'Analyzing text structure...' },
      { progress: 45, stage: 'Detecting watermark patterns...' },
      { progress: 70, stage: 'Removing hidden characters...' },
      { progress: 90, stage: 'Optimizing cleaned text...' },
      { progress: 100, stage: 'Processing complete!' }
    ];

    stages.forEach((stage, index) => {
      setTimeout(() => {
        setProgress(stage.progress);
        setProcessingStage(stage.stage);
      }, index * 600);
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
    const sampleText = "This is a sample text with hidden watermarks that will be detected and removed by our AI-powered system.";
    const watermarkedText = sampleText.replace(/\s/g, '\u200B \u202F');
    setInputText(watermarkedText);
    toast.info('Added sample text with watermarks');
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  const characterCount = inputText.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center py-12 space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">AI-Powered Text Cleaning</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent leading-tight">
            Watermark Remover
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Remove hidden watermark characters from AI-generated text with advanced detection algorithms
          </p>
        </div>

        {/* Enhanced Input Section */}
        <Card className="group bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              Input Text
            </CardTitle>
            <CardDescription className="text-slate-600">
              Paste your text below to detect and remove hidden watermarks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Paste your text here..."
                value={inputText}
                onChange={handleInputChange}
                className={`min-h-[120px] max-h-[200px] resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                } ${isTyping ? 'ring-2 ring-blue-200' : ''}`}
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-400 bg-white/90 px-2 py-1 rounded">
                {characterCount} characters
              </div>
            </div>
            
            <ProcessingAnimation 
              isLoading={isLoading}
              progress={progress}
              processingStage={processingStage}
            />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleRemoveWatermarks} 
                disabled={isLoading || !inputText.trim()}
                className={`flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isLoading ? 'animate-pulse' : 'hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Clean Text
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={addSampleWatermarks}
                disabled={isLoading}
                className="h-12 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Try Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && !result && <LoadingSkeleton />}

        {/* Enhanced Results Section */}
        {result && !isLoading && (
          <div className="animate-fade-in">
            <ResultsDisplay 
              result={result} 
              onCopyToClipboard={copyToClipboard}
            />
          </div>
        )}

        {/* Enhanced API Documentation */}
        <div className="animate-fade-in">
          <ApiDocumentation />
        </div>
      </div>
    </div>
  );
};

export default WatermarkRemover;
