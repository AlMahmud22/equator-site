import { withCors } from '@/lib/middleware/auth'
import { loginUser } from '@/lib/controllers/authController'

export default withCors(loginUser)
