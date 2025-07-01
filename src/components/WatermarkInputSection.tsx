
import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Zap, Loader, Upload } from "lucide-react";
import ProcessingAnimation from '@/components/ProcessingAnimation';
import { toast } from "sonner";

interface WatermarkInputSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  isLoading: boolean;
  progress: number;
  processingStage: string;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  canUseService: boolean;
  user: any;
  isAdmin: boolean;
  credits: number;
  guestUsage: any;
  onRemoveWatermarks: () => void;
  onShowAuthForm: () => void;
}

const WatermarkInputSection = ({
  inputText,
  setInputText,
  isLoading,
  progress,
  processingStage,
  isTyping,
  setIsTyping,
  canUseService,
  user,
  isAdmin,
  credits,
  guestUsage,
  onRemoveWatermarks,
  onShowAuthForm
}: WatermarkInputSectionProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  const addSampleWatermarks = () => {
    const sampleText = "This is a sample text with hidden watermarks that will be detected and removed by our AI-powered system.";
    const watermarkedText = sampleText.replace(/\s/g, '\u200B \u202F');
    setInputText(watermarkedText);
    toast.info('Added sample text with watermarks');
  };

  const characterCount = inputText.length;

  return (
    <Card className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-gray-800 dark:text-gray-100">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          Input Text
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
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
            className={`min-h-[120px] max-h-[200px] resize-none border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 transition-all duration-200 bg-white dark:bg-gray-900 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            } ${isTyping ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded">
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
            onClick={onRemoveWatermarks} 
            disabled={isLoading || !inputText.trim() || !canUseService}
            className={`flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 ${
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
                {user ? (
                  `Clean Text ${!isAdmin ? `(${credits >= 10 ? '10 credits' : 'insufficient credits'})` : '(Admin)'}`
                ) : (
                  guestUsage?.can_use ? `Try Free (${guestUsage.remaining_uses} left)` : 'Free Limit Reached'
                )}
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={addSampleWatermarks}
            disabled={isLoading}
            className="h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload className="h-4 w-4 mr-2" />
            Try Sample
          </Button>
        </div>
        
        {!user && guestUsage && !guestUsage.can_use && (
          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-orange-800 dark:text-orange-200 text-sm text-center">
              You've used all {guestUsage.total_free_uses} free uses for today. 
              <Button 
                variant="link" 
                className="text-orange-800 dark:text-orange-200 underline p-0 ml-1"
                onClick={onShowAuthForm}
              >
                Sign up to continue
              </Button>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WatermarkInputSection;
