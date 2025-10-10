import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import connectToDatabase from '@/modules/database/connection';
import Project from '@/models/Project';
import UnifiedUser from '@/lib/auth/unified-user-model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  await connectToDatabase();
  
  try {
    const { id } = req.query;
    const { content, anonymousEmail } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    const session = await getServerSession(req, res, authOptions);
    
    let commentData: any = {
      content: content.trim(),
      createdAt: new Date()
    };
    
    if (session?.user?.email) {
      // Logged in user comment
      const user = await UnifiedUser.findOne({ email: session.user.email });
      if (user) {
        commentData.userId = user._id;
        commentData.isAnonymous = false;
      }
    } else {
      // Anonymous comment
      if (!anonymousEmail || !/\S+@\S+\.\S+/.test(anonymousEmail)) {
        return res.status(400).json({ success: false, message: 'Valid email is required for anonymous comments' });
      }
      commentData.anonymousEmail = anonymousEmail;
      commentData.isAnonymous = true;
    }
    
    await project.addComment(commentData);
    
    const updatedProject = await Project.findById(id)
      .populate('comments.userId', 'name image');
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comments: updatedProject.comments
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
}