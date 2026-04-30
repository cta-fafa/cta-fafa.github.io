import type { ExpenseFormValues } from '../../types/expense'
import { FIXED_RATE_PER_KM } from './allowances'

export const DEFAULT_RATE_PER_KM = FIXED_RATE_PER_KM

export const defaultExpenseValues: ExpenseFormValues = {
  fullName: '',
  dni: '',
  role: 'Arbitro',
  travelReason: '',
  place: '',
  country: 'Espana',
  tripDurationDays: 1,
  tripDate: '',

  regularTransportTrainChecked: false,
  regularTransportTrainAmount: 0,
  regularTransportPlaneChecked: false,
  regularTransportPlaneAmount: 0,
  regularTransportBusChecked: false,
  regularTransportBusAmount: 0,
  regularTransportOtherChecked: false,
  regularTransportOtherAmount: 0,

  ownVehicleChecked: true,
  vehicleOwnerIsReferee: false,
  vehiclePlate: '',
  vehicleOwner: '',
  route: '',
  totalKm: 0,
  ratePerKm: DEFAULT_RATE_PER_KM,
  ownVehicleAmount: 0,

  tollOutward: 0,
  tollReturn: 0,
  tollAmount: 0,

  mealDays: 1,
  mealAmountPerDay: 0,
  mealTotal: 0,
  hasOvernightRight: false,
  overnightAmount: 0,
  hotelAmountPerDay: 0,
  hotelTotal: 0,

  totalExpenses: 0,
  iban: '',
  email: '',
}
