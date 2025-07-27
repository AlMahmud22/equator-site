import { withCors, withAuth } from '@/lib/middleware/auth'
import { updateHuggingFaceToken } from '@/lib/controllers/oauthController'

export default withCors(withAuth(updateHuggingFaceToken))
