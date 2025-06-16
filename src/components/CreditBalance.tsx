
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Plus, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreditBalanceProps {
  onBuyCredits: () => void;
}

const CreditBalance = ({ onBuyCredits }: CreditBalanceProps) => {
  const [credits, setCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Credit Balance
          {isAdmin && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Crown className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isAdmin ? 'Unlimited credits as admin user' : 'Credits available for watermark removal'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {isAdmin ? '∞' : credits}
          </div>
          <p className="text-sm text-gray-600">
            {isAdmin ? 'Unlimited credits' : 'Available credits'}
          </p>
        </div>
        
        {!isAdmin && (
          <>
            <div className="text-xs text-gray-500 text-center">
              Each watermark removal costs 10 credits
            </div>
            
            {credits < 10 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm font-medium">
                  Insufficient credits for watermark removal
                </p>
                <p className="text-red-600 text-xs mt-1">
                  You need at least 10 credits to use the service
                </p>
              </div>
            )}
            
            <Button onClick={onBuyCredits} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Buy More Credits
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditBalance;
