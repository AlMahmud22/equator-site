import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import connectDB from '@/modules/database/connection'
import EnhancedUser from '@/modules/database/models/EnhancedUser'

interface DownloadRequest {
  productId: string
  productName: string
  fileSize?: number
  version?: string
}

interface ApiResponse {
  success: boolean
  message: string
  data?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    // Validate request body
    const { productId, productName, fileSize, version }: DownloadRequest = req.body

    if (!productId || !productName) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and name are required'
      })
    }

    // Connect to database
    await connectDB()

    // Find user
    const user = await EnhancedUser.findOne({ email: session.user.email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Track the download
    await user.trackDownload(productId, productName, fileSize, version)

    console.log(`📥 Download tracked: ${productName} by ${session.user.email}`)

    return res.status(200).json({
      success: true,
      message: 'Download tracked successfully',
      data: {
        productId,
        productName,
        downloadedAt: new Date(),
        totalDownloads: user.downloadLogs.length
      }
    })

  } catch (error) {
    console.error('Download tracking error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to track download'
    })
  }
}
