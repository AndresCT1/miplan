import { Router } from 'express'
import {
  login,
  logout,
  getMe,
  adminGetLeads,
  adminUpdateLeadStatus,
  adminGetStats,
} from '../controllers/adminController.js'
import { requireAuth }  from '../middleware/auth.js'
import { loginLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.post('/login',             loginLimiter, login)
router.post('/logout',                         logout)
router.get ('/me',                requireAuth,  getMe)
router.get ('/leads',             requireAuth,  adminGetLeads)
router.put ('/leads/:id/status',  requireAuth,  adminUpdateLeadStatus)
router.get ('/stats',             requireAuth,  adminGetStats)

export default router
