import { createContext, useContext, useState, useCallback } from 'react'

const CompareContext = createContext(null)

const MAX_PLANS    = 3
const STORAGE_KEY  = 'miplan_compare'

function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

export function CompareProvider({ children }) {
  const [selectedPlans, setSelectedPlans] = useState(loadSession)

  const persist = (plans) => {
    setSelectedPlans(plans)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
  }

  const addPlan = useCallback((plan) => {
    setSelectedPlans((prev) => {
      if (prev.length >= MAX_PLANS || prev.some((p) => p.id === plan.id)) return prev
      const next = [...prev, plan]
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removePlan = useCallback((planId) => {
    setSelectedPlans((prev) => {
      const next = prev.filter((p) => p.id !== planId)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearPlans = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setSelectedPlans([])
  }, [])

  const isPlanSelected = useCallback(
    (planId) => selectedPlans.some((p) => p.id === planId),
    [selectedPlans],
  )

  return (
    <CompareContext.Provider value={{ selectedPlans, addPlan, removePlan, clearPlans, isPlanSelected }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
