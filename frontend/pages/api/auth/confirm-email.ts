import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/modules/database/connection';
import UnifiedUser from '@/lib/auth/unified-user-model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  await connectDB();
  
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Confirmation token is required' });
    }
    
    const user = await UnifiedUser.findOne({ 
      emailConfirmationToken: token,
      emailConfirmationSentAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired confirmation token' });
    }
    
    user.isEmailConfirmed = true;
    user.emailConfirmationToken = undefined;
    user.emailConfirmationSentAt = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Email confirmed successfully'
    });
  } catch (error) {
    console.error('Error confirming email:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm email' });
  }
}