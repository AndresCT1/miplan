import { Router }     from 'express'
import { handleChat } from '../controllers/chatController.js'
import { chatLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.post('/', chatLimiter, handleChat)

export default router
