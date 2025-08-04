import { withCors } from '@/modules/auth/middleware/auth'
import { registerUser } from '@/modules/auth/services/authController'

export default withCors(registerUser)

