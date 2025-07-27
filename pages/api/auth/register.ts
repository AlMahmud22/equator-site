import { withCors } from '@/lib/middleware/auth'
import { registerUser } from '@/lib/controllers/authController'

export default withCors(registerUser)
