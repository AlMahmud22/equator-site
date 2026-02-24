import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/modules/database/connection';
import Project from '@/models/Project';
import UnifiedUser from '@/lib/auth/unified-user-model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  
  const { id } = req.query;
  
  if (req.method === 'GET') {
    return handleGetProject(req, res, id as string);
  }
  
  if (req.method === 'PUT') {
    return handleUpdateProject(req, res, id as string);
  }
  
  if (req.method === 'DELETE') {
    return handleDeleteProject(req, res, id as string);
  }
  
  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

async function handleGetProject(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    
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

async function handleUpdateProject(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    const user = await UnifiedUser.findOne({ email: session.user.email });
    
    // Check if user owns the project or is admin
    const isAdmin = session.user.email === 'mahmud23k@gmail.com';
    const isOwner = project.createdBy.toString() === user?._id.toString();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }
    
    const updateData = req.body;
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    const updatedProject = await Project.findByIdAndUpdate(id, updateData, { new: true })
      .populate('createdBy', 'name image email');
    
    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ success: false, message: 'Failed to update project' });
  }
}

async function handleDeleteProject(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    const user = await UnifiedUser.findOne({ email: session.user.email });
    
    // Check if user owns the project or is admin
    const isAdmin = session.user.email === 'mahmud23k@gmail.com';
    const isOwner = project.createdBy.toString() === user?._id.toString();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }
    
    await Project.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
}