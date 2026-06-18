import { Router } from 'express'
import { getPlansByOperator, comparePlans } from '../controllers/planController.js'

const router = Router()

// /compare DEBE ir antes de /:operatorId para que Express no lo trate como un id
router.get('/compare', comparePlans)
router.get('/:operatorId', getPlansByOperator)

export default router
