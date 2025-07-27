import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  fullName: string
  email: string
  password?: string
  authType: 'email' | 'google' | 'github'
  huggingFaceToken?: string
  downloadLogs?: {
    modelId: string
    modelName: string
    downloadedAt: Date
    fileSize?: number
  }[]
  preferences?: {
    newsletter: boolean
    notifications: boolean
  }
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
  password: {
    type: String,
    required: function (this: IUser) {
      return this.authType === 'email'
    },
    select: false
  },
  authType: {
    type: String,
    enum: ['email', 'google', 'github'],
    required: true,
    default: 'email'
  },
  huggingFaceToken: {
    type: String,
    select: false
  },
  downloadLogs: [
    {
      modelId: String,
      modelName: String,
      downloadedAt: {
        type: Date,
        default: Date.now
      },
      fileSize: Number
    }
  ],
  preferences: {
    newsletter: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: {
    transform(_, ret) {
      delete ret.password
      delete ret.huggingFaceToken
      return ret
    }
  }
})

UserSchema.index({ createdAt: -1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
