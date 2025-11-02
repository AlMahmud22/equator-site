import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '../../../modules/database/connection'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { error, timestamp, userAgent } = req.body
    
    // Get client IP properly for Digital Ocean and various proxy setups
    const getClientIP = (req: NextApiRequest): string => {
      const xForwardedFor = req.headers['x-forwarded-for']
      const xRealIP = req.headers['x-real-ip']
      const connectionRemoteAddress = req.connection?.remoteAddress
      const socketRemoteAddress = req.socket?.remoteAddress
      
      if (xForwardedFor) {
        // x-forwarded-for can be a comma-separated list, take the first one
        const firstIP = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor.split(',')[0]
        return firstIP.trim()
      }
      
      if (xRealIP) {
        return Array.isArray(xRealIP) ? xRealIP[0] : xRealIP
      }
      
      return connectionRemoteAddress || socketRemoteAddress || 'unknown'
    }

    const clientIP = getClientIP(req)

    // Enhanced error logging
    const errorLogData = {
      error,
      timestamp: new Date(timestamp),
      userAgent,
      clientIP,
      requestHeaders: {
        'user-agent': req.headers['user-agent'],
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'referer': req.headers.referer,
        'origin': req.headers.origin,
      },
      createdAt: new Date(),
    }

    // Log to console for immediate debugging
    console.error('🚨 Auth Error Logged:', errorLogData)

    // Save to database
    try {
      await connectDB()
      
      // Use mongoose to create a simple log entry
      const mongoose = require('mongoose')
      
      // Create a simple schema if it doesn't exist
      const AuthErrorSchema = new mongoose.Schema({
        error: String,
        timestamp: Date,
        userAgent: String,
        clientIP: String,
        requestHeaders: Object,
        createdAt: { type: Date, default: Date.now }
      })
      
      const AuthError = mongoose.models.AuthError || mongoose.model('AuthError', AuthErrorSchema)
      
      await AuthError.create(errorLogData)
      console.log('✅ Error logged to database successfully')
    } catch (dbError) {
      console.error('❌ Failed to save error to database:', dbError)
      // Don't fail the request if database logging fails
    }

    // Send success response
    res.status(200).json({ 
      success: true, 
      message: 'Error logged successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in log-error API:', error)
    res.status(500).json({ 
      error: 'Failed to log error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
