import { describe, expect, it } from 'vitest'
import { defaultExpenseValues } from '../../expense-form/defaultValues'
import { toPrintableFields } from './fieldFormatters'

describe('toPrintableFields', () => {
  it('formatea duracion con singular y plural', () => {
    const singular = toPrintableFields({
      ...defaultExpenseValues,
      tripDurationDays: 1,
      totalKm: 10,
    })

    const plural = toPrintableFields({
      ...defaultExpenseValues,
      tripDurationDays: 3,
      totalKm: 10,
    })

    expect(singular.tripDurationDays).toBe('1 día')
    expect(plural.tripDurationDays).toBe('3 días')
  })

  it('muestra kilometros en PDF aunque no haya vehiculo propio y no muestra importe de vehiculo', () => {
    const printable = toPrintableFields({
      ...defaultExpenseValues,
      ownVehicleChecked: false,
      totalKm: 145,
      ownVehicleAmount: 0,
    })

    expect(printable.totalKm).toBe('145')
    expect(printable.ownVehicleAmount).toBe('')
  })
})
