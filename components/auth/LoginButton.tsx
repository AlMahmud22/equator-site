'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/hooks';

interface LoginButtonProps {
  provider: string;
  className?: string;
  children?: React.ReactNode;
  callbackUrl?: string;
}

/**
 * LoginButton component for signing in with various providers
 */
export default function LoginButton({ 
  provider, 
  className = '', 
  children,
  callbackUrl
}: LoginButtonProps) {
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    await login(provider, callbackUrl);
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`px-4 py-2 font-medium rounded-md ${
        provider === 'github' 
          ? 'bg-gray-800 text-white hover:bg-gray-700' 
          : provider === 'google'
          ? 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
          : 'bg-green-600 text-white hover:bg-green-500'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : children || `Sign in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
    </button>
  );
}
