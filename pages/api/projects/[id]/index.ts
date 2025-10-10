import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/modules/database/connection';
import Project from '@/models/Project';
import UnifiedUser from '@/lib/auth/unified-user-model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Project ID is required' });
    }

    // Find the project and populate creator and comment users
    const project = await Project.findById(id)
      .populate('createdBy', 'name email image')
      .populate({
        path: 'comments.userId',
        select: 'name image',
        model: UnifiedUser
      });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Increment view count
    await Project.findByIdAndUpdate(id, { 
      $inc: { 'stats.views': 1 } 
    });

    // Update the project object with incremented views
    project.stats.views += 1;

    return res.status(200).json({
      success: true,
      project
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}