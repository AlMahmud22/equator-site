import { withCors } from '@/lib/middleware/auth'
import { oauthLogin } from '@/lib/controllers/oauthController'

export default withCors(oauthLogin)
