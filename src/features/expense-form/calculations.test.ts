import { describe, expect, it } from 'vitest'
import { computeDerivedValues } from './calculations'
import { defaultExpenseValues } from './defaultValues'

describe('computeDerivedValues', () => {
  it('no calcula importe de vehiculo cuando no esta marcado vehiculo propio', () => {
    const result = computeDerivedValues({
      ...defaultExpenseValues,
      ownVehicleChecked: false,
      totalKm: 200,
      mealDays: 1,
      hasOvernightRight: false,
    })

    expect(result.ownVehicleAmount).toBe(0)
    expect(result.mealAmountPerDay).toBe(10)
    expect(result.mealTotal).toBe(10)
  })

  it('calcula importe de vehiculo cuando esta marcado vehiculo propio', () => {
    const result = computeDerivedValues({
      ...defaultExpenseValues,
      ownVehicleChecked: true,
      totalKm: 200,
      mealDays: 1,
      hasOvernightRight: false,
    })

    expect(result.ratePerKm).toBe(0.26)
    expect(result.ownVehicleAmount).toBe(52)
  })
})
