
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Plus, Crown, RefreshCw, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreditBalanceProps {
  onBuyCredits: () => void;
}

const CreditBalance = ({ onBuyCredits }: CreditBalanceProps) => {
  const [credits, setCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  const initializeUserCredits = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log('Initializing user credits for:', session.user.email);
      
      const isAdminUser = session.user.email === 'albertcanz66@gmail.com';
      const { error } = await supabase
        .from('user_credits')
        .insert({
          user_id: session.user.id,
          email: session.user.email!,
          credits: isAdminUser ? 999999 : 0,
          is_admin: isAdminUser
        });

      if (error) {
        console.error('Error creating user credits:', error);
        if (error.code !== '23505') { // Ignore duplicate key errors
          toast.error('Failed to initialize user credits');
          return;
        }
      }

      // Refresh credits after initialization
      await fetchCredits();
      toast.success('User credits initialized successfully');
    } catch (error) {
      console.error('Error initializing user credits:', error);
      toast.error('Failed to initialize user credits');
    }
  };

  const fetchCredits = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      console.log('Fetching credits for user:', session.user.email);

      const { data, error } = await supabase.functions.invoke('check-credits');

      console.log('Credit check response:', { data, error });

      if (error) {
        console.error('Error fetching credits:', error);
        toast.error('Failed to fetch credit balance');
        return;
      }

      if (data) {
        if (data.message === 'User not found in credits system') {
          console.log('User not found in credits system');
          setUserNotFound(true);
          setCredits(0);
          setIsAdmin(data.is_admin || false);
        } else {
          console.log('Setting credits to:', data.credits, 'Admin status:', data.is_admin);
          setCredits(data.credits);
          setIsAdmin(data.is_admin);
          setUserNotFound(false);
        }
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast.error('Failed to fetch credit balance');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefreshCredits = async () => {
    setRefreshing(true);
    await fetchCredits();
  };

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshCredits}
            disabled={refreshing}
            className="ml-auto p-1"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
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
        
        {userNotFound && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-700 text-sm font-medium mb-2">
              Credits not initialized
            </p>
            <p className="text-yellow-600 text-xs mb-3">
              Your account needs to be set up in the credits system
            </p>
            <Button 
              onClick={initializeUserCredits} 
              size="sm" 
              className="w-full"
              variant="outline"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Initialize Credits
            </Button>
          </div>
        )}
        
        {!isAdmin && !userNotFound && (
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
