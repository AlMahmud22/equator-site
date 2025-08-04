import { withCors, withAuth } from '@/modules/auth/middleware/auth'
import { updateHuggingFaceToken } from '@/modules/auth/services/oauthController'

export default withCors(withAuth(updateHuggingFaceToken))

