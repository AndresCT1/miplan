import { useState, useEffect, useCallback } from 'react'
import { operatorsService } from '../services/api'

export function useOperators() {
  const [operators, setOperators] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const fetchOperators = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await operatorsService.getAll()
      setOperators(data)
    } catch (err) {
      setError(err.message || 'Error al cargar operadores')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOperators() }, [fetchOperators])

  return { operators, loading, error, refetch: fetchOperators }
}
