
import React from 'react';
import { Loader, Gift } from "lucide-react";

interface GuestUsageStatusProps {
  guestUsageLoading: boolean;
  guestUsageError: string | null;
  guestUsage: any;
}

const GuestUsageStatus = ({ guestUsageLoading, guestUsageError, guestUsage }: GuestUsageStatusProps) => {
  if (guestUsageLoading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 text-blue-800 dark:text-blue-200 text-sm">
          <Loader className="h-4 w-4 animate-spin" />
          <span>Checking free usage availability...</span>
        </div>
      </div>
    );
  }

  if (guestUsageError) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 text-yellow-800 dark:text-yellow-200 text-sm mb-2">
          <Gift className="h-4 w-4" />
          <span className="font-semibold">Free Trial Available</span>
        </div>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm text-center leading-relaxed">
          Unable to check usage status, but you can still try the service for free.
          <br />
          Sign up for unlimited access with credits.
        </p>
      </div>
    );
  }

  if (guestUsage) {
    return (
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-200 text-sm mb-2">
          <Gift className="h-4 w-4" />
          <span className="font-semibold">Try Free - No Signup Required!</span>
        </div>
        <p className="text-green-700 dark:text-green-300 text-sm text-center leading-relaxed">
          {guestUsage.remaining_uses} of {guestUsage.total_free_uses} free uses remaining today.
          <br />
          Sign up for unlimited access with credits.
        </p>
      </div>
    );
  }

  return null;
};

export default GuestUsageStatus;
