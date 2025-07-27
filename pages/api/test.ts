/**
 * Mongoose Connection Test API Route
 * GET /api/test - Tests Mongoose + MongoDB connectivity and returns user list
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '../../lib/database'
import User from '../../lib/models/User'

type TestResponse =
  | {
      message: string
      usersCount: number
      firstUser?: {
        fullName: string
        email: string
        authType: string
        createdAt: string
      }
      timestamp: string
    }
  | {
      error: string
      details: string
      timestamp: string
    }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      details: 'Only GET requests are allowed',
      timestamp: new Date().toISOString(),
    })
  }

  try {
    await connectDB()

    const users = await User.find().sort({ createdAt: -1 }).limit(1).lean()

    const response: TestResponse = {
      message: '✅ Mongoose connected & User model working!',
      usersCount: users.length,
      firstUser: users[0]
        ? {
            fullName: users[0].fullName,
            email: users[0].email,
            authType: users[0].authType,
            createdAt: users[0].createdAt.toLocaleString(),
          }
        : undefined,
      timestamp: new Date().toISOString(),
    }

    return res.status(200).json(response)
  } catch (error: any) {
    console.error('❌ Test failed:', error)

    return res.status(500).json({
      error: 'Server Error',
      details: error.message || 'Something went wrong',
      timestamp: new Date().toISOString(),
    })
  }
}
