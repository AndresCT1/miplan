import { Router } from 'express'
import { getPlansByOperator, comparePlans, getFeaturedPlans } from '../controllers/planController.js'

const router = Router()

// Rutas literales SIEMPRE antes de /:param para evitar colisiones
router.get('/featured', getFeaturedPlans)
router.get('/compare',  comparePlans)
router.get('/:operatorId', getPlansByOperator)

export default router
