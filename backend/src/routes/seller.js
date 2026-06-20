import { Router } from 'express'
import {
  sellerLogin,
  sellerLogout,
  sellerGetMe,
  sellerDashboard,
  sellerCatalog,
  sellerGetSales,
  sellerCreateSale,
  sellerUpdateSale,
  sellerMarkContacted,
} from '../controllers/sellerController.js'
import { requireSellerAuth }  from '../middleware/sellerAuth.js'
import { sellerLoginLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.post('/login',              sellerLoginLimiter, sellerLogin)
router.post('/logout',                                 sellerLogout)
router.get ('/me',                 requireSellerAuth,  sellerGetMe)
router.get ('/dashboard',          requireSellerAuth,  sellerDashboard)
router.get ('/catalog',            requireSellerAuth,  sellerCatalog)
router.get ('/sales',              requireSellerAuth,  sellerGetSales)
router.post('/sales',              requireSellerAuth,  sellerCreateSale)
router.put ('/sales/:id',          requireSellerAuth,  sellerUpdateSale)
router.post('/sales/:id/contacted',requireSellerAuth,  sellerMarkContacted)

export default router
