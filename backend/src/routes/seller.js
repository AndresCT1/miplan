import { Router } from 'express'
import {
  sellerLogin, sellerLogout, sellerGetMe, sellerDashboard,
  sellerCatalog, sellerGetSales, sellerCreateSale,
  sellerUpdateSale, sellerMarkContacted,
} from '../controllers/sellerController.js'
import {
  handleGetClients, handleCreateClient,
  handleGetClientStats, handleUpdateClientNotes, handleGetPayments,
} from '../controllers/sellerClientController.js'
import {
  handleGetProspects, handleCreateProspect,
  handleUpdateProspectStatus, handleUpdateProspectNextContact,
  handleIncrementAttempt, handleConvertProspect,
  handleGetConversionStats, handleGetProjection,
} from '../controllers/sellerProspectController.js'
import {
  handleGetProfile, handleUpdateProfile, handleTestNotification,
} from '../controllers/sellerProfileController.js'
import { requireSellerAuth }  from '../middleware/sellerAuth.js'
import { sellerLoginLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// Auth
router.post('/login',               sellerLoginLimiter, sellerLogin)
router.post('/logout',                                  sellerLogout)
router.get ('/me',                  requireSellerAuth,  sellerGetMe)

// Dashboard
router.get ('/dashboard',           requireSellerAuth,  sellerDashboard)

// Catalog
router.get ('/catalog',             requireSellerAuth,  sellerCatalog)

// Legacy sales (kept for backward compat)
router.get ('/sales',               requireSellerAuth,  sellerGetSales)
router.post('/sales',               requireSellerAuth,  sellerCreateSale)
router.put ('/sales/:id',           requireSellerAuth,  sellerUpdateSale)
router.post('/sales/:id/contacted', requireSellerAuth,  sellerMarkContacted)

// Profile
router.get ('/profile',             requireSellerAuth,  handleGetProfile)
router.put ('/profile',             requireSellerAuth,  handleUpdateProfile)
router.post('/profile/test-notification', requireSellerAuth, handleTestNotification)

// Clients
router.get ('/clients',             requireSellerAuth,  handleGetClients)
router.post('/clients',             requireSellerAuth,  handleCreateClient)
router.get ('/clients/stats',       requireSellerAuth,  handleGetClientStats)
router.get ('/clients/payments',    requireSellerAuth,  handleGetPayments)
router.put ('/clients/:id/notes',   requireSellerAuth,  handleUpdateClientNotes)

// Prospects
router.get ('/prospects',                    requireSellerAuth,  handleGetProspects)
router.post('/prospects',                    requireSellerAuth,  handleCreateProspect)
router.get ('/prospects/conversion-stats',   requireSellerAuth,  handleGetConversionStats)
router.get ('/prospects/projection',         requireSellerAuth,  handleGetProjection)
router.put ('/prospects/:id/status',         requireSellerAuth,  handleUpdateProspectStatus)
router.put ('/prospects/:id/next-contact',   requireSellerAuth,  handleUpdateProspectNextContact)
router.put ('/prospects/:id/attempt',        requireSellerAuth,  handleIncrementAttempt)
router.post('/prospects/:id/convert',        requireSellerAuth,  handleConvertProspect)

export default router
