export const FIXED_RATE_PER_KM = 0.26

export const FIXED_OVERNIGHT_AMOUNT = 40.82

// Ajusta estos tramos segun la tabla oficial de dietas de la federacion.
const MEAL_ALLOWANCE_BY_KM: Array<{ minKm: number; maxKm?: number; amountPerDay: number }> = [
  { minKm: 0, maxKm: 50, amountPerDay: 0 },
  { minKm: 51, maxKm: 100, amountPerDay: 3 },
  { minKm: 101, maxKm: 250, amountPerDay: 10 },
  { minKm: 251, maxKm: 450, amountPerDay: 15 },
  { minKm: 451, maxKm: 550, amountPerDay: 18 },
  { minKm: 551, maxKm: 675, amountPerDay: 26.67 },
  { minKm: 676, amountPerDay: 26.67 },
]

export const resolveMealAllowancePerDay = (km: number): number => {
  const safeKm = Number.isFinite(km) ? Math.max(0, km) : 0

  const bracket = MEAL_ALLOWANCE_BY_KM.find((item) => {
    if (typeof item.maxKm === 'number') {
      return safeKm >= item.minKm && safeKm <= item.maxKm
    }
    return safeKm >= item.minKm
  })

  return bracket?.amountPerDay ?? 0
}
