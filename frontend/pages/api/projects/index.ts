import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import connectDB from '@/modules/database/connection';
import Project from '@/models/Project';
import UnifiedUser from '@/lib/auth/unified-user-model';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    return handleGetProjects(req, res);
  }

  if (req.method === 'POST') {
    return handleCreateProject(req, res);
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

async function handleGetProjects(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = 1, limit = 12, category, search, userId } = req.query;
    
    const query: any = { status: 'active' };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { techStack: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    
    if (userId) {
      query.createdBy = userId;
    }
    
    const projects = await Project.find(query)
      .populate('createdBy', 'name image email')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Project.countDocuments(query);
    
    res.status(200).json({
      success: true,
      projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
}

async function handleCreateProject(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const user = await UnifiedUser.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'uploads'),
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
      filter: ({ mimetype }) => {
        return mimetype === 'application/zip' || mimetype === 'application/x-rar-compressed' || mimetype === 'application/x-7z-compressed';
      }
    });
    
    const [fields, files] = await form.parse(req);
    
    const projectFile = Array.isArray(files.projectFile) ? files.projectFile[0] : files.projectFile;
    
    if (!projectFile) {
      return res.status(400).json({ success: false, message: 'Project file is required' });
    }
    
    const project = new Project({
      title: Array.isArray(fields.title) ? fields.title[0] : fields.title,
      description: Array.isArray(fields.description) ? fields.description[0] : fields.description,
      category: Array.isArray(fields.category) ? fields.category[0] : fields.category,
      techStack: JSON.parse(Array.isArray(fields.techStack) ? fields.techStack[0] : fields.techStack || '[]'),
      features: JSON.parse(Array.isArray(fields.features) ? fields.features[0] : fields.features || '[]'),
      requirements: JSON.parse(Array.isArray(fields.requirements) ? fields.requirements[0] : fields.requirements || '{}'),
      version: Array.isArray(fields.version) ? fields.version[0] : fields.version || '1.0.0',
      projectFile: {
        originalName: projectFile.originalFilename || 'project.zip',
        filename: projectFile.newFilename,
        size: projectFile.size,
        uploadedAt: new Date()
      },
      createdBy: user._id
    });
    
    await project.save();
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: await project.populate('createdBy', 'name image email')
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: 'Failed to create project' });
  }
}