import mongoose, { Schema, Document } from 'mongoose'

export interface IAccessLog extends Document {
  userId: mongoose.Types.ObjectId
  loginProvider: 'email' | 'google' | 'github'
  ipAddress: string
  userAgent: string
  timestamp: Date
}

const AccessLogSchema = new Schema<IAccessLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loginProvider: {
    type: String,
    enum: ['email', 'google', 'github'],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

AccessLogSchema.index({ userId: 1, timestamp: -1 })

export default mongoose.models.AccessLog || mongoose.model<IAccessLog>('AccessLog', AccessLogSchema)
