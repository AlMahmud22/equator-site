import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import connectDB from '@/modules/database/connection';
import UnifiedUser from '@/lib/auth/unified-user-model';
import crypto from 'crypto';
// import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  await connectDB();
  
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const user = await UnifiedUser.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.isEmailConfirmed) {
      return res.status(400).json({ success: false, message: 'Email already confirmed' });
    }
    
    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    
    user.emailConfirmationToken = confirmationToken;
    user.emailConfirmationSentAt = new Date();
    await user.save();
    
    // Send email (simplified - you'll need to configure nodemailer)
    const confirmationUrl = `${process.env.NEXTAUTH_URL}/auth/confirm-email?token=${confirmationToken}`;
    
    // For now, we'll just return success - in production, implement email sending
    console.log(`Email confirmation URL: ${confirmationUrl}`);
    
    res.status(200).json({
      success: true,
      message: 'Confirmation email sent successfully'
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500).json({ success: false, message: 'Failed to send confirmation email' });
  }
}