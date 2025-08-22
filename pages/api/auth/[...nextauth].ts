import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

// Simple export for NextAuth v5
export default NextAuth(authOptions) as any
