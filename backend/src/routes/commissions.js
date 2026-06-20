import { Router } from 'express'
import { getCommissions, updateCommission } from '../controllers/commissionController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/',                requireAuth, getCommissions)
router.put('/:operatorId',     requireAuth, updateCommission)

export default router
