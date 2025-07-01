import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Zap, Loader, Upload, Sparkles, LogIn, User, Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import ProcessingAnimation from '@/components/ProcessingAnimation';
import ResultsDisplay from '@/components/ResultsDisplay';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ApiDocumentation from '@/components/ApiDocumentation';
import AuthForm from '@/components/AuthForm';

const WatermarkRemover = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [guestUsage, setGuestUsage] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestUsageLoading, setGuestUsageLoading] = useState(false);
  const [guestUsageError, setGuestUsageError] = useState(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // Check authentication and credits
  useEffect(() => {
    checkAuthAndCredits();
  }, []);

  // Check guest usage on component mount
  useEffect(() => {
    if (!user) {
      checkGuestUsage();
    }
  }, [user]);

  const checkAuthAndCredits = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      setIsGuest(false);
      await fetchCredits(session);
    } else {
      setIsGuest(true);
    }
  };

  const checkGuestUsage = async () => {
    setGuestUsageLoading(true);
    setGuestUsageError(null);
    
    try {
      console.log('Checking guest usage...');
      const response = await fetch('https://gmsbosytllfouwzujros.supabase.co/functions/v1/check-guest-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Guest usage response status:', response.status);
      const data = await response.json();
      console.log('Guest usage data:', data);

      if (response.ok) {
        setGuestUsage(data);
      } else {
        console.error('Guest usage error:', data);
        setGuestUsageError(data.error || 'Failed to check guest usage');
      }
    } catch (error) {
      console.error('Error checking guest usage:', error);
      setGuestUsageError('Network error while checking guest usage');
    } finally {
      setGuestUsageLoading(false);
    }
  };

  const fetchCredits = async (session) => {
    try {
      const response = await fetch('https://gmsbosytllfouwzujros.supabase.co/functions/v1/check-credits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCredits(data.credits);
        setIsAdmin(data.is_admin);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCredits(0);
    setIsAdmin(false);
    setIsGuest(true);
    checkGuestUsage();
    toast.success('Signed out successfully');
  };

  const characterCount = inputText.length;
  const canUseService = user ? (isAdmin || credits >= 10) : (guestUsage?.can_use || false);

  // Render guest usage status
  const renderGuestUsageStatus = () => {
    if (guestUsageLoading) {
      return (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-sm">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Checking free usage availability...</span>
          </div>
        </div>
      );
    }

    if (guestUsageError) {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 text-sm mb-2">
            <Gift className="h-4 w-4" />
            <strong>Free Trial Available</strong>
          </div>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Unable to check usage status, but you can still try the service for free.
            <br />Sign up for unlimited access with credits.
          </p>
        </div>
      );
    }

    if (guestUsage) {
      return (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200 text-sm mb-2">
            <Gift className="h-4 w-4" />
            <strong>Try Free - No Signup Required!</strong>
          </div>
          <p className="text-green-700 dark:text-green-300 text-sm">
            {guestUsage.remaining_uses} of {guestUsage.total_free_uses} free uses remaining today.
            <br />Sign up for unlimited access with credits.
          </p>
        </div>
      );
    }

    return null;
  };

  if (showAuthForm) {
    return <AuthForm onAuthSuccess={() => {
      setShowAuthForm(false);
      checkAuthAndCredits();
    }} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgb(2,8,23),rgba(2,8,23,0.6))] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      
      {/* Auth/User Bar */}
      <div className="relative z-10 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Watermark Remover</h2>
            {user ? (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Credits: {isAdmin ? '∞' : credits}</span>
                {isAdmin && <span className="text-purple-600 font-medium">Admin</span>}
              </div>
            ) : (
              guestUsage && !guestUsageError && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Gift className="h-4 w-4" />
                  <span>{guestUsage.remaining_uses} free uses remaining today</span>
                </div>
              )
            )}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAuthForm(true)}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
      
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
          {!user && renderGuestUsageStatus()}
        </div>

        {/* Enhanced Input Section */}
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
                onClick={handleRemoveWatermarks} 
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
                    onClick={() => setShowAuthForm(true)}
                  >
                    Sign up to continue
                  </Button>
                </p>
              </div>
            )}
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
