import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/modules/database/connection';
import RegisteredApp from '@/modules/database/models/RegisteredApp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Get clientId from path parameter
    const { clientId } = req.query;
    
    if (!clientId || typeof clientId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Client ID is required'
      });
    }
    
    // Find the app by client ID
    const app = await RegisteredApp.findOne({ clientId });
    
    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Return public app data
    return res.status(200).json({
      success: true,
      app: {
        name: app.name,
        description: app.description,
        logoUrl: app.logoUrl,
        websiteUrl: app.websiteUrl,
        isVerified: app.isVerified,
        appType: app.appType
      }
    });
  } catch (error) {
    console.error('App public info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
