import { defaultExpenseValues } from './defaultValues'
import { computeDerivedValues } from './calculations'
import type { ExpenseFormValues } from '../../types/expense'

export const exampleExpenseData: ExpenseFormValues = computeDerivedValues({
  ...defaultExpenseValues,
  fullName: 'Juan Perez Garcia',
  dni: '12345678A',
  role: 'Arbitro',
  travelReason: 'Partido liga FAFA Sevilla vs Malaga',
  place: 'Sevilla',
  country: 'Espana',
  tripDurationDays: 1,
  tripDate: '2026-04-29',

  regularTransportTrainChecked: false,
  regularTransportPlaneChecked: false,
  regularTransportBusChecked: false,
  regularTransportOtherChecked: false,

  ownVehicleChecked: true,
  vehicleOwnerIsReferee: true,
  vehiclePlate: '1234ABC',
  vehicleOwner: 'Juan Perez Garcia',
  route: 'Cadiz - Sevilla - Cadiz',
  totalKm: 238,
  ratePerKm: 0.26,

  tollOutward: 8.4,
  tollReturn: 8.4,

  mealDays: 1,
  mealAmountPerDay: 20,
  hasOvernightRight: false,
  overnightAmount: 0,
  hotelAmountPerDay: 0,

  iban: 'ES7600190020961234567890',
  email: 'arbitro@example.com',
})
