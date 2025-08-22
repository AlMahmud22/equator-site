'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/hooks';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

interface AuthStatusProps {
  className?: string;
  showProviders?: boolean;
}

/**
 * AuthStatus component that displays user info when logged in
 * or login options when logged out
 */
export default function AuthStatus({ 
  className = '',
  showProviders = true
}: AuthStatusProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Checking auth status...
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          {user.image ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image 
                src={user.image} 
                alt={user.name || 'User'} 
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
          )}
          <span className="font-medium">
            {user.name || user.email}
          </span>
        </div>
        <LogoutButton className="text-sm" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showProviders ? (
        <>
          <LoginButton 
            provider="github" 
            className="text-sm"
          />
          <LoginButton 
            provider="google"
            className="text-sm"
          />
        </>
      ) : (
        <LoginButton 
          provider="credentials" 
          className="text-sm"
        >
          Sign in
        </LoginButton>
      )}
    </div>
  );
}
