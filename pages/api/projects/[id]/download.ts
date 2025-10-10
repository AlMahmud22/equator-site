import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/modules/database/connection';
import Project from '@/models/Project';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  await connectToDatabase();
  
  try {
    const { id } = req.query;
    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    const filePath = path.join(process.cwd(), 'uploads', project.projectFile.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    // Increment download count
    await project.incrementDownloads();
    
    const fileBuffer = fs.readFileSync(filePath);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${project.projectFile.originalName}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading project:', error);
    res.status(500).json({ success: false, message: 'Failed to download project' });
  }
}