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

  return { plans, loading, error, refetch: fetchPlans }
}
