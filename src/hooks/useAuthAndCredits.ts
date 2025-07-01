
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useAuthAndCredits = () => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

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

  const fetchCredits = async (session: any) => {
    try {
      console.log('Fetching credits for user:', session.user.email);

      const { data, error } = await supabase.functions.invoke('check-credits', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('Credit check response:', { data, error });

      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }

      if (data) {
        if (data.message === 'User not found in credits system') {
          console.log('User not found in credits system');
          setCredits(0);
          setIsAdmin(data.is_admin || false);
        } else {
          console.log('Setting credits to:', data.credits, 'Admin status:', data.is_admin);
          setCredits(data.credits);
          setIsAdmin(data.is_admin);
        }
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCredits(0);
    setIsAdmin(false);
    setIsGuest(true);
  };

  useEffect(() => {
    checkAuthAndCredits();
  }, []);

  return {
    user,
    credits,
    setCredits,
    isAdmin,
    isGuest,
    checkAuthAndCredits,
    handleSignOut
  };
};
