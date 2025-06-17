
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Coins, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const PurchaseSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<string | null>(null);

  useEffect(() => {
    const creditsPurchased = searchParams.get('credits_purchased');
    if (creditsPurchased) {
      setCredits(creditsPurchased);
      toast.success(`Successfully purchased ${creditsPurchased} credits!`);
    } else {
      // If no credits parameter, redirect to dashboard
      navigate('/dashboard');
    }
  }, [searchParams, navigate]);

  if (!credits) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Purchase Successful!
          </CardTitle>
          <CardDescription>
            Your credits have been added to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold text-green-800">{credits}</span>
            </div>
            <p className="text-sm text-green-700">Credits Added</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/watermark-remover')} 
              className="w-full"
            >
              Start Removing Watermarks
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>Credits never expire and can be used anytime</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseSuccess;
