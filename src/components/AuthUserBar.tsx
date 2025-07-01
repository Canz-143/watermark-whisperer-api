
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogIn, User, Gift } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface AuthUserBarProps {
  user: any;
  credits: number;
  isAdmin: boolean;
  guestUsage: any;
  guestUsageError: string | null;
  onSignOut: () => void;
  onShowAuthForm: () => void;
}

const AuthUserBar = ({ 
  user, 
  credits, 
  isAdmin, 
  guestUsage, 
  guestUsageError, 
  onSignOut, 
  onShowAuthForm 
}: AuthUserBarProps) => {
  const navigate = useNavigate();

  return (
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
              <Button variant="ghost" size="sm" onClick={onSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={onShowAuthForm}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthUserBar;
