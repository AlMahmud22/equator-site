import mongoose, { Schema, Document } from 'mongoose'

export interface ITrainingLog extends Document {
  userId: mongoose.Types.ObjectId
  modelName: string
  config: Record<string, any>
  metrics: {
    loss: number
    accuracy?: number
    valLoss?: number
    valAccuracy?: number
  }[]
  hardware: {
    cpu: string
    gpu: string
    ramGB: number
    temperatureC?: number
    wattageW?: number
  }
  startedAt: Date
  finishedAt?: Date
  status: 'running' | 'completed' | 'failed'
}

const TrainingLogSchema = new Schema<ITrainingLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modelName: {
    type: String,
    required: true
  },
  config: {
    type: Schema.Types.Mixed,
    required: true
  },
  metrics: [
    {
      loss: { type: Number, required: true },
      accuracy: Number,
      valLoss: Number,
      valAccuracy: Number
    }
  ],
  hardware: {
    cpu: { type: String, required: true },
    gpu: { type: String, required: true },
    ramGB: { type: Number, required: true },
    temperatureC: Number,
    wattageW: Number
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  finishedAt: Date,
  status: {
    type: String,
    enum: ['running', 'completed', 'failed'],
    default: 'running'
  }
}, { timestamps: true })

TrainingLogSchema.index({ userId: 1, startedAt: -1 })

export default mongoose.models.TrainingLog || mongoose.model<ITrainingLog>('TrainingLog', TrainingLogSchema)
