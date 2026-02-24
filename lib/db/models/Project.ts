import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  category: string;
  techStack: string[];
  features: string[];
  requirements: {
    os?: string;
    ram?: string;
    storage?: string;
    browser?: string;
    network?: string;
    runtime?: string;
  };
  
  projectFile: {
    originalName: string;
    filename: string;
    size: number;
    uploadedAt: Date;
  };
  
  version: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  createdBy: mongoose.Types.ObjectId;
  
  stats: {
    downloads: number;
    views: number;
    likes: number;
  };
  
  comments: Array<{
    _id: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    anonymousEmail?: string;
    content: string;
    createdAt: Date;
    isAnonymous: boolean;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
  
  incrementViews(): Promise<this>;
  incrementDownloads(): Promise<this>;
  addComment(commentData: any): Promise<this>;
}

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['Desktop Apps', 'Web Apps', 'Mobile Apps', 'Security Tools', 'Other']
  },
  techStack: [{
    type: String,
    required: true
  }],
  features: [{
    type: String,
    required: true
  }],
  requirements: {
    os: String,
    ram: String,
    storage: String,
    browser: String,
    network: String,
    runtime: String
  },
  
  projectFile: {
    originalName: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'rejected'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UnifiedUser',
    required: true
  },
  
  stats: {
    downloads: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UnifiedUser'
    },
    anonymousEmail: {
      type: String,
      validate: {
        validator: function(this: any) {
          return this.isAnonymous ? !!this.anonymousEmail : !this.anonymousEmail;
        },
        message: 'Anonymous email is required for anonymous comments'
      }
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isAnonymous: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes
ProjectSchema.index({ createdBy: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ createdAt: -1 });

// Methods
ProjectSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

ProjectSchema.methods.incrementDownloads = function() {
  this.stats.downloads += 1;
  return this.save();
};

ProjectSchema.methods.addComment = function(commentData: any) {
  this.comments.push(commentData);
  return this.save();
};

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
