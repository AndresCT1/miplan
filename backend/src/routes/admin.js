import { Router } from 'express'
import {
  login,
  logout,
  getMe,
  adminGetLeads,
  adminUpdateLeadStatus,
  adminGetStats,
  adminListSellers,
  adminCreateSellerHandler,
  adminUpdateSellerHandler,
  adminResetSellerPasswordHandler,
  adminDeactivateSellerHandler,
} from '../controllers/adminController.js'
import { requireAuth }                           from '../middleware/auth.js'
import { loginLimiter, resetPasswordLimiter }    from '../middleware/rateLimiter.js'

const router = Router()

// Auth
router.post('/login',             loginLimiter, login)
router.post('/logout',                         logout)
router.get ('/me',                requireAuth,  getMe)

// Leads
router.get ('/leads',             requireAuth,  adminGetLeads)
router.put ('/leads/:id/status',  requireAuth,  adminUpdateLeadStatus)

// Stats
router.get ('/stats',             requireAuth,  adminGetStats)

// Seller management
router.get ('/sellers',                          requireAuth,                adminListSellers)
router.post('/sellers',                          requireAuth,                adminCreateSellerHandler)
router.put ('/sellers/:id',                      requireAuth,                adminUpdateSellerHandler)
router.put ('/sellers/:id/reset-password',       requireAuth, resetPasswordLimiter, adminResetSellerPasswordHandler)
router.delete('/sellers/:id',                    requireAuth,                adminDeactivateSellerHandler)

export default router
