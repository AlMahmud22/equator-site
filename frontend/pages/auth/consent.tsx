import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Mail, 
  Database, 
  BarChart, 
  Settings,
  ExternalLink
} from 'lucide-react';
import { AVAILABLE_SCOPES } from '../../modules/database/models/AppPermission';

interface ConsentPageProps {
  appData: {
    name: string;
    description: string;
    website: string;
    iconUrl: string;
    isVerified: boolean;
  };
  requestedScopes: string[];
  grantedScopes: string[];
  missingScopes: string[];
  clientId: string;
  redirectUri: string;
  state: string;
}

const ConsentPage: React.FC<ConsentPageProps> = ({
  appData,
  requestedScopes,
  grantedScopes,
  missingScopes,
  clientId,
  redirectUri,
  state
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(grantedScopes);

  const handleScopeToggle = (scope: string) => {
    setSelectedScopes(prev => 
      prev.includes(scope) 
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  const handleApprove = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/consent/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
          approved_scopes: selectedScopes
        }),
      });

      const data = await response.json();
      
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        console.error('Approval failed:', data.error);
        alert('Failed to approve application access. Please try again.');
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = () => {
    const url = new URL(redirectUri);
    url.searchParams.set('error', 'access_denied');
    url.searchParams.set('error_description', 'User denied access');
    if (state) url.searchParams.set('state', state);
    
    window.location.href = url.toString();
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'profile:read':
      case 'profile:write':
        return <User className="w-5 h-5" />;
      case 'email:read':
        return <Mail className="w-5 h-5" />;
      case 'models:read':
      case 'models:write':
        return <Database className="w-5 h-5" />;
      case 'analytics:read':
        return <BarChart className="w-5 h-5" />;
      case 'admin:read':
        return <Settings className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getScopeColor = (scope: string) => {
    const scopeInfo = AVAILABLE_SCOPES[scope as keyof typeof AVAILABLE_SCOPES];
    return scopeInfo?.sensitive ? 'text-red-600' : 'text-blue-600';
  };

  return (
    <>
      <Head>
        <title>Authorize Application - Equators</title>
        <meta name="description" content="Authorize application access to your Equators account" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-xl shadow-xl p-6"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              {appData.iconUrl ? (
                <img 
                  src={appData.iconUrl} 
                  alt={appData.name}
                  className="w-16 h-16 rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Shield className="w-8 h-8 text-gray-500" />
                </div>
              )}
              
              {appData.isVerified && (
                <CheckCircle className="w-6 h-6 text-green-500 -ml-2 -mt-2" />
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Authorize {appData.name}
            </h1>
            
            <p className="text-gray-600 text-sm">
              {appData.description || 'This application is requesting access to your Equators account.'}
            </p>
            
            {appData.website && (
              <a 
                href={appData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
              >
                Visit website <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Requested Permissions
            </h2>
            
            <div className="space-y-3">
              {requestedScopes.map((scope) => {
                const scopeInfo = AVAILABLE_SCOPES[scope as keyof typeof AVAILABLE_SCOPES];
                const isSelected = selectedScopes.includes(scope);
                const isRequired = missingScopes.includes(scope);
                
                return (
                  <motion.div
                    key={scope}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => handleScopeToggle(scope)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 ${getScopeColor(scope)}`}>
                        {getScopeIcon(scope)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">
                            {scopeInfo?.name || scope}
                          </h3>
                          
                          <div className="flex items-center space-x-2">
                            {scopeInfo?.sensitive && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleScopeToggle(scope)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {scopeInfo?.description || 'No description available'}
                        </p>
                        
                        {isRequired && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            New permission
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Security Notice */}
          {requestedScopes.some(scope => 
            AVAILABLE_SCOPES[scope as keyof typeof AVAILABLE_SCOPES]?.sensitive
          ) && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">Security Notice</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This application is requesting access to sensitive information. 
                    Only approve if you trust this application.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleDeny}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleApprove}
              disabled={isLoading || selectedScopes.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Authorizing...' : 'Authorize'}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By authorizing this application, you allow it to access your data according to the selected permissions. 
              You can revoke access at any time from your account settings.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: `/auth/login?callbackUrl=${encodeURIComponent(context.req.url || '')}`,
        permanent: false,
      },
    };
  }

  const {
    client_id,
    redirect_uri,
    scope = '',
    state = '',
    app_name = '',
    app_description = '',
    app_website = '',
    app_icon = '',
    missing_scopes = '',
    granted_scopes = ''
  } = context.query;

  if (!client_id || !redirect_uri) {
    return {
      notFound: true,
    };
  }

  const requestedScopes = typeof scope === 'string' 
    ? scope.split(' ').filter(Boolean) 
    : [];
    
  const missingScopes = typeof missing_scopes === 'string' 
    ? missing_scopes.split(' ').filter(Boolean) 
    : [];
    
  const grantedScopes = typeof granted_scopes === 'string' 
    ? granted_scopes.split(' ').filter(Boolean) 
    : [];

  return {
    props: {
      appData: {
        name: app_name || 'Unknown Application',
        description: app_description || '',
        website: app_website || '',
        iconUrl: app_icon || '',
        isVerified: false // This would come from the app's verification status
      },
      requestedScopes,
      grantedScopes,
      missingScopes,
      clientId: client_id,
      redirectUri: redirect_uri,
      state: Array.isArray(state) ? state[0] || '' : state || ''
    },
  };
};

export default ConsentPage;
