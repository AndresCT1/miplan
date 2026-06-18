import { useState, useEffect } from 'react'
import { plansService } from '../services/api'

export function useFeaturedPlans() {
  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    plansService.getFeatured()
      .then(setPlans)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { plans, loading, error }
}
