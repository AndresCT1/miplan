import { Router } from 'express'
import {
  getPlansByOperator,
  comparePlans,
  getFeaturedPlans,
  registerPlanView,
  getPlanViewsToday,
} from '../controllers/planController.js'
import { viewsLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// Rutas literales SIEMPRE antes de /:param para evitar colisiones
router.get('/featured',          getFeaturedPlans)
router.get('/compare',           comparePlans)
router.get('/:operatorId',       getPlansByOperator)
router.post('/:id/view',         viewsLimiter, registerPlanView)
router.get('/:id/views-today',   getPlanViewsToday)

export default router
