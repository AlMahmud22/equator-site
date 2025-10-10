import { useState, useEffect, ReactElement } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/ConnectionManager.module.css';

interface Token {
  _id: string;
  appId: {
    _id: string;
    name: string;
    description: string;
    logoUrl?: string;
  };
  scopes: string[];
  createdAt: string;
  expiresAt: string;
  lastUsed?: string;
}

interface ScopeDescriptions {
  [key: string]: string;
}

export default function ConnectionManager(): ReactElement {
  const { data: session } = useSession();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's active tokens on component mount
  useEffect(() => {
    async function fetchTokens() {
      try {
        const res = await fetch('/api/tokens');
        
        if (!res.ok) {
          throw new Error('Failed to fetch connected applications');
        }
        
        const data = await res.json();
        setTokens(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load connected applications');
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchTokens();
    }
  }, [session]);

  // Function to revoke a token
  const revokeToken = async (tokenId: string): Promise<void> => {
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'revoke',
          id: tokenId
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to revoke access');
      }
      
      // Remove the revoked token from state
      setTokens(tokens.filter(token => token._id !== tokenId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke access');
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Connected Applications</h2>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading connected applications...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Connected Applications</h2>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.button}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get scope descriptions
  const getScopeDescription = (scope: string): string => {
    const descriptions: Record<string, string> = {
      'profile:read': 'Read your profile',
      'email:read': 'Access your email',
      'profile:write': 'Update your profile',
      'profile:extended': 'Access detailed profile information',
      'admin:read': 'Admin access'
    };
    
    return descriptions[scope] || scope;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Connected Applications</h2>
      
      {tokens.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven&apos;t connected any applications yet.</p>
        </div>
      ) : (
        <div className={styles.tokensList}>
          {tokens.map((token: Token) => (
            <div key={token._id} className={styles.tokenCard}>
              <div className={styles.tokenHeader}>
                <div className={styles.appInfo}>
                  {token.appId.logoUrl ? (
                    <img 
                      src={token.appId.logoUrl} 
                      alt={token.appId.name}
                      className={styles.appLogo}
                    />
                  ) : (
                    <div className={styles.appLogoPlaceholder}>
                      {token.appId.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className={styles.appName}>{token.appId.name}</h3>
                    <p className={styles.appDescription}>{token.appId.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => revokeToken(token._id)} 
                  className={styles.revokeButton}
                >
                  Revoke Access
                </button>
              </div>
              
              <div className={styles.tokenDetails}>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Connected on:</span>
                  <span>{formatDate(token.createdAt)}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Expires on:</span>
                  <span>{formatDate(token.expiresAt)}</span>
                </div>
                {token.lastUsed && (
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Last used:</span>
                    <span>{formatDate(token.lastUsed)}</span>
                  </div>
                )}
              </div>
              
              <div className={styles.scopesContainer}>
                <h4 className={styles.scopesTitle}>Permissions</h4>
                <ul className={styles.scopesList}>
                  {token.scopes.map((scope: string) => (
                    <li key={scope} className={styles.scopeItem}>
                      {getScopeDescription(scope)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
