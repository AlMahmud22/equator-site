import { signIn, getProviders, getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import Head from 'next/head'

interface LoginPageProps {
  providers: any
}

export default function LoginEmergencyPage({ providers }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSignIn = async (providerId: string) => {
    setIsLoading(providerId)
    setError('')
    
    try {
      console.log(`🚀 Attempting to sign in with ${providerId}`)
      const result = await signIn(providerId, { 
        callbackUrl: '/',
        redirect: true 
      })
      
      console.log('Sign in result:', result)
      
      if (result?.error) {
        setError(`Sign in failed: ${result.error}`)
        setIsLoading(null)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('An unexpected error occurred')
      setIsLoading(null)
    }
  }

  return (
    <>
      <Head>
        <title>Emergency Login - Equators</title>
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">🚨 Emergency Auth Test</h1>
          
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800">Production Environment:</h3>
            <p className="text-sm text-blue-600">https://equators.tech</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {providers && Object.values(providers).map((provider: any) => (
              <button
                key={provider.id}
                onClick={() => handleSignIn(provider.id)}
                disabled={isLoading === provider.id}
                className={`w-full py-3 px-4 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center space-x-2 ${
                  provider.id === 'github'
                    ? 'bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-500'
                    : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading === provider.id ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    {provider.id === 'github' ? '🐙' : '🔍'}
                    <span>Sign in with {provider.name}</span>
                  </>
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              NextAuth v4 • MongoDB Atlas • Production Ready
            </p>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
            <h4 className="font-semibold">Debug Info:</h4>
            <p>Providers: {providers ? Object.keys(providers).join(', ') : 'None'}</p>
            <p>Environment: {process.env.NODE_ENV}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getSession(context)
    
    if (session) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }

    const providers = await getProviders()
    console.log('🔍 Available providers:', providers)
    
    return {
      props: {
        providers: providers ?? {},
      },
    }
  } catch (error) {
    console.error('❌ Error in getServerSideProps:', error)
    return {
      props: {
        providers: {},
      },
    }
  }
}
