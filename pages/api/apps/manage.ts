import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { isAdmin } from '@/lib/auth/admin-utils'
import RegisteredApp from '@/lib/auth/registered-app-model'
import connectDB from '@/modules/database/connection'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    await connectDB()

    // Authentication required
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    const userIsAdmin = isAdmin(session.user.email, session.user.name || undefined)

    switch (req.method) {
      case 'GET':
        return await handleGetApps(req, res, session, userIsAdmin)
      case 'POST':
        return await handleCreateApp(req, res, session, userIsAdmin)
      case 'PUT':
        return await handleUpdateApp(req, res, session, userIsAdmin)
      case 'DELETE':
        return await handleDeleteApp(req, res, session, userIsAdmin)
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        })
    }
  } catch (error) {
    console.error('Apps management API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

async function handleGetApps(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  session: any,
  userIsAdmin: boolean
) {
  try {
    let query: any = {}

    // Normal users see only their apps, admins see all
    if (!userIsAdmin) {
      query.ownerId = session.user.email
    }

    const apps = await RegisteredApp.find(query)
      .select(userIsAdmin ? '' : '-clientSecret')
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Apps retrieved successfully',
      data: apps
    })
  } catch (error) {
    console.error('Error fetching apps:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch apps'
    })
  }
}

async function handleCreateApp(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  session: any,
  userIsAdmin: boolean
) {
  const {
    name,
    description,
    appType,
    platform,
    redirectUris,
    scopes = ['read', 'profile']
  } = req.body

  // Validation
  if (!name || !appType || !redirectUris || redirectUris.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, appType, redirectUris'
    })
  }

  try {
    const newApp = new RegisteredApp({
      name,
      description,
      appType,
      platform,
      redirectUris,
      scopes,
      ownerId: session.user.email,
      isApproved: userIsAdmin, // Auto-approve admin apps
      createdBy: session.user.email
    })

    await newApp.save()

    const responseData = {
      ...newApp.toObject(),
      clientSecret: userIsAdmin ? newApp.clientSecret : '***HIDDEN***'
    }

    return res.status(201).json({
      success: true,
      message: 'App registered successfully',
      data: responseData
    })
  } catch (error) {
    console.error('Error creating app:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create app'
    })
  }
}

async function handleUpdateApp(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  session: any,
  userIsAdmin: boolean
) {
  const { clientId } = req.query
  const updates = req.body

  if (!clientId) {
    return res.status(400).json({
      success: false,
      message: 'Client ID required'
    })
  }

  try {
    let query: any = { clientId }
    
    if (!userIsAdmin) {
      query.ownerId = session.user.email
    }

    const app = await RegisteredApp.findOne(query)
    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'App not found'
      })
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'redirectUris', 'scopes', 'isActive']
    if (userIsAdmin) {
      allowedUpdates.push('isApproved', 'platform')
    }

    const updateFields: any = {}
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateFields[key] = updates[key]
      }
    })

    updateFields.lastModifiedBy = session.user.email

    const updatedApp = await RegisteredApp.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true }
    ).select(userIsAdmin ? '' : '-clientSecret')

    return res.status(200).json({
      success: true,
      message: 'App updated successfully',
      data: updatedApp
    })
  } catch (error) {
    console.error('Error updating app:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to update app'
    })
  }
}

async function handleDeleteApp(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  session: any,
  userIsAdmin: boolean
) {
  const { clientId } = req.query

  if (!clientId) {
    return res.status(400).json({
      success: false,
      message: 'Client ID required'
    })
  }

  try {
    let query: any = { clientId }
    
    if (!userIsAdmin) {
      query.ownerId = session.user.email
    }

    const deletedApp = await RegisteredApp.findOneAndDelete(query)
    if (!deletedApp) {
      return res.status(404).json({
        success: false,
        message: 'App not found'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'App deleted successfully',
      data: { clientId: deletedApp.clientId }
    })
  } catch (error) {
    console.error('Error deleting app:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to delete app'
    })
  }
}
