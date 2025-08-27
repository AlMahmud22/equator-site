import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Consent.module.css';

interface AppData {
  name: string;
  description: string;
  logoUrl?: string;
  isVerified: boolean;
  websiteUrl?: string;
}

export default function ConsentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract query parameters
  const { client_id, redirect_uri, scope, state, code_challenge, code_challenge_method } = router.query;

  useEffect(() => {
    // Only fetch app data when client_id is available
    if (!client_id) return;

    async function fetchAppData() {
      try {
        // Fetch app details to display to the user
        const res = await fetch(`/api/apps/${client_id}/public`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch application data');
        }
        
        const data = await res.json();
        setApp(data.app);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch app data');
      } finally {
        setLoading(false);
      }
    }

    fetchAppData();
  }, [client_id]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      const returnUrl = encodeURIComponent(window.location.href);
      router.push(`/auth/login?returnUrl=${returnUrl}`);
    }
  }, [status, router]);

  // Handle loading state
  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !app) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>!</div>
            <h2>Application Error</h2>
            <p>{error || 'Application not found'}</p>
            <Link href="/" className={styles.button}>
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Parse scopes for display
  const scopes = (scope as string || 'profile:read').split(' ');

  // Handle consent approval
  const handleApprove = async () => {
    // Build the authorization URL with all parameters
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: client_id as string,
      redirect_uri: redirect_uri as string,
      scope: scope as string,
      state: state as string || '',
      approved: 'true'
    });
    
    if (code_challenge) {
      params.append('code_challenge', code_challenge as string);
      params.append('code_challenge_method', code_challenge_method as string || 'S256');
    }
    
    // Redirect to the authorization endpoint to complete the flow
    router.push(`/api/oauth/authorize?${params.toString()}`);
  };

  // Handle consent denial
  const handleDeny = () => {
    // Redirect back to client with error
    const redirectUrl = new URL(redirect_uri as string);
    redirectUrl.searchParams.append('error', 'access_denied');
    redirectUrl.searchParams.append('error_description', 'The user denied the authorization request');
    
    if (state) {
      redirectUrl.searchParams.append('state', state as string);
    }
    
    router.push(redirectUrl.toString());
  };

  // Description for each scope
  const scopeDescriptions: Record<string, string> = {
    'profile:read': 'View your basic profile information',
    'email:read': 'View your email address',
    'profile:write': 'Update your profile information',
    'profile:extended': 'View your complete profile information',
    'admin:read': 'Access administrator-level information'
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.appHeader}>
          {app.logoUrl && (
            <div className={styles.logo}>
              <Image 
                src={app.logoUrl} 
                alt={app.name} 
                width={80} 
                height={80}
                className={styles.logoImage}
              />
            </div>
          )}
          <h1 className={styles.appName}>{app.name}</h1>
          {app.isVerified && (
            <div className={styles.badge}>Verified</div>
          )}
          <p className={styles.appDescription}>{app.description}</p>
        </div>

        <div className={styles.scopesContainer}>
          <h2 className={styles.scopesTitle}>
            {app.name} would like permission to:
          </h2>
          <ul className={styles.scopesList}>
            {scopes.map(scope => (
              <li key={scope} className={styles.scopeItem}>
                <span className={styles.checkIcon}>✓</span>
                <span>{scopeDescriptions[scope] || scope}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.disclaimer}>
          By approving, you allow this app to use your information in accordance with their
          terms of service and privacy policy.
        </p>

        <div className={styles.actions}>
          <button 
            onClick={handleDeny} 
            className={`${styles.button} ${styles.denyButton}`}
          >
            Deny
          </button>
          <button 
            onClick={handleApprove} 
            className={`${styles.button} ${styles.approveButton}`}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
