// ===== FILE: /pages/api/seed.ts =====
import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '@/modules/database/connection'
import User from '@/modules/database/models/User'
import TrainingLog from '@/modules/database/models/TrainingLog'
import AccessLog from '@/modules/database/models/AccessLog'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  await connectDB()

  try {
    const existing = await User.findOne({ email: 'test@example.com' })
    const user = existing || await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'testpassword',
      authType: 'email',
    })

    const trainingLog = await TrainingLog.create({
      userId: user._id,
      modelId: 'test-model-id',
      modelName: 'Test Model',
      trainedAt: new Date(),
      duration: 123
    })

    const accessLog = await AccessLog.create({
      userId: user._id,
      endpoint: '/api/test',
      accessTime: new Date(),
      ipAddress: '127.0.0.1',
      loginProvider: 'local'
    })

    return res.status(200).json({
      message: '✅ Seed successful',
      userId: user._id,
      trainingLogId: trainingLog._id,
      accessLogId: accessLog._id,
    })
  } catch (err: any) {
    return res.status(500).json({
      error: '❌ Failed to seed test data',
      details: err?.message || err,
    })
  }
}
