
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ticket, Loader, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CouponRedemptionProps {
  onCreditsUpdated?: (newBalance: number) => void;
}

const CouponRedemption = ({ onCreditsUpdated }: CouponRedemptionProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsRedeeming(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to redeem coupons');
        return;
      }

      console.log('Starting coupon redemption for code:', couponCode);

      const { data, error } = await supabase.functions.invoke('redeem-coupon', {
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      });

      console.log('Coupon redemption response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        toast.error('Failed to redeem coupon. Please try again.');
        return;
      }

      if (data && data.success) {
        toast.success(data.message);
        setCouponCode('');
        console.log('Coupon redeemed successfully, new balance:', data.new_balance);
        
        // Notify parent component about credit update
        if (onCreditsUpdated) {
          onCreditsUpdated(data.new_balance);
        }
      } else {
        toast.error(data?.error || 'Failed to redeem coupon');
      }
    } catch (error) {
      console.error('Error redeeming coupon:', error);
      toast.error('Failed to redeem coupon. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-green-500" />
          Redeem Coupon
        </CardTitle>
        <CardDescription>
          Enter a coupon code to receive free credits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRedeemCoupon} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coupon-code">Coupon Code</Label>
            <Input
              id="coupon-code"
              type="text"
              placeholder="Enter coupon code (e.g., BEST100)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={isRedeeming}
              className="uppercase"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isRedeeming || !couponCode.trim()}
          >
            {isRedeeming ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Redeeming...
              </>
            ) : (
              <>
                <Ticket className="h-4 w-4 mr-2" />
                Redeem Coupon
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Try:</strong> BEST100 for 100 free credits!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CouponRedemption;
