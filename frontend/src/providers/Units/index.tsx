'use client'

import React, { createContext, use, useCallback, useEffect, useState } from 'react'

import type { GasUnitSystem } from '@/utilities/units'

const STORAGE_KEY = 'vacamuerta-gas-units'
const DEFAULT_GAS_UNIT: GasUnitSystem = 'metric'

type UnitsContextType = {
  gasUnit: GasUnitSystem
  setGasUnit: (unit: GasUnitSystem) => void
}

const UnitsContext = createContext<UnitsContextType>({
  gasUnit: DEFAULT_GAS_UNIT,
  setGasUnit: () => null,
})

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  // Start from the default on both server and first client render (avoids a
  // hydration mismatch); reconcile with the saved preference in an effect.
  const [gasUnit, setGasUnitState] = useState<GasUnitSystem>(DEFAULT_GAS_UNIT)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'metric' || saved === 'imperial') setGasUnitState(saved)
  }, [])

  const setGasUnit = useCallback((unit: GasUnitSystem) => {
    setGasUnitState(unit)
    try {
      window.localStorage.setItem(STORAGE_KEY, unit)
    } catch {}
  }, [])

  return <UnitsContext value={{ gasUnit, setGasUnit }}>{children}</UnitsContext>
}

export const useUnits = (): UnitsContextType => use(UnitsContext)
