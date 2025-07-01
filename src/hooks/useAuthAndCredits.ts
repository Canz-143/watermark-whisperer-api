
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
