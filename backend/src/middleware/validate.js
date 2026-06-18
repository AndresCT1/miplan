import { body, validationResult } from 'express-validator'

const rejectOnErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      data: null,
      error: errors.array()[0].msg,
    })
  }
  next()
}

export const validateLead = [
  body('dni')
    .matches(/^\d{8}$/)
    .withMessage('DNI debe tener exactamente 8 dígitos numéricos'),

  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nombre debe tener al menos 3 caracteres'),

  body('address')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Dirección debe tener al menos 10 caracteres'),

  body('phone')
    .matches(/^9\d{8}$/)
    .withMessage('Celular debe empezar con 9 y tener exactamente 9 dígitos'),

  body('operatorId')
    .isInt({ min: 1 })
    .withMessage('operatorId debe ser un entero positivo'),

  body('planId')
    .isInt({ min: 1 })
    .withMessage('planId debe ser un entero positivo'),

  rejectOnErrors,
]
