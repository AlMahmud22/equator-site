import { withCors } from '@/modules/auth/middleware/auth'
import { loginUser } from '@/modules/auth/services/authController'

export default withCors(loginUser)

