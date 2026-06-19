import { useState, useEffect, useCallback } from 'react'
import { plansService } from '../services/api'

export function usePlans(operatorId) {
  const [plans, setPlans]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchPlans = useCallback(async () => {
    if (!operatorId) return
    try {
      setLoading(true)
      setError(null)
      const data = await plansService.getByOperator(operatorId)
      setPlans(data)
    } catch (err) {
      setError(err.message || 'Error al cargar planes')
    } finally {
      setLoading(false)
    }
  }, [operatorId])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  // Registra vista por plan, una vez por sesión por planId
  useEffect(() => {
    if (plans.length === 0) return
    plans.forEach((plan) => {
      const key = `viewed_plan_${plan.id}`
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1')
        plansService.recordView(plan.id).catch(() => {})
      }
    })
  }, [plans])

  return { plans, loading, error, refetch: fetchPlans }
}
