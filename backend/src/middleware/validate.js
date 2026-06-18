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
  // Requeridos
  body('phone')
    .matches(/^9\d{8}$/)
    .withMessage('El celular debe empezar con 9 y tener exactamente 9 dígitos'),

  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('El nombre debe tener al menos 3 caracteres'),

  // Opcionales — solo se validan si vienen en el body
  body('dni')
    .optional({ values: 'falsy' })
    .matches(/^\d{8}$/)
    .withMessage('DNI debe tener exactamente 8 dígitos numéricos'),

  body('address')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 10 })
    .withMessage('La dirección debe tener al menos 10 caracteres'),

  rejectOnErrors,
]
