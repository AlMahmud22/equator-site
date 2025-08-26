import { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '@/modules/database/connection'
import UnifiedUser from '@/lib/auth/unified-user-model'
import { requireAdmin } from '@/lib/auth/admin-utils'
import crypto from 'crypto'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}

// Generate secure API key
function generateApiKey(): { keyId: string; apiKey: string; keyHash: string } {
  const keyId = `ek_${crypto.randomBytes(8).toString('hex')}`
  const apiKey = `${keyId}_${crypto.randomBytes(32).toString('hex')}`
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
  
  return { keyId, apiKey, keyHash }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // Only allow admin access to API keys
    const session = await requireAdmin(req, res)
    if (!session || !session.user?.email) return

    await connectDB()

    const user = await UnifiedUser.findOne({ email: session.user.email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (req.method === 'GET') {
      // Get all API keys (without actual key values)
      try {
        const apiKeys = user.apiKeys.map((key: any) => ({
          keyId: key.keyId,
          name: key.name,
          permissions: key.permissions,
          createdAt: key.createdAt,
          lastUsedAt: key.lastUsedAt,
          expiresAt: key.expiresAt,
          isActive: key.isActive
        }))

        return res.status(200).json({
          success: true,
          message: 'API keys retrieved successfully',
          data: { apiKeys }
        })
      } catch (error) {
        console.error('API keys fetch error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch API keys'
        })
      }
    }

    if (req.method === 'POST') {
      // Create new API key
      try {
        const { name, permissions, expiresInDays } = req.body

        // Validation
        if (!name || typeof name !== 'string' || name.length > 100) {
          return res.status(400).json({
            success: false,
            message: 'Invalid key name',
            errors: [{ field: 'name', message: 'Key name is required and must be under 100 characters' }]
          })
        }

        const validPermissions = ['read', 'write', 'delete', 'admin']
        const keyPermissions = Array.isArray(permissions) 
          ? permissions.filter(p => validPermissions.includes(p))
          : ['read']

        // Check if user already has maximum number of keys (10)
        if (!user.apiKeys) user.apiKeys = []
        const activeKeys = user.apiKeys.filter((k: any) => k.isActive)
        if (activeKeys.length >= 10) {
          return res.status(400).json({
            success: false,
            message: 'Maximum number of API keys reached (10)',
            errors: [{ field: 'limit', message: 'Please delete unused keys before creating new ones' }]
          })
        }

        // Generate API key
        const { keyId, apiKey, keyHash } = generateApiKey()

        // Set expiration date
        let expiresAt
        if (expiresInDays && expiresInDays > 0 && expiresInDays <= 365) {
          expiresAt = new Date(Date.now() + (expiresInDays * 24 * 60 * 60 * 1000))
        }

        // Add to user's API keys
        user.apiKeys.push({
          keyId,
          name: name.trim(),
          keyHash,
          permissions: keyPermissions,
          createdAt: new Date(),
          expiresAt,
          isActive: true
        })

        await user.save()

        return res.status(201).json({
          success: true,
          message: 'API key created successfully',
          data: {
            keyId,
            apiKey, // Only return the actual key once during creation
            name: name.trim(),
            permissions: keyPermissions,
            expiresAt
          }
        })
      } catch (error) {
        console.error('API key creation error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to create API key'
        })
      }
    }

    if (req.method === 'DELETE') {
      // Delete/deactivate API key
      try {
        const { keyId } = req.query

        if (!keyId || typeof keyId !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'Key ID is required'
          })
        }

        const keyIndex = user.apiKeys.findIndex((k: any) => k.keyId === keyId)
        if (keyIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'API key not found'
          })
        }

        // Deactivate the key instead of removing it (for audit trail)
        user.apiKeys[keyIndex].isActive = false
        await user.save()

        return res.status(200).json({
          success: true,
          message: 'API key deactivated successfully'
        })
      } catch (error) {
        console.error('API key deletion error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to delete API key'
        })
      }
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  } catch (error) {
    console.error('API keys API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
