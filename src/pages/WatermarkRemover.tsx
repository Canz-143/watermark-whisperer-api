
import React, { useState } from 'react';
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import ProcessingAnimation from '@/components/ProcessingAnimation';
import ResultsDisplay from '@/components/ResultsDisplay';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ApiDocumentation from '@/components/ApiDocumentation';
import AuthForm from '@/components/AuthForm';
import AuthUserBar from '@/components/AuthUserBar';
import GuestUsageStatus from '@/components/GuestUsageStatus';
import WatermarkInputSection from '@/components/WatermarkInputSection';
import { useAuthAndCredits } from '@/hooks/useAuthAndCredits';
import { useGuestUsage } from '@/hooks/useGuestUsage';

const WatermarkRemover = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const navigate = useNavigate();

  const { user, credits, setCredits, isAdmin, isGuest, checkAuthAndCredits, handleSignOut } = useAuthAndCredits();
  const { guestUsage, setGuestUsage, guestUsageLoading, guestUsageError, checkGuestUsage } = useGuestUsage(user);

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
      if (user) {
        // Authenticated user flow
        if (!isAdmin && credits < 10) {
          toast.error('Insufficient credits. You need at least 10 credits to remove watermarks.');
          navigate('/dashboard');
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        const useCreditsResponse = await fetch('https://gmsbosytllfouwzujros.supabase.co/functions/v1/use-credits', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credits_to_use: 10,
            api_endpoint: '/api/remove-watermarks',
            request_data: { text: inputText.substring(0, 100) + '...' },
            response_data: null
          }),
        });

        const creditsData = await useCreditsResponse.json();
        
        if (!useCreditsResponse.ok) {
          throw new Error(creditsData.error || 'Failed to use credits');
        }

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
          setCredits(creditsData.remaining_credits);
          
          await fetch('https://gmsbosytllfouwzujros.supabase.co/functions/v1/use-credits', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              credits_to_use: 0,
              api_endpoint: '/api/remove-watermarks',
              request_data: { text: inputText.substring(0, 100) + '...' },
              response_data: { 
                success: true, 
                charactersRemoved: data.stats.charactersRemoved,
                cleanedLength: data.stats.cleanedLength 
              }
            }),
          });

          if (isAdmin) {
            toast.success(`Successfully processed! Removed ${data.stats.charactersRemoved} watermark characters (Admin - No credits used)`);
          } else {
            toast.success(`Successfully processed! Removed ${data.stats.charactersRemoved} watermark characters. ${creditsData.remaining_credits} credits remaining.`);
          }
        } else {
          toast.error(data.error || 'Failed to process text');
        }
      } else {
        // Guest user flow
        console.log('Processing as guest user...');
        const response = await fetch('https://gmsbosytllfouwzujros.supabase.co/functions/v1/use-guest-credit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: inputText }),
        });

        console.log('Guest processing response status:', response.status);
        const data = await response.json();
        console.log('Guest processing data:', data);
        
        if (response.ok && data.success) {
          setResult(data);
          setGuestUsage(prev => ({
            ...prev,
            remaining_uses: data.remaining_uses,
            used_today: data.used_today
          }));

          toast.success(`Successfully processed! Removed ${data.stats.charactersRemoved} watermark characters. ${data.remaining_uses} free uses remaining today.`);
          
          if (data.remaining_uses === 0) {
            toast.info('Free uses exhausted! Sign up to continue using the service.');
          }
        } else {
          console.error('Guest processing failed:', data);
          toast.error(data.error || 'Failed to process text');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to process request');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProcessingStage('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleAuthSuccess = () => {
    setShowAuthForm(false);
    checkAuthAndCredits();
  };

  const handleSignOutWithGuestCheck = async () => {
    await handleSignOut();
    checkGuestUsage();
    toast.success('Signed out successfully');
  };

  const canUseService = user ? (isAdmin || credits >= 10) : (guestUsage?.can_use || false);

  if (showAuthForm) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgb(2,8,23),rgba(2,8,23,0.6))] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      
      <AuthUserBar
        user={user}
        credits={credits}
        isAdmin={isAdmin}
        guestUsage={guestUsage}
        guestUsageError={guestUsageError}
        onSignOut={handleSignOutWithGuestCheck}
        onShowAuthForm={() => setShowAuthForm(true)}
      />
      
      <div className="relative z-10 max-w-5xl mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center py-12 space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered Text Cleaning</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-gray-100 dark:via-blue-300 dark:to-gray-100 bg-clip-text text-transparent leading-tight">
            Watermark Remover
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Remove hidden watermark characters from AI-generated text with advanced detection algorithms
          </p>
          {!user && (
            <GuestUsageStatus
              guestUsageLoading={guestUsageLoading}
              guestUsageError={guestUsageError}
              guestUsage={guestUsage}
            />
          )}
        </div>

        <WatermarkInputSection
          inputText={inputText}
          setInputText={setInputText}
          isLoading={isLoading}
          progress={progress}
          processingStage={processingStage}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
          canUseService={canUseService}
          user={user}
          isAdmin={isAdmin}
          credits={credits}
          guestUsage={guestUsage}
          onRemoveWatermarks={handleRemoveWatermarks}
          onShowAuthForm={() => setShowAuthForm(true)}
        />

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
