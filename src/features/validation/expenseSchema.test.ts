import { describe, expect, it } from 'vitest'
import { computeDerivedValues } from '../expense-form/calculations'
import { defaultExpenseValues } from '../expense-form/defaultValues'
import { expenseSchema } from './expenseSchema'

const buildValidExpense = () =>
  computeDerivedValues({
    ...defaultExpenseValues,
    fullName: 'Juan Perez Garcia',
    dni: '00000000T',
    role: 'Arbitro',
    travelReason: 'Partido oficial',
    place: 'Sevilla',
    country: 'Espana',
    tripDurationDays: 1,
    tripDate: '2026-04-30',
    ownVehicleChecked: false,
    vehicleOwnerIsReferee: false,
    vehiclePlate: '',
    vehicleOwner: '',
    route: '',
    totalKm: 120,
    mealDays: 1,
    hasOvernightRight: false,
    iban: 'ES7600190020961234567890',
    email: 'arbitro@example.com',
  })

describe('expenseSchema', () => {
  it('permite no informar matricula ni propietario cuando no se usa vehiculo propio', () => {
    const parsed = expenseSchema.safeParse(buildValidExpense())
    expect(parsed.success).toBe(true)
  })

  it('exige kilometros aunque no haya vehiculo propio', () => {
    const parsed = expenseSchema.safeParse(
      buildValidExpense(),
    )

    expect(parsed.success).toBe(true)

    const withoutKm = expenseSchema.safeParse({
      ...buildValidExpense(),
      totalKm: 0,
    })

    expect(withoutKm.success).toBe(false)
    if (!withoutKm.success) {
      expect(withoutKm.error.issues.some((issue) => issue.path[0] === 'totalKm')).toBe(true)
    }
  })

  it('exige matricula y propietario cuando se marca vehiculo propio', () => {
    const parsed = expenseSchema.safeParse(
      computeDerivedValues({
        ...buildValidExpense(),
        ownVehicleChecked: true,
        vehiclePlate: '',
        vehicleOwner: '',
        route: 'Cadiz - Sevilla',
      }),
    )

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const paths = parsed.error.issues.map((issue) => issue.path[0])
      expect(paths).toContain('vehiclePlate')
      expect(paths).toContain('vehicleOwner')
    }
  })
})
