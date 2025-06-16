
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Loader, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreditPurchaseProps {
  onBack: () => void;
}

const CreditPurchase = ({ onBack }: CreditPurchaseProps) => {
  const [loading, setLoading] = useState(false);

  const creditPackages = [
    { credits: 100, price: 5, popular: false },
    { credits: 250, price: 12, popular: true, savings: '$0.50' },
    { credits: 500, price: 22, popular: false, savings: '$3.00' },
    { credits: 1000, price: 40, popular: false, savings: '$10.00' },
  ];

  const handlePurchase = async (credits: number) => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to purchase credits');
        return;
      }

      const response = await fetch('https://gmsbosytllfouwzujros.supabase.co/functions/v1/create-credit-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credits }),
      });

      const data = await response.json();
      
      if (response.ok && data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        toast.success('Redirecting to payment...');
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Purchase Credits</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {creditPackages.map((pkg) => (
          <Card key={pkg.credits} className={`relative ${pkg.popular ? 'ring-2 ring-blue-500' : ''}`}>
            {pkg.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                {pkg.credits} Credits
              </CardTitle>
              <CardDescription>
                <div className="text-2xl font-bold text-green-600">${pkg.price}</div>
                {pkg.savings && (
                  <div className="text-sm text-green-600">Save {pkg.savings}</div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  {Math.floor(pkg.credits / 10)} watermark removals
                </p>
                <p className="text-xs text-gray-500">
                  ${(pkg.price / pkg.credits * 10).toFixed(2)} per removal
                </p>
              </div>
              <Button 
                onClick={() => handlePurchase(pkg.credits)}
                disabled={loading}
                className="w-full"
                variant={pkg.popular ? "default" : "outline"}
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Buy ${pkg.credits} Credits`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How Credits Work</h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>• Each watermark removal costs 10 credits</li>
            <li>• Credits never expire</li>
            <li>• Use credits for both web app and API access</li>
            <li>• Secure payment processing via Stripe</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditPurchase;
