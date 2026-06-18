import { Router } from 'express'
import { createLead } from '../controllers/leadController.js'
import { validateLead } from '../middleware/validate.js'
import { leadsLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.post('/', leadsLimiter, validateLead, createLead)

export default router
