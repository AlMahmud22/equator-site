import { withCors, withAuth } from '@/lib/middleware/auth'
import { getUserProfile } from '@/lib/controllers/authController'

export default withCors(withAuth(getUserProfile))
