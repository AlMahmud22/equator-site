/**
 * Example usage of the centralized MongoDB connection and models
 * This file demonstrates how to use lib/mongo.ts in your API routes
 */

import { NextApiRequest, NextApiResponse } from 'next'
import connectDB, { User, AccessLog, TrainingLog, logAccess } from '@/lib/mongo'

// Example 1: Basic user operations
export async function getUserExample(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connection is handled automatically
    await connectDB()
    
    // Use models directly
    const users = await User.find().limit(10)
    const userCount = await User.countDocuments()
    
    res.json({
      success: true,
      data: { users, userCount }
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}

// Example 2: Access logging
export async function loginExample(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB()
    
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    
    // Validate password logic would go here
    if (user) {
      // Log the access using the utility function
      await logAccess(
        user._id.toString(),
        'email',
        req.headers['x-forwarded-for'] as string || 'unknown',
        req.headers['user-agent'] || 'unknown'
      )
      
      res.json({ success: true, user })
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' })
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}

// Example 3: Training logs
export async function trainingExample(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB()
    
    // Create a training log
    const trainingLog = new TrainingLog({
      userId: req.body.userId,
      modelName: 'GPT-2-small',
      config: {
        batchSize: 32,
        learningRate: 0.001,
        epochs: 10
      },
      metrics: [
        { loss: 2.5, accuracy: 0.65 },
        { loss: 2.1, accuracy: 0.72 }
      ],
      hardware: {
        cpu: 'Intel i7-9700K',
        gpu: 'NVIDIA RTX 3080',
        ramGB: 32
      },
      status: 'completed'
    })
    
    await trainingLog.save()
    
    res.json({ success: true, trainingLog })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}

// Example 4: Combined operations
export async function analyticsExample(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB()
    
    // Get analytics data using all models
    const [userStats, accessStats, trainingStats] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$authType', count: { $sum: 1 } } }
      ]),
      AccessLog.aggregate([
        { $group: { _id: '$loginProvider', count: { $sum: 1 } } }
      ]),
      TrainingLog.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ])
    
    res.json({
      success: true,
      analytics: {
        users: userStats,
        access: accessStats,
        training: trainingStats
      }
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}
