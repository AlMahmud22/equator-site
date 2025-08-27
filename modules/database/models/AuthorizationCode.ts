import mongoose, { Schema, Document, Model, HydratedDocument } from 'mongoose';
import { randomBytes } from 'crypto';

export interface IAuthorizationCode extends Document {
  code: string;
  clientId: string;
  userId: mongoose.Types.ObjectId;
  scopes: string[];
  redirectUri: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  expiresAt: Date;
  createdAt: Date;
}

// Define static methods using Model interface extension
interface AuthorizationCodeModel extends Model<IAuthorizationCode> {
  generateCode(): Promise<string>;
  createCode(
    clientId: string,
    userId: string,
    scopes: string[],
    redirectUri: string,
    codeChallenge?: string,
    codeChallengeMethod?: string
  ): Promise<HydratedDocument<IAuthorizationCode>>;
  cleanUp(): Promise<number>;
}

const AuthorizationCodeSchema = new Schema<IAuthorizationCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  clientId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scopes: {
    type: [String],
    required: true
  },
  redirectUri: {
    type: String,
    required: true
  },
  codeChallenge: {
    type: String
  },
  codeChallengeMethod: {
    type: String,
    enum: ['plain', 'S256'],
    default: 'S256'
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Create index for expiration
AuthorizationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Apply statics to schema directly to ensure TypeScript recognizes them
// Keep this method for backward compatibility or external usage
AuthorizationCodeSchema.static('generateCode', async function(): Promise<string> {
  let code: string = "";
  let isUnique = false;
  
  // Keep generating codes until we find a unique one
  while (!isUnique) {
    code = randomBytes(32).toString('hex');
    
    // Check if code already exists
    const existingCode = await this.findOne({ code });
    if (!existingCode) {
      isUnique = true;
    }
  }
  
  return code;
});

AuthorizationCodeSchema.static('createCode', async function(
  clientId: string,
  userId: string,
  scopes: string[],
  redirectUri: string,
  codeChallenge?: string,
  codeChallengeMethod?: string
): Promise<HydratedDocument<IAuthorizationCode>> {
  // Generate a unique code directly within this method instead of calling generateCode()
  let code: string = "";
  let isUnique = false;
  
  // Keep generating codes until we find a unique one
  while (!isUnique) {
    code = randomBytes(32).toString('hex');
    
    // Check if code already exists
    const existingCode = await this.findOne({ code });
    if (!existingCode) {
      isUnique = true;
    }
  }
  
  // Create a new authorization code
  const authCode = new this({
    code,
    clientId,
    userId,
    scopes,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiration
  });
  
  await authCode.save();
  return authCode;
});

AuthorizationCodeSchema.static('cleanUp', async function(): Promise<number> {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  
  return result.deletedCount || 0;
});

// Create and export the model
// Apply a proper type assertion to ensure TypeScript recognizes the static methods
const AuthorizationCode = (mongoose.models.AuthorizationCode as unknown as AuthorizationCodeModel) || 
  mongoose.model<IAuthorizationCode, AuthorizationCodeModel>('AuthorizationCode', AuthorizationCodeSchema);

// Add the methods directly to the model for TypeScript to recognize them
(AuthorizationCode as any).generateCode = AuthorizationCodeSchema.statics.generateCode;

export default AuthorizationCode;
