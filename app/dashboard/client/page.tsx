'use client';

import { useEffect, useState } from 'react';

/**
 * Client-side protected route example
 */
export default function ClientProtectedPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate auth check
  useEffect(() => {
    setIsLoading(false);
  }, []);
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Client Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Client-Side Route</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-lg mb-2">Client Information</h3>
            <div>
              <p><strong>Route Type:</strong> Client-side protected</p>
              <p><strong>Authentication:</strong> Simplified for demo</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-lg mb-2">Account Status</h3>
            <div>
              <p className="text-green-600">
                ✅ Demo authentication active
              </p>
              <p className="text-gray-500 text-sm mt-2">
                This is a simplified demo page.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-800 mb-2">Client-Side Protection</h3>
          <p className="text-blue-700 text-sm">
            This page demonstrates client-side route protection. In a production app, 
            this would redirect to login if the user is not authenticated.
          </p>
        </div>
      </div>
    </div>
  );
}
