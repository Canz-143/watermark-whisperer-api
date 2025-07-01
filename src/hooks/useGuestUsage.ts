
import { useState, useEffect } from 'react';

interface GuestUsage {
  remaining_uses: number;
  total_free_uses: number;
  used_today?: number;
  can_use: boolean;
  is_new_user?: boolean;
}

export const useGuestUsage = (user: any) => {
  const [guestUsage, setGuestUsage] = useState<GuestUsage | null>(null);
  const [guestUsageLoading, setGuestUsageLoading] = useState(false);
  const [guestUsageError, setGuestUsageError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!user) {
      checkGuestUsage();
    }
  }, [user]);

  return {
    guestUsage,
    setGuestUsage,
    guestUsageLoading,
    guestUsageError,
    checkGuestUsage
  };
};
