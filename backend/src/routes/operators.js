import { Router } from 'express'
import { getAllOperators } from '../controllers/operatorController.js'

const router = Router()

router.get('/', getAllOperators)

export default router
