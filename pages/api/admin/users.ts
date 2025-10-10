import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import connectToDatabase from '@/modules/database/connection';
import UnifiedUser from '@/lib/auth/unified-user-model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  if (req.method === 'GET') {
    return handleGetUsers(req, res);
  }
  
  if (req.method === 'PUT') {
    return handleUpdateUserRole(req, res);
  }
  
  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

async function handleGetUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email || session.user.email !== 'mahmud23k@gmail.com') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const users = await UnifiedUser.find({})
      .select('name email image role isEmailConfirmed createdAt lastLoginAt')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
}

async function handleUpdateUserRole(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email || session.user.email !== 'mahmud23k@gmail.com') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const { userId, role } = req.body;
    
    if (!userId || !role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Valid userId and role are required' });
    }
    
    const user = await UnifiedUser.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prevent admin from downgrading themselves
    if (user.email === session.user.email && role === 'user') {
      return res.status(400).json({ success: false, message: 'Cannot downgrade yourself from admin' });
    }
    
    user.role = role;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
}