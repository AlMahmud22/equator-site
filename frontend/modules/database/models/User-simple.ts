import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  fullName: string
  email: string
  authType: 'google' | 'github'
  avatar?: string
  downloadLogs?: {
    projectId: string
    projectName: string
    downloadedAt: Date
    fileSize?: number
  }[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  authType: {
    type: String,
    enum: ['google', 'github'],
    required: true
  },
  avatar: {
    type: String,
    required: false
  },
  downloadLogs: [
    {
      projectId: String,
      projectName: String,
      downloadedAt: {
        type: Date,
        default: Date.now
      },
      fileSize: Number
    }
  ]
}, {
  timestamps: true,
  toJSON: {
    transform(_, ret) {
      return ret
    }
  }
})

UserSchema.index({ createdAt: -1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
